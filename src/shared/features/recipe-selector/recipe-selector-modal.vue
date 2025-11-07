<template>
  <div class="recipe-selector">
    <div class="search-box">
      <Icon icon="mdi:magnify" class="search-icon" />
      <input 
        v-model="searchQuery" 
        class="search-input" 
        type="text" 
        placeholder="Поиск рецептов..."
      />
    </div>

    <div class="recipes-list">
      <div 
        v-for="recipe in filteredRecipes" 
        :key="recipe.id"
        class="recipe-item"
        @click="selectRecipe(recipe)"
      >
        <img :src="recipe.image" :alt="recipe.title" class="recipe-img" />
        <div class="recipe-info">
          <div class="recipe-title">{{ recipe.title }}</div>
          <div class="recipe-meta">
            {{ recipe.time }} мин · {{ recipe.servings }} порций
          </div>
        </div>
        <Icon icon="mdi:chevron-right" class="icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useModal } from '@/shared/ui/modal/modal-service'
import { fetchRecipes } from '@/shared/api/recipesApi'
import { Icon } from '@iconify/vue'

const props = defineProps({
  onSelect: { type: Function, required: true }
})

const { close } = useModal()
const searchQuery = ref('')
const recipes = ref([])

onMounted(async () => {
  recipes.value = await fetchRecipes()
})

const filteredRecipes = computed(() => {
  if (!searchQuery.value) return recipes.value
  const query = searchQuery.value.toLowerCase()
  return recipes.value.filter(r => r.title.toLowerCase().includes(query))
})

const selectRecipe = (recipe) => {
  props.onSelect(recipe)
  close()
}
</script>

<style scoped>
.recipe-selector { padding: 20px; }
.search-box { position: relative; margin-bottom: 20px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9ca3af; }
.search-input { width: 100%; padding: 10px 12px 10px 40px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
.search-input:focus { outline: none; border-color: #22c55e; }
.recipes-list { max-height: 400px; overflow-y: auto; }
.recipe-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; }
.recipe-item:hover { background: #f9fafb; }
.recipe-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.recipe-info { flex: 1; }
.recipe-title { font-weight: 500; margin-bottom: 4px; }
.recipe-meta { font-size: 13px; color: #6b7280; }
.icon { width: 20px; height: 20px; color: #d1d5db; }
</style>
