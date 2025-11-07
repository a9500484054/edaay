<template>
  <div class="page">
    <HeaderBar />
    <main class="container">
      <header class="page-header">
        <div class="header-content">
          <div>
            <h1>Мои рецепты</h1>
            <p class="subtitle">Ваша личная коллекция рецептов</p>
          </div>
          <button class="btn btn--primary" @click="openCreateModal">
            <Icon icon="mdi:plus" class="icon" />
            Добавить рецепт
          </button>
        </div>
      </header>

      <div v-if="loading" class="loader">Загрузка...</div>
      
      <div v-else-if="myRecipes.length === 0" class="empty-state">
        <Icon icon="mdi:book-open-page-variant" class="empty-icon" />
        <h2>У вас пока нет своих рецептов</h2>
        <p>Создайте первый рецепт или сохраните понравившиеся из общей коллекции</p>
        <button class="btn btn--primary" @click="openCreateModal">
          <Icon icon="mdi:plus" class="icon" />
          Создать первый рецепт
        </button>
      </div>

      <div v-else class="recipes-grid">
        <article 
          v-for="recipe in myRecipes" 
          :key="recipe.id" 
          class="recipe-card"
          @click="goToRecipe(recipe.id)"
        >
          <div class="recipe-card__image">
            <img :src="recipe.image || defaultImage" :alt="recipe.title" loading="lazy" />
            <div class="card-actions">
              <button class="action-btn" @click.stop="editRecipe(recipe)" title="Редактировать">
                <Icon icon="mdi:pencil" class="icon" />
              </button>
              <button class="action-btn danger" @click.stop="confirmDelete(recipe)" title="Удалить">
                <Icon icon="mdi:delete" class="icon" />
              </button>
            </div>
          </div>

          <div class="recipe-card__body">
            <h3 class="title">{{ recipe.title }}</h3>
            <div class="meta">
              <span class="meta-item">
                <Icon icon="mdi:clock-outline" class="icon-sm" />
                {{ recipe.time }} мин
              </span>
              <span class="meta-item">
                <Icon icon="mdi:account-outline" class="icon-sm" />
                {{ recipe.servings }} порц
              </span>
              <span class="meta-item" v-if="recipe.calories">
                <Icon icon="mdi:fire" class="icon-sm" />
                {{ recipe.calories }} ккал
              </span>
            </div>
            <p class="description" v-if="recipe.description">{{ recipe.description }}</p>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeaderBar from '@/widgets/header/index.vue'
import { fetchMyRecipes, deleteRecipe } from '@/shared/api/myRecipesApi.js'
import { Icon } from '@iconify/vue'

const router = useRouter()
const myRecipes = ref([])
const loading = ref(true)
const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'

onMounted(async () => {
  try {
    myRecipes.value = await fetchMyRecipes()
  } finally {
    loading.value = false
  }
})

const goToRecipe = (id) => {
  router.push({ name: 'recipe-details', params: { id } })
}

const openCreateModal = () => {
  // TODO: открыть модалку создания рецепта через useModal
  console.log('Open create recipe modal')
  alert('Модалка создания рецепта (в разработке)')
}

const editRecipe = (recipe) => {
  // TODO: открыть модалку редактирования с данными рецепта
  console.log('Edit recipe:', recipe)
  alert(`Редактирование рецепта: ${recipe.title} (в разработке)`)
}

const confirmDelete = async (recipe) => {
  if (!confirm(`Удалить рецепт "${recipe.title}"?`)) return
  
  try {
    await deleteRecipe(recipe.id)
    myRecipes.value = myRecipes.value.filter(r => r.id !== recipe.id)
  } catch (error) {
    alert('Не удалось удалить рецепт')
  }
}
</script>

<style scoped>
.page { min-height:100vh; background:#f9fafb; }
.container { max-width:1280px; margin:0 auto; padding:24px 16px; }
.page-header { margin-bottom:32px; }
.header-content { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; }
.page-header h1 { margin:0 0 6px; font-size:36px; }
.subtitle { color:#6b7280; margin:0; font-size:16px; }

.btn { height:44px; border-radius:10px; border:none; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:0 20px; cursor:pointer; font-weight:500; }
.btn--primary { background:#22c55e; color:#fff; }
.btn--primary:hover { background:#16a34a; }
.icon { width:18px; height:18px; }
.icon-sm { width:14px; height:14px; }

.loader { text-align:center; padding:60px; color:#6b7280; }

.empty-state { text-align:center; padding:80px 20px; }
.empty-icon { width:80px; height:80px; color:#d1d5db; margin-bottom:20px; }
.empty-state h2 { margin:0 0 12px; font-size:24px; color:#374151; }
.empty-state p { color:#6b7280; margin:0 0 24px; max-width:480px; margin-left:auto; margin-right:auto; }

.recipes-grid { display:grid; gap:20px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

.recipe-card { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; cursor:pointer; transition: box-shadow .2s ease; }
.recipe-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }

.recipe-card__image { position:relative; aspect-ratio: 4/3; overflow:hidden; background:#f3f4f6; }
.recipe-card__image img { width:100%; height:100%; object-fit:cover; }

.card-actions { position:absolute; top:8px; right:8px; display:flex; gap:6px; opacity:0; transition: opacity .2s; }
.recipe-card:hover .card-actions { opacity:1; }

.action-btn { width:32px; height:32px; border-radius:8px; border:none; background:rgba(255,255,255,.95); display:grid; place-items:center; cursor:pointer; color:#374151; box-shadow:0 2px 4px rgba(0,0,0,.1); }
.action-btn:hover { background:#fff; }
.action-btn.danger { color:#ef4444; }
.action-btn.danger:hover { background:#fef2f2; }

.recipe-card__body { padding:14px; display:flex; flex-direction:column; gap:8px; }
.title { margin:0; font-size:18px; line-height:1.3; }
.description { margin:0; color:#6b7280; font-size:13px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.meta { display:flex; gap:10px; font-size:13px; color:#6b7280; }
.meta-item { display:inline-flex; align-items:center; gap:4px; }

@media (max-width: 768px) {
  .header-content { flex-direction:column; align-items:stretch; }
  .btn { width:100%; }
}
</style>
