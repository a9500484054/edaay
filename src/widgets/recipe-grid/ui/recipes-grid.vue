<template>
  <div class="recipes-grid" :class="gridClass">
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

const props = defineProps({
  recipes: { type: Array, default: () => [] },
  gridView: { type: String, default: 'standard' } // 'compact' | 'standard' | 'wide'
})

defineEmits(['add', 'toggle-favorite'])

const gridClass = computed(() => {
  return `grid-${props.gridView}`
})

const handleAdd = (recipe) => {
  emit('add', recipe)
}

const handleToggleFav = (recipe) => {
  emit('toggle-favorite', recipe)
}
</script>

<script>
import { computed } from 'vue'
export default {
  name: 'RecipesGrid'
}
</script>

<style scoped>
.recipes-grid { display: grid; gap: 20px; }

/* Компактный вид - 4 колонки */
.grid-compact { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }

/* Стандартный вид - 3 колонки */
.grid-standard { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

/* Широкий вид - 2 колонки */
.grid-wide { grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }

@media (max-width: 768px) {
  .recipes-grid { grid-template-columns: 1fr !important; }
}
</style>
