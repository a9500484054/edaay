<template>
  <div class="page">
    <HeaderBar />
    <main class="container">
      <header class="page-header">
        <div class="header-content">
          <div>
            <h1>Списки покупок</h1>
            <p class="subtitle">Создавайте и управляйте списками покупок</p>
          </div>
          <button class="btn btn--primary" @click="createNewList">
            <Icon icon="mdi:plus" class="icon" />
            Создать список
          </button>
        </div>
      </header>

      <!-- Список всех списков -->
      <div v-if="allLists.length === 0" class="empty-state">
        <Icon icon="mdi:format-list-checks" class="empty-icon" />
        <h2>У вас пока нет списков покупок</h2>
        <p>Создайте первый список для планирования покупок</p>
        <button class="btn btn--primary" @click="createNewList">
          <Icon icon="mdi:plus" class="icon" />
          Создать первый список
        </button>
      </div>

      <div v-else class="lists-grid">
        <div 
          v-for="list in allLists" 
          :key="list.id"
          class="list-card"
          @click="openList(list.id)"
        >
          <div class="list-card-header">
            <h3 class="list-card-title">{{ list.name }}</h3>
            <button 
              class="delete-list-btn" 
              @click.stop="confirmDeleteList(list.id)"
              title="Удалить список"
            >
              <Icon icon="mdi:delete-outline" class="icon-sm" />
            </button>
          </div>

          <div class="list-card-stats">
            <div class="stat">
              <Icon icon="mdi:cart-outline" class="icon-sm" />
              <span>{{ list.items.length }} товаров</span>
            </div>
            <div class="stat">
              <Icon icon="mdi:check" class="icon-sm" />
              <span>{{ getCompletedCount(list) }} куплено</span>
            </div>
          </div>

          <div class="list-card-footer">
            <span class="list-date">{{ formatDate(list.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Активный список -->
      <div v-if="selectedList" class="active-list-section">
        <div class="section-header">
          <button class="back-btn" @click="selectedList = null">
            <Icon icon="mdi:arrow-left" class="icon" />
            К спискам
          </button>
          <div class="actions">
            <button class="btn btn--secondary" @click="clearCompleted">
              <Icon icon="mdi:check-all" class="icon" />
              Очистить купленное
            </button>
            <button class="btn btn--secondary" @click="confirmDeleteList(selectedList.id)">
              <Icon icon="mdi:delete-outline" class="icon" />
              Удалить список
            </button>
          </div>
        </div>

        <ShoppingListView 
          :list-id="selectedList.id"
          :list-name="selectedList.name"
          :items="selectedList.items"
          @update:items="updateListItems"
          @update:name="updateListName"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBar from '@/widgets/header/index.vue'
import ShoppingListView from '@/widgets/shopping-list/ui/shopping-list-view.vue'
import { useShoppingStore } from '@/entities/shopping/model/shopping.store'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const shoppingStore = useShoppingStore()

const selectedList = ref(null)

const allLists = computed(() => shoppingStore.allLists)

onMounted(() => {
  // Импорт из планировщика
  if (route.query.fromPlanner === '1') {
    importFromPlanner()
  }
  
  // Открыть конкретный список, если указан в query
  if (route.query.listId) {
    const listId = Number(route.query.listId)
    openList(listId)
  }
})

const createNewList = () => {
  const name = prompt('Название списка:')
  if (!name) return
  
  const newList = shoppingStore.createList(name.trim())
  openList(newList.id)
}

const openList = (id) => {
  const list = shoppingStore.getListById(id)
  if (list) {
    selectedList.value = list
    router.push({ query: { listId: id } })
  }
}

const updateListItems = (items) => {
  if (selectedList.value) {
    shoppingStore.updateListItems(selectedList.value.id, items)
  }
}

const updateListName = (newName) => {
  if (selectedList.value) {
    shoppingStore.updateList(selectedList.value.id, { name: newName })
  }
}

const clearCompleted = () => {
  if (!selectedList.value) return
  if (!confirm('Удалить все купленные товары?')) return
  
  const filtered = selectedList.value.items.filter(i => !i.completed)
  updateListItems(filtered)
}

const confirmDeleteList = (id) => {
  const list = shoppingStore.getListById(id)
  if (!list) return
  
  if (!confirm(`Удалить список "${list.name}"?`)) return
  
  shoppingStore.deleteList(id)
  if (selectedList.value?.id === id) {
    selectedList.value = null
    router.push({ query: {} })
  }
}

const getCompletedCount = (list) => {
  return list.items.filter(i => i.completed).length
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const importFromPlanner = () => {
  try {
    const ingredientsStr = localStorage.getItem('plannerIngredients')
    if (!ingredientsStr) return
    
    const ingredients = JSON.parse(ingredientsStr)
    
    const items = ingredients.map(ing => ({
      id: Date.now() + Math.random(),
      name: ing.name,
      amount: ing.amount,
      category: detectCategory(ing.name),
      completed: false
    }))
    
    const list = shoppingStore.createList('Из планировщика', items)
    openList(list.id)
    localStorage.removeItem('plannerIngredients')
  } catch (e) {
    console.error('Failed to import from planner:', e)
  }
}

const detectCategory = (name) => {
  const lower = name.toLowerCase()
  if (/(огурец|помидор|лук|морковь|капуста|свекла|яблок|банан|апельсин)/i.test(lower)) return 'vegetables'
  if (/(курица|говядина|свинина|бекон|мясо|фарш)/i.test(lower)) return 'meat'
  if (/(молоко|сметана|йогурт|творог|сыр|масло)/i.test(lower)) return 'dairy'
  if (/(хлеб|батон|булочк|тесто)/i.test(lower)) return 'bakery'
  if (/(рис|гречка|макарон|спагетти|паста|мука)/i.test(lower)) return 'grains'
  if (/(соль|перец|специ|пряност|уксус)/i.test(lower)) return 'spices'
  if (/(вода|сок|чай|кофе|лимонад)/i.test(lower)) return 'drinks'
  return 'other'
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f9fafb; }
.container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 32px; }
.header-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.page-header h1 { margin: 0 0 6px; font-size: 36px; }
.subtitle { color: #6b7280; margin: 0; font-size: 16px; }

.btn { height: 40px; border-radius: 8px; border: none; display: inline-flex; align-items: center; gap: 8px; padding: 0 16px; cursor: pointer; font-weight: 500; }
.btn--primary { background: #22c55e; color: #fff; }
.btn--primary:hover { background: #16a34a; }
.btn--secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
.btn--secondary:hover { background: #f9fafb; }
.icon { width: 18px; height: 18px; }
.icon-sm { width: 16px; height: 16px; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { width: 80px; height: 80px; color: #d1d5db; margin-bottom: 20px; }
.empty-state h2 { margin: 0 0 12px; font-size: 24px; color: #374151; }
.empty-state p { color: #6b7280; margin: 0 0 24px; }

.lists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px; }

.list-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; }
.list-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); transform: translateY(-2px); }
.list-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.list-card-title { margin: 0; font-size: 18px; }
.delete-list-btn { width: 28px; height: 28px; border: none; border-radius: 6px; background: transparent; display: grid; place-items: center; cursor: pointer; color: #9ca3af; }
.delete-list-btn:hover { background: #fee2e2; color: #ef4444; }

.list-card-stats { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.stat { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 14px; }

.list-card-footer { padding-top: 12px; border-top: 1px solid #f3f4f6; }
.list-date { font-size: 12px; color: #9ca3af; }

.active-list-section { margin-top: 32px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; color: #15803d; cursor: pointer; font-weight: 500; }
.back-btn:hover { text-decoration: underline; }
.actions { display: flex; gap: 10px; }

@media (max-width: 768px) {
  .header-content { flex-direction: column; align-items: stretch; }
  .section-header { flex-direction: column; align-items: stretch; }
  .actions { flex-direction: column; }
}
</style>
