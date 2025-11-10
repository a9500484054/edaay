<template>
  <div class="page">
    <main class="container">
      <button class="back-btn" @click="$router.back()">
        <Icon icon="mdi:arrow-left" class="icon" />
        Назад к рецептам
      </button>

      <div v-if="loading" class="loader">Загрузка...</div>
      <div v-else-if="!recipe" class="error">Рецепт не найден</div>

      <article v-else class="recipe">
        <header class="recipe__header">
          <div class="recipe__image">
            <img :src="recipe.image" :alt="recipe.title" />
          </div>
          <div class="recipe__intro">
            <h1>{{ recipe.title }}</h1>
            <p class="description">{{ recipe.description }}</p>

            <div class="meta">
              <span class="meta-item">
                <Icon icon="mdi:clock-outline" class="icon-sm" />
                {{ recipe.time }} мин
              </span>
              <span class="meta-item">
                <Icon icon="mdi:account-outline" class="icon-sm" />
                {{ recipe.servings }} порций
              </span>
              <span class="meta-item">
                <Icon icon="mdi:fire" class="icon-sm" />
                {{ recipe.calories }} ккал
              </span>
            </div>

            <div class="tags">
              <span v-for="tag in recipe.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="actions">
              <button class="btn btn--primary" @click="handleAdd">
                <Icon icon="mdi:plus" class="icon-sm" />
                Добавить в меню
              </button>
              <button class="btn btn--outline" :class="{ active: recipe.isFavorite }" @click="toggleFav">
                <Icon :icon="recipe.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" class="icon-sm" />
                {{ recipe.isFavorite ? 'В избранном' : 'В избранное' }}
              </button>
            </div>
          </div>
        </header>

        <div class="recipe__content">
          <section class="ingredients">
            <h2>Ингредиенты</h2>
            <ul>
              <li v-for="(ing, i) in recipe.ingredients" :key="i">
                <span class="name">{{ ing.name }}</span>
                <span class="amount">{{ ing.amount }}</span>
              </li>
            </ul>
          </section>

          <section class="steps">
            <h2>Приготовление</h2>
            <ol>
              <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
            </ol>
          </section>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBar from '@/widgets/header/index.vue'
import { fetchRecipeById } from '@/shared/api/recipesApi'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

const recipe = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = route.params.id
    recipe.value = await fetchRecipeById(id)
  } finally {
    loading.value = false
  }
})

const handleAdd = () => {
  console.log('Add recipe to menu:', recipe.value)
  // TODO: открыть модалку выбора меню или добавить в стор
}

const toggleFav = () => {
  recipe.value.isFavorite = !recipe.value.isFavorite
  // TODO: сохранить в стор избранного
}
</script>

<style scoped>
.page { min-height:100vh; background:#f9fafb; }
.container { max-width:1024px; margin:0 auto; padding:24px 16px; }
.back-btn { display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; color:#15803d; cursor:pointer; margin-bottom:16px; }
.back-btn:hover { text-decoration:underline; }
.icon { width:18px; height:18px; }
.icon-sm { width:16px; height:16px; }
.loader, .error { text-align:center; padding:40px; color:#6b7280; }

.recipe__header { display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:32px; }
.recipe__image { aspect-ratio:4/3; border-radius:16px; overflow:hidden; background:#e5e7eb; }
.recipe__image img { width:100%; height:100%; object-fit:cover; }
.recipe__intro { display:flex; flex-direction:column; gap:12px; }
.recipe__intro h1 { margin:0; font-size:32px; line-height:1.2; }
.description { color:#6b7280; margin:0; }
.meta { display:flex; gap:16px; font-size:14px; color:#6b7280; }
.meta-item { display:inline-flex; align-items:center; gap:6px; }
.tags { display:flex; flex-wrap:wrap; gap:8px; }
.tag { background:#f3f4f6; color:#374151; padding:4px 10px; border-radius:6px; font-size:13px; }
.actions { display:flex; gap:8px; }
.btn { height:40px; border-radius:10px; border:1px solid transparent; display:inline-flex; align-items:center; gap:6px; padding:0 16px; cursor:pointer; }
.btn--primary { background:#22c55e; color:#fff; }
.btn--primary:hover { background:#16a34a; }
.btn--outline { background:#fff; border:1px solid #e5e7eb; color:#374151; }
.btn--outline:hover { background:#f9fafb; }
.btn--outline.active { border-color:#ef4444; color:#ef4444; }

.recipe__content { display:grid; grid-template-columns: 1fr 2fr; gap:24px; }
.ingredients, .steps { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:20px; }
.ingredients h2, .steps h2 { margin:0 0 12px; font-size:20px; }
.ingredients ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
.ingredients li { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f3f4f6; }
.ingredients li:last-child { border-bottom:none; }
.name { font-weight:500; }
.amount { color:#6b7280; }
.steps ol { padding-left:20px; margin:0; display:flex; flex-direction:column; gap:10px; }
.steps li { line-height:1.6; }

@media (max-width: 768px) {
  .recipe__header { grid-template-columns: 1fr; }
  .recipe__content { grid-template-columns: 1fr; }
}
</style>
  