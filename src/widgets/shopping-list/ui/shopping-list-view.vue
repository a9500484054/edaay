<template>
  <div class="shopping-list-view">
    <!-- Заголовок списка -->
    <header class="list-header">
      <div class="list-title-section">
        <input 
          v-if="isEditingName"
          v-model="editedName"
          class="title-input"
          @blur="saveListName"
          @keydown.enter="saveListName"
          ref="titleInput"
        />
        <h2 v-else class="list-title" @click="startEditName">{{ listName }}</h2>
        <button class="edit-btn" @click="startEditName" title="Переименовать">
          <Icon icon="mdi:pencil" class="icon-sm" />
        </button>
      </div>
      <p class="list-stats">{{ statsText }}</p>
    </header>

    <!-- Быстрое добавление -->
    <div class="quick-add">
      <input 
        v-model="newItemName"
        class="quick-input" 
        type="text" 
        placeholder="Добавить товар..."
        @keydown.enter="addQuickItem"
      />
      <select v-model="newItemCategory" class="category-select">
        <option value="">Без категории</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <button class="btn btn--primary" @click="addQuickItem">
        <Icon icon="mdi:plus" class="icon" />
        Добавить
      </button>
    </div>

    <!-- Фильтры -->
    <div class="controls">
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          Все ({{ localItems.length }})
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filter === 'active' }"
          @click="filter = 'active'"
        >
          К покупке ({{ activeCount }})
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filter === 'completed' }"
          @click="filter = 'completed'"
        >
          Куплено ({{ completedCount }})
        </button>
      </div>

      <button class="sort-btn" @click="groupByCategory = !groupByCategory">
        <Icon icon="groupByCategory ? 'mdi:folder-outline' : 'mdi:view-list'" class="icon" />
        {{ groupByCategory ? 'По категориям' : 'Списком' }}
      </button>
    </div>

    <!-- Список товаров -->
    <div v-if="filteredItems.length === 0" class="empty-state">
      <Icon icon="mdi:cart-outline" class="empty-icon" />
      <h3>{{ emptyStateText }}</h3>
    </div>

    <!-- Сгруппированный вид -->
    <div v-else-if="groupByCategory" class="grouped-list">
      <section 
        v-for="category in categoriesWithItems" 
        :key="category.id"
        class="category-section"
      >
        <h4 class="category-title">
          <Icon icon="category.icon" class="icon" />
          {{ category.name }}
          <span class="count">({{ category.items.length }})</span>
        </h4>
        
        <div class="items-list">
          <div 
            v-for="item in category.items" 
            :key="item.id"
            class="item-card"
            :class="{ completed: item.completed }"
          >
            <label class="item-checkbox">
              <input 
                type="checkbox" 
                v-model="item.completed"
                @change="emitUpdate"
              />
              <span class="checkmark"></span>
            </label>

            <div class="item-content" @click="toggleItem(item)">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-meta" v-if="item.amount">{{ item.amount }}</div>
            </div>

            <button 
              class="item-delete" 
              @click="removeItem(item.id)"
              title="Удалить"
            >
              <Icon icon="mdi:delete-outline" class="icon-sm" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Простой список -->
    <div v-else class="simple-list">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="item-card"
        :class="{ completed: item.completed }"
      >
        <label class="item-checkbox">
          <input 
            type="checkbox" 
            v-model="item.completed"
            @change="emitUpdate"
          />
          <span class="checkmark"></span>
        </label>

        <div class="item-content" @click="toggleItem(item)">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">
            <span v-if="item.amount">{{ item.amount }}</span>
            <span v-if="item.category" class="category-badge">
              {{ getCategoryName(item.category) }}
            </span>
          </div>
        </div>

        <button 
          class="item-delete" 
          @click="removeItem(item.id)"
          title="Удалить"
        >
          <Icon icon="mdi:delete-outline" class="icon-sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  listId: { type: Number, required: true },
  listName: { type: String, required: true },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:items', 'update:name'])

const localItems = ref([...props.items])
const newItemName = ref('')
const newItemCategory = ref('')
const filter = ref('all')
const groupByCategory = ref(true)
const isEditingName = ref(false)
const editedName = ref(props.listName)
const titleInput = ref(null)

const categories = [
  { id: 'vegetables', name: 'Овощи и фрукты', icon: 'mdi:food-apple' },
  { id: 'meat', name: 'Мясо и птица', icon: 'mdi:food-drumstick' },
  { id: 'dairy', name: 'Молочные продукты', icon: 'mdi:cheese' },
  { id: 'bakery', name: 'Хлеб и выпечка', icon: 'mdi:baguette' },
  { id: 'grains', name: 'Крупы и макароны', icon: 'mdi:rice' },
  { id: 'spices', name: 'Специи и приправы', icon: 'mdi:shaker-outline' },
  { id: 'drinks', name: 'Напитки', icon: 'mdi:cup-outline' },
  { id: 'other', name: 'Прочее', icon: 'mdi:cart-outline' },
]

watch(() => props.items, (newVal) => {
  localItems.value = [...newVal]
}, { deep: true })

const filteredItems = computed(() => {
  if (filter.value === 'active') return localItems.value.filter(i => !i.completed)
  if (filter.value === 'completed') return localItems.value.filter(i => i.completed)
  return localItems.value
})

