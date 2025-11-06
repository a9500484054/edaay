<template>
  <div class="recipes-grid">
    <RecipeCard
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
      @add="handleAdd"
      @toggle-favorite="handleToggleFav"
    />
  </div>
</template>

<script setup>
import RecipeCard from '@/entities/recipe/ui/recipe-card.vue'

defineProps({
  recipes: { type: Array, default: () => [] }
})
defineEmits(['add', 'toggle-favorite'])

const handleAdd = (recipe) => {
  console.log('Add recipe:', recipe)
  // TODO: добавить в стор списка покупок/меню
}

const handleToggleFav = (recipe) => {
  console.log('Toggle favorite:', recipe)
  // TODO: вызвать экшен в сторе избранного
}
</script>

<style scoped>
.recipes-grid { display:grid; gap:16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
</style>
