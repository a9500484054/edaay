<template>
  <div class="page">
    <main class="container">
      <header class="page-header">
        <div class="header-top">
          <div>
            <h1>Рецепты</h1>
            <p class="subtitle">{{ filteredRecipes.length }} рецептов найдено</p>
          </div>
          
          <!-- Переключатель вида сетки -->
          <div class="view-switcher">
            <button 
              class="view-btn" 
              :class="{ active: gridView === 'compact' }"
              @click="gridView = 'compact'"
              title="Компактный вид"
            >
              <Icon icon="mdi:view-grid" class="icon" />
            </button>
            <button 
              class="view-btn" 
              :class="{ active: gridView === 'standard' }"
              @click="gridView = 'standard'"
              title="Стандартный вид"
            >
              <Icon icon="mdi:view-module" class="icon" />
            </button>
            <button 
              class="view-btn" 
              :class="{ active: gridView === 'wide' }"
              @click="gridView = 'wide'"
              title="Широкий вид"
            >
              <Icon icon="mdi:view-agenda" class="icon" />
            </button>
          </div>
        </div>

        <!-- Поиск и фильтры -->
        <div class="filters-section">
          <!-- Поиск -->
          <div class="search-box">
            <Icon icon="mdi:magnify" class="search-icon" />
            <input 
              v-model="searchQuery"
              class="search-input" 
              type="text" 
              placeholder="Поиск рецептов..."
            />
            <button 
              v-if="searchQuery" 
              class="clear-search" 
              @click="searchQuery = ''"
            >
              <Icon icon="mdi:close" class="icon-sm" />
            </button>
          </div>

          <!-- Фильтры -->
          <div class="filters">
            <!-- Категория -->
            <select v-model="selectedCategory" class="filter-select">
              <option value="">Все категории</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>

            <!-- Время приготовления -->
            <select v-model="selectedTimeRange" class="filter-select">
              <option value="">Любое время</option>
              <option value="quick">Быстро (до 30 мин)</option>
              <option value="medium">Средне (30-60 мин)</option>
              <option value="long">Долго (60+ мин)</option>
            </select>

            <!-- Порции -->
            <select v-model="selectedServings" class="filter-select">
              <option value="">Любое кол-во порций</option>
              <option value="1-2">1-2 порции</option>
              <option value="3-4">3-4 порции</option>
              <option value="5+">5+ порций</option>
            </select>

            <!-- Сортировка -->
            <select v-model="sortBy" class="filter-select">
              <option value="">Без сортировки</option>
              <option value="time-asc">Время: быстрые сначала</option>
              <option value="time-desc">Время: долгие сначала</option>
              <option value="calories-asc">Калории: меньше сначала</option>
              <option value="calories-desc">Калории: больше сначала</option>
              <option value="name">По названию</option>
            </select>

            <!-- Сброс фильтров -->
            <button 
              v-if="hasActiveFilters" 
              class="reset-filters-btn"
              @click="resetFilters"
            >
              <Icon icon="mdi:filter-off" class="icon-sm" />
              Сбросить
            </button>
          </div>
        </div>
      </header>

      <div v-if="loading" class="loader">Загрузка...</div>
      
      <div v-else-if="filteredRecipes.length === 0" class="empty-state">
        <Icon icon="mdi:food-off" class="empty-icon" />
        <h2>Рецепты не найдены</h2>
        <p>Попробуйте изменить фильтры или поисковый запрос</p>
        <button class="btn btn--secondary" @click="resetFilters">
          Сбросить фильтры
        </button>
      </div>

      <RecipesGrid 
        v-else
        :recipes="filteredRecipes" 
        :grid-view="gridView"
        @add="onAdd" 
        @toggle-favorite="onToggleFav" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RecipesGrid from '@/widgets/recipe-grid/ui/recipes-grid.vue'
import { fetchRecipes } from '@/shared/api/recipesApi'
import { Icon } from '@iconify/vue'

const recipes = ref([])
const loading = ref(true)

// Фильтры
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTimeRange = ref('')
const selectedServings = ref('')
const sortBy = ref('')
const gridView = ref('standard') // 'compact' | 'standard' | 'wide'

