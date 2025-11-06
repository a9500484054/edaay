<template>
  <div class="page">
    <HeaderBar />
    <main class="container">
      <header class="page-header">
        <h1>Рецепты</h1>
        <p class="subtitle">Выберите рецепты и добавьте в меню или список покупок</p>
      </header>

      <div v-if="loading" class="loader">Загрузка...</div>
      <RecipesGrid v-else :recipes="recipes" @add="onAdd" @toggle-favorite="onToggleFav" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeaderBar from '@/widgets/header/index.vue'
import RecipesGrid from '@/widgets/recipe-grid/ui/recipes-grid.vue'
import { fetchRecipes } from '@/shared/api/recipesApi'

const recipes = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    recipes.value = await fetchRecipes()
  } finally {
    loading.value = false
  }
})

const onAdd = (recipe) => {
  console.log('Page: add recipe', recipe)
  // TODO: открыть модалку выбора (меню или список покупок)
}

const onToggleFav = (recipe) => {
  console.log('Page: toggle favorite', recipe)
  // TODO: вызвать стор
}
</script>

<style scoped>
.page { min-height:100vh; background:#f9fafb; }
.container { max-width:1280px; margin:0 auto; padding:24px 16px; }
.page-header { margin-bottom:24px; }
.page-header h1 { margin:0 0 4px; font-size:32px; }
.subtitle { color:#6b7280; margin:0; }
.loader { text-align:center; padding:40px; color:#6b7280; }
</style>