const categoriesWithItems = computed(() => {
  return categories
    .map(cat => ({
      ...cat,
      items: filteredItems.value.filter(item => item.category === cat.id)
    }))
    .filter(cat => cat.items.length > 0)
})

const activeCount = computed(() => localItems.value.filter(i => !i.completed).length)
const completedCount = computed(() => localItems.value.filter(i => i.completed).length)

const statsText = computed(() => {
  if (localItems.value.length === 0) return 'Список пуст'
  return `${activeCount.value} к покупке, ${completedCount.value} куплено`
})

const emptyStateText = computed(() => {
  if (filter.value === 'active') return 'Всё куплено!'
  if (filter.value === 'completed') return 'Нет купленных товаров'
  return 'Список пуст'
})

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

const addQuickItem = () => {
  const name = newItemName.value.trim()
  if (!name) return
  
  localItems.value.push({
    id: Date.now(),
    name,
    amount: '',
    category: newItemCategory.value || detectCategory(name),
    completed: false
  })
  
  newItemName.value = ''
  newItemCategory.value = ''
  emitUpdate()
}

const removeItem = (id) => {
  localItems.value = localItems.value.filter(i => i.id !== id)
  emitUpdate()
}

const toggleItem = (item) => {
  item.completed = !item.completed
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:items', localItems.value)
}

const startEditName = async () => {
  isEditingName.value = true
  editedName.value = props.listName
  await nextTick()
  titleInput.value?.focus()
}

const saveListName = () => {
  const newName = editedName.value.trim()
  if (newName && newName !== props.listName) {
    emit('update:name', newName)
  }
  isEditingName.value = false
}

const getCategoryName = (catId) => {
  return categories.find(c => c.id === catId)?.name || 'Прочее'
}
</script>

<style scoped>
/* Копируем стили из shopping-list.vue, адаптируем под виджет */
.shopping-list-view { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; }

.list-header { margin-bottom: 20px; }
.list-title-section { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.list-title { margin: 0; font-size: 24px; cursor: pointer; }
.list-title:hover { color: #22c55e; }
.title-input { font-size: 24px; font-weight: 600; border: none; border-bottom: 2px solid #22c55e; padding: 4px 0; outline: none; }
.edit-btn { width: 28px; height: 28px; border: none; border-radius: 6px; background: #f3f4f6; display: grid; place-items: center; cursor: pointer; color: #6b7280; }
.edit-btn:hover { background: #e5e7eb; }
.list-stats { margin: 0; color: #6b7280; font-size: 14px; }

.quick-add { display: flex; gap: 10px; margin-bottom: 16px; }
.quick-input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
.quick-input:focus { outline: none; border-color: #22c55e; }
.category-select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; cursor: pointer; }
.btn { height: 40px; border-radius: 8px; border: none; display: inline-flex; align-items: center; gap: 8px; padding: 0 16px; cursor: pointer; font-weight: 500; }
.btn--primary { background: #22c55e; color: #fff; }
.btn--primary:hover { background: #16a34a; }
.icon { width: 18px; height: 18px; }
.icon-sm { width: 16px; height: 16px; }

.controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
.filter-tabs { display: flex; gap: 4px; }
.filter-tab { padding: 6px 12px; border-radius: 6px; border: none; background: transparent; color: #6b7280; cursor: pointer; font-size: 13px; }
.filter-tab:hover { background: #f3f4f6; }
.filter-tab.active { background: #22c55e; color: #fff; }

.sort-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; font-size: 13px; color: #374151; }
.sort-btn:hover { background: #f9fafb; }

.empty-state { text-align: center; padding: 40px 20px; }
.empty-icon { width: 60px; height: 60px; color: #d1d5db; margin-bottom: 12px; }
.empty-state h3 { margin: 0; font-size: 16px; color: #6b7280; }

.category-section { margin-bottom: 20px; }
.category-title { display: flex; align-items: center; gap: 6px; margin: 0 0 10px; font-size: 14px; color: #374151; font-weight: 600; }
.count { color: #9ca3af; font-weight: 400; }

.simple-list, .items-list { display: flex; flex-direction: column; gap: 8px; }

.item-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; transition: all 0.15s; }
.item-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,.04); }
.item-card.completed { opacity: 0.6; }
.item-card.completed .item-name { text-decoration: line-through; }

.item-checkbox { position: relative; cursor: pointer; display: flex; }
.item-checkbox input { position: absolute; opacity: 0; cursor: pointer; }
.checkmark { width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 5px; display: grid; place-items: center; transition: all 0.15s; }
.item-checkbox input:checked ~ .checkmark { background: #22c55e; border-color: #22c55e; }
.item-checkbox input:checked ~ .checkmark::after { content: '✓'; color: #fff; font-size: 12px; font-weight: 600; }

.item-content { flex: 1; cursor: pointer; min-width: 0; }
.item-name { font-size: 14px; font-weight: 500; margin-bottom: 3px; }
.item-meta { font-size: 12px; color: #6b7280; display: flex; gap: 6px; align-items: center; }
.category-badge { padding: 1px 6px; background: #f3f4f6; border-radius: 3px; font-size: 11px; }

.item-delete { width: 28px; height: 28px; border: none; border-radius: 6px; background: transparent; display: grid; place-items: center; cursor: pointer; color: #9ca3af; }
.item-delete:hover { background: #fee2e2; color: #ef4444; }
</style>