// Уникальные категории из тегов рецептов
const categories = computed(() => {
  const tags = new Set()
  recipes.value.forEach(recipe => {
    // Предполагаем, что у рецептов есть tags или можно извлечь из данных
    const recipeTags = ['Итальянская кухня', 'Салат', 'Средиземноморская кухня', 
                        'Вегетарианское', 'Украинская кухня', 'Суп', 'Завтрак', 
                        'Десерт', 'Быстро', 'Тайская кухня', 'Острое', 'С курицей',
                        'Японская кухня', 'Без выпечки']
    recipeTags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedTimeRange.value || 
         selectedServings.value || sortBy.value
})

// Фильтрация
const filteredRecipes = computed(() => {
  let result = [...recipes.value]

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(query))
  }

  // Категория (по тегам - нужно добавить tags в API)
  if (selectedCategory.value) {
    result = result.filter(r => {
      // Временно используем названия, в реальности будут tags
      return r.title.toLowerCase().includes(selectedCategory.value.toLowerCase())
    })
  }

  // Время приготовления
  if (selectedTimeRange.value) {
    result = result.filter(r => {
      if (selectedTimeRange.value === 'quick') return r.time <= 30
      if (selectedTimeRange.value === 'medium') return r.time > 30 && r.time <= 60
      if (selectedTimeRange.value === 'long') return r.time > 60
      return true
    })
  }

  // Порции
  if (selectedServings.value) {
    result = result.filter(r => {
      if (selectedServings.value === '1-2') return r.servings >= 1 && r.servings <= 2
      if (selectedServings.value === '3-4') return r.servings >= 3 && r.servings <= 4
      if (selectedServings.value === '5+') return r.servings >= 5
      return true
    })
  }

  // Сортировка
  if (sortBy.value) {
    if (sortBy.value === 'time-asc') result.sort((a, b) => a.time - b.time)
    if (sortBy.value === 'time-desc') result.sort((a, b) => b.time - a.time)
    if (sortBy.value === 'calories-asc') result.sort((a, b) => a.calories - b.calories)
    if (sortBy.value === 'calories-desc') result.sort((a, b) => b.calories - a.calories)
    if (sortBy.value === 'name') result.sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
})

onMounted(async () => {
  try {
    recipes.value = await fetchRecipes()
  } finally {
    loading.value = false
  }
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedTimeRange.value = ''
  selectedServings.value = ''
  sortBy.value = ''
}

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
.page { min-height: 100vh; background: #f9fafb; }
.container { max-width: 1400px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }

.header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 20px; }
.page-header h1 { margin: 0 0 6px; font-size: 36px; }
.subtitle { color: #6b7280; margin: 0; font-size: 16px; }

.view-switcher { display: flex; gap: 4px; background: #fff; border-radius: 8px; padding: 4px; border: 1px solid #e5e7eb; }
.view-btn { width: 40px; height: 40px; border: none; border-radius: 6px; background: transparent; display: grid; place-items: center; cursor: pointer; color: #6b7280; transition: all 0.15s; }
.view-btn:hover { background: #f3f4f6; }
.view-btn.active { background: #22c55e; color: #fff; }
.icon { width: 20px; height: 20px; }
.icon-sm { width: 16px; height: 16px; }

.filters-section { display: flex; flex-direction: column; gap: 12px; }

.search-box { position: relative; flex: 1; max-width: 500px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 12px 44px 12px 44px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 15px; background: #fff; }
.search-input:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }
.clear-search { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border: none; border-radius: 50%; background: #f3f4f6; display: grid; place-items: center; cursor: pointer; color: #6b7280; }
.clear-search:hover { background: #e5e7eb; }

.filters { display: flex; gap: 10px; flex-wrap: wrap; }
.filter-select { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; cursor: pointer; color: #374151; min-width: 160px; }
.filter-select:focus { outline: none; border-color: #22c55e; }

.reset-filters-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; color: #ef4444; font-weight: 500; }
.reset-filters-btn:hover { background: #fef2f2; border-color: #fecaca; }

.loader { text-align: center; padding: 60px; color: #6b7280; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { width: 80px; height: 80px; color: #d1d5db; margin-bottom: 20px; }
.empty-state h2 { margin: 0 0 10px; font-size: 24px; color: #374151; }
.empty-state p { color: #6b7280; margin: 0 0 24px; }

.btn { height: 40px; border-radius: 8px; border: none; display: inline-flex; align-items: center; gap: 8px; padding: 0 16px; cursor: pointer; font-weight: 500; }
.btn--secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
.btn--secondary:hover { background: #f9fafb; }

@media (max-width: 768px) {
  .header-top { flex-direction: column; align-items: stretch; }
  .view-switcher { justify-content: center; }
  .filters { flex-direction: column; }
  .filter-select { width: 100%; }
  .search-box { max-width: none; }
}
</style>
