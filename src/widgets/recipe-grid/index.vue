<template>
  <div class="page">
    <main class="container">
      <header class="page-header">
        <div class="header-top">
          <div class="header-top__wrap">
            <div class="header-text">
              <h1>Рецепты</h1>
              <p class="subtitle">{{ totalRecipesCount }} рецептов найдено</p>
            </div>
            
            <!-- Сортировка в десктопной версии -->
            <!-- <div class="desktop-sort">
              <label class="sort-label">Сортировка:</label>
              <select v-model="sortBy" class="sort-select">
                <option value="">Без сортировки</option>
                <option value="time-asc">Время: быстрые сначала</option>
                <option value="time-desc">Время: долгие сначала</option>
                <option value="calories-asc">Калории: меньше сначала</option>
                <option value="calories-desc">Калории: больше сначала</option>
                <option value="name">По названию</option>
              </select>
            </div> -->
          </div>
        </div>

        <!-- Единая секция: поиск + вид + кнопка фильтров -->
        <div class="top-controls">
          <div class="controls-left">
            <div class="search-box">
              <Icon icon="mdi:magnify" class="search-icon" />
              <input 
                v-model="searchQuery"
                class="search-input" 
                type="text" 
                placeholder="Поиск рецептов..."
                @keydown.enter.prevent
              />
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''" aria-label="Очистить">
                <Icon icon="mdi:close" class="icon-sm" />
              </button>
            </div>


          </div>

          <div class="controls-right">
            <button class="filters-toggle" @click="filtersOpen = true">
              <Icon icon="mdi:tune-variant" class="icon" />
              Фильтры
              <span v-if="activeFiltersCount" class="badge">{{ activeFiltersCount }}</span>
            </button>

            <div class="view-switcher"  v-if="!isMobile">
              <button
                class="view-btn" 
                :class="{ active: gridView === 'compact' }"
                @click="gridView = 'compact'"
                :title="isMobile ? '1 в строку' : 'Компактный вид'"
              >
                <Icon icon="mdi:view-module" class="icon" />
              </button>
              <button 
                class="view-btn" 
                :class="{ active: gridView === 'standard' }"
                @click="gridView = 'standard'"
                :title="isMobile ? '2 в строку' : 'Стандартный вид'"
              >
                <Icon icon="mdi:view-grid" class="icon" />
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

            <!-- Сортировка в мобильной версии -->
            <div class="mobile-sort">
              <select v-model="sortBy" class="sort-select">
                <option value="">Без сортировки</option>
                <option value="time-asc">Время ↑</option>
                <option value="time-desc">Время ↓</option>
                <option value="calories-asc">Калории ↑</option>
                <option value="calories-desc">Калории ↓</option>
                <option value="name">По названию</option>
              </select>
            </div>

          </div>
        </div>
      </header>

      <div v-if="loading && currentPage === 1" class="loader">
        <div class="loader-spinner"></div>
        <p>Загрузка рецептов...</p>
      </div>
      
      <div v-else-if="displayedRecipes.length === 0 && !loadingMore" class="empty-state">
        <Icon icon="mdi:food-off" class="empty-icon" />
        <h2>Рецепты не найдены</h2>
        <p>Попробуйте изменить фильтры или поисковый запрос</p>
        <div class="empty-actions">
          <button class="btn btn--primary" @click="resetFilters">
            <Icon icon="mdi:filter-off" class="icon" />
            Сбросить фильтры
          </button>
          <button class="btn btn--secondary" @click="searchQuery = ''">
            <Icon icon="mdi:backspace" class="icon" />
            Очистить поиск
          </button>
        </div>
      </div>

      <RecipesGrid 
        v-else-if="displayedRecipes.length > 0"
        :recipes="displayedRecipes" 
        :grid-view="gridView"
        @add="onAdd" 
        @toggle-favorite="onToggleFav" 
      />

      <!-- Индикатор загрузки при бесконечной прокрутке -->
      <div v-if="loadingMore" class="load-more-indicator">
        <div class="loader-spinner small"></div>
        <p>Загрузка рецептов...</p>
      </div>

      <!-- Пагинация -->
      <div v-if="showPagination && displayedRecipes.length > 0" class="pagination">
        <button 
          class="pagination-btn"
          :class="{ disabled: currentPage === 1 }"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <Icon icon="mdi:chevron-left" class="icon" />
          Назад
        </button>
        
        <div class="pagination-info">
          Страница {{ currentPage }} из {{ totalPages }}
        </div>

        <button 
          class="pagination-btn"
          :class="{ disabled: currentPage === totalPages }"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          Вперед
          <Icon icon="mdi:chevron-right" class="icon" />
        </button>
      </div>

      <!-- Переключатель режима загрузки -->
      <div v-if="displayedRecipes.length > 0" class="load-mode-toggle">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            v-model="infiniteScrollEnabled" 
            @change="onLoadModeChange"
            class="toggle-input"
          />
          <span class="toggle-slider"></span>
          Бесконечная прокрутка
        </label>
      </div>
    </main>

    <!-- Off-canvas фильтры справа -->
    <transition name="fade">
      <div v-if="filtersOpen" class="backdrop" @click="closeFilters" />
    </transition>

    <transition name="slide-right">
      <aside v-if="filtersOpen" class="filters-drawer" @click.stop>
        <header class="drawer-header">
          <div class="drawer-title">
            <Icon icon="mdi:filter" class="title-icon" />
            <h3>Фильтры</h3>
            <span v-if="activeFiltersCount" class="title-badge">{{ activeFiltersCount }}</span>
          </div>
          <button class="close-btn" @click="closeFilters" aria-label="Закрыть">
            <Icon icon="mdi:close" class="icon" />
          </button>
        </header>

        <div class="drawer-body">
          <section class="field">
            <label class="label">
              <Icon icon="mdi:tag" class="label-icon" />
              Категория
            </label>
            <select v-model="selectedCategory" class="select">
              <option value="">Все категории</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </section>

          <section class="field">
            <label class="label">
              <Icon icon="mdi:clock-outline" class="label-icon" />
              Время приготовления
            </label>
            <select v-model="selectedTimeRange" class="select">
              <option value="">Любое время</option>
              <option value="quick">Быстро (до 30 мин)</option>
              <option value="medium">Средне (30-60 мин)</option>
              <option value="long">Долго (60+ мин)</option>
            </select>
          </section>

          <section class="field">
            <label class="label">
              <Icon icon="mdi:account-group" class="label-icon" />
              Порции
            </label>
            <select v-model="selectedServings" class="select">
              <option value="">Любое кол-во порций</option>
              <option value="1-2">1-2 порции</option>
              <option value="3-4">3-4 порции</option>
              <option value="5+">5+ порций</option>
            </select>
          </section>

          <section class="field">
            <label class="label">
              <Icon icon="mdi:sort" class="label-icon" />
              Сортировка
            </label>
            <select v-model="sortBy" class="select">
              <option value="">Без сортировки</option>
              <option value="time-asc">Время: быстрые сначала</option>
              <option value="time-desc">Время: долгие сначала</option>
              <option value="calories-asc">Калории: меньше сначала</option>
              <option value="calories-desc">Калории: больше сначала</option>
              <option value="name">По названию</option>
            </select>
          </section>

          <section class="active-filters" v-if="activeFiltersCount">
            <div class="filters-header">
              <span class="filters-title">Активные фильтры</span>
              <button class="clear-all" @click="resetFilters">
                Очистить все
              </button>
            </div>
            <div class="filter-chips">
              <span v-if="searchQuery" class="filter-chip">
                Поиск: "{{ searchQuery }}"
                <button @click="searchQuery = ''" class="chip-remove">
                  <Icon icon="mdi:close" />
                </button>
              </span>
              <span v-if="selectedCategory" class="filter-chip">
                {{ selectedCategory }}
                <button @click="selectedCategory = ''" class="chip-remove">
                  <Icon icon="mdi:close" />
                </button>
              </span>
              <span v-if="selectedTimeRange" class="filter-chip">
                {{ getTimeRangeLabel(selectedTimeRange) }}
                <button @click="selectedTimeRange = ''" class="chip-remove">
                  <Icon icon="mdi:close" />
                </button>
              </span>
              <span v-if="selectedServings" class="filter-chip">
                {{ getServingsLabel(selectedServings) }}
                <button @click="selectedServings = ''" class="chip-remove">
                  <Icon icon="mdi:close" />
                </button>
              </span>
            </div>
          </section>
        </div>

        <footer class="drawer-footer">
          <button class="btn btn--secondary" @click="resetFilters">
            <Icon icon="mdi:filter-off" class="icon" />
            Сбросить всё
          </button>
          <button class="btn btn--primary" @click="closeFilters">
            <Icon icon="mdi:check" class="icon" />
            Применить
          </button>
        </footer>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import RecipesGrid from '@/widgets/recipe-grid/ui/recipes-grid.vue'
import { fetchRecipes } from '@/shared/api/recipesApi'
import { Icon } from '@iconify/vue'

const recipes = ref([])
const loading = ref(true)
const loadingMore = ref(false)

// Пагинация и бесконечная загрузка
const currentPage = ref(1)
const itemsPerPage = ref(12)
const infiniteScrollEnabled = ref(false)

// Фильтры состояние
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTimeRange = ref('')
const selectedServings = ref('')
const sortBy = ref('')

// Вид
const gridView = ref('standard') // 'compact' | 'standard' | 'wide'

// Drawer
const filtersOpen = ref(false)
const closeFilters = () => (filtersOpen.value = false)

// Адаптивность
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  // Автоматически устанавливаем стандартный вид на мобильных
  if (isMobile.value && gridView.value === 'wide') {
    gridView.value = 'standard'
  }
}

// Категории
const categories = computed(() => [
  'Итальянская кухня','Салат','Средиземноморская кухня','Вегетарианское',
  'Украинская кухня','Суп','Завтрак','Десерт','Быстро',
  'Тайская кухня','Острое','С курицей','Японская кухня','Без выпечки'
])

const activeFiltersCount = computed(() => {
  let n = 0
  if (searchQuery.value) n++
  if (selectedCategory.value) n++
  if (selectedTimeRange.value) n++
  if (selectedServings.value) n++
  if (sortBy.value) n++
  return n
})

// Фильтрация
const filteredRecipes = computed(() => {
  let result = [...recipes.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.title.toLowerCase().includes(q) || 
      (r.description || '').toLowerCase().includes(q) ||
      (r.tags || []).some(tag => tag.toLowerCase().includes(q))
    )
  }
  if (selectedCategory.value) {
    const cat = selectedCategory.value.toLowerCase()
    result = result.filter(r => 
      (r.tags || []).some(t => t.toLowerCase() === cat) || 
      r.title.toLowerCase().includes(cat)
    )
  }
  if (selectedTimeRange.value) {
    result = result.filter(r => 
      selectedTimeRange.value === 'quick' ? r.time <= 30 :
      selectedTimeRange.value === 'medium' ? r.time > 30 && r.time <= 60 :
      selectedTimeRange.value === 'long' ? r.time > 60 : true
    )
  }
  if (selectedServings.value) {
    result = result.filter(r => 
      selectedServings.value === '1-2' ? r.servings <= 2 :
      selectedServings.value === '3-4' ? r.servings >= 3 && r.servings <= 4 :
      selectedServings.value === '5+' ? r.servings >= 5 : true
    )
  }
  if (sortBy.value) {
    const s = sortBy.value
    if (s === 'time-asc') result.sort((a, b) => a.time - b.time)
    if (s === 'time-desc') result.sort((a, b) => b.time - a.time)
    if (s === 'calories-asc') result.sort((a, b) => a.calories - b.calories)
    if (s === 'calories-desc') result.sort((a, b) => b.calories - a.calories)
    if (s === 'name') result.sort((a, b) => a.title.localeCompare(b.title))
  }
  return result
})

// Пагинация
const totalRecipesCount = computed(() => filteredRecipes.value.length)
const totalPages = computed(() => Math.ceil(totalRecipesCount.value / itemsPerPage.value))

const displayedRecipes = computed(() => {
  if (infiniteScrollEnabled.value) {
    // Для бесконечной прокрутки показываем все рецепты до текущей страницы
    return filteredRecipes.value.slice(0, currentPage.value * itemsPerPage.value)
  } else {
    // Для обычной пагинации показываем только рецепты текущей страницы
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    return filteredRecipes.value.slice(startIndex, startIndex + itemsPerPage.value)
  }
})

const showPagination = computed(() => {
  return !infiniteScrollEnabled.value && totalPages.value > 1
})

// Навигация по страницам
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Бесконечная прокрутка
const handleScroll = () => {
  if (!infiniteScrollEnabled.value || loadingMore.value) return

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Загружаем следующую страницу когда пользователь прокрутил до 80% страницы
  if (scrollTop + windowHeight >= documentHeight * 0.8) {
    loadMoreRecipes()
  }
}

const loadMoreRecipes = async () => {
  if (currentPage.value >= totalPages.value || loadingMore.value) return

  loadingMore.value = true
  // Имитируем задержку загрузки для лучшего UX
  await new Promise(resolve => setTimeout(resolve, 500))
  currentPage.value++
  loadingMore.value = false
}

const onLoadModeChange = () => {
  currentPage.value = 1
  if (infiniteScrollEnabled.value) {
    window.addEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
}

// Сброс страницы при изменении фильтров
watch([searchQuery, selectedCategory, selectedTimeRange, selectedServings, sortBy], () => {
  currentPage.value = 1
})

// Вспомогательные функции
const getTimeRangeLabel = (range) => {
  const labels = {
    'quick': 'Быстро (до 30 мин)',
    'medium': 'Средне (30-60 мин)',
    'long': 'Долго (60+ мин)'
  }
  return labels[range] || range
}

const getServingsLabel = (servings) => {
  const labels = {
    '1-2': '1-2 порции',
    '3-4': '3-4 порции',
    '5+': '5+ порций'
  }
  return labels[servings] || servings
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  try {
    recipes.value = await fetchRecipes()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', handleScroll)
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedTimeRange.value = ''
  selectedServings.value = ''
  sortBy.value = ''
  currentPage.value = 1
}
const onAdd = (recipe) => { console.log('Add recipe', recipe) }
const onToggleFav = (recipe) => { console.log('Toggle favorite', recipe) }
</script>

<style scoped>
.page { min-height: 100vh; background: #ffffff; border-radius: 16px;}
.container { max-width: 1400px; margin: 0 auto; padding: 24px 16px; }

.page-header { margin-bottom: 24px; }
.header-top__wrap { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 16px;
}
.header-text { flex: 1; display: flex; align-items: center; justify-content: space-between;}
.page-header h1 { margin: 0 0 6px; font-size: 36px; font-weight: 700; color: #1f2937; }
.subtitle { color: #6b7280; margin: 0; font-size: 14px; }

/* Сортировка */
.desktop-sort { display: flex; align-items: center; gap: 8px; }
.mobile-sort { display: none; }
.sort-label { font-size: 14px; color: #6b7280; white-space: nowrap; }
.sort-select { 
  padding: 8px 12px; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  background: white;
  font-size: 14px;
  min-width: 160px;
}

/* Основные контролы */
.top-controls { 
  display: flex; 
  gap: 16px; 
  align-items: center; 
  flex-wrap: wrap; 
  padding: 16px; 
  background: #fff; 
  border: 1px solid #e5e7eb; 
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.controls-left { 
  display: flex; 
  gap: 12px; 
  align-items: center; 
  flex: 1; 
  min-width: 300px;
}
.controls-right { 
  display: flex; 
  gap: 12px; 
  align-items: center; 
}

/* Поиск */
.search-box { position: relative; flex: 1; min-width: 240px; width: 100%;}
.search-icon { 
  position: absolute; 
  left: 12px; 
  top: 50%; 
  transform: translateY(-50%); 
  width: 20px; 
  height: 20px; 
  color: #9ca3af; 
}
.search-input { 
  width: 100%; 
  padding: 12px 40px; 
  border: 1px solid #e5e7eb; 
  border-radius: 10px; 
  font-size: 14px;
  transition: all 0.2s ease;
}
.search-input:focus { 
  outline: none; 
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
.clear-search { 
  position: absolute; 
  right: 8px; 
  top: 50%; 
  transform: translateY(-50%); 
  width: 28px; 
  height: 28px; 
  border: none; 
  border-radius: 50%; 
  background: #f3f4f6; 
  color: #6b7280; 
  display: grid; 
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.clear-search:hover { background: #e5e7eb; }

/* Переключатель вида */
.view-switcher { 
  display: flex; 
  gap: 4px; 
  background: #f9fafb; 
  border: 1px solid #e5e7eb; 
  padding: 4px; 
  border-radius: 8px; 
}
.view-btn { 
  width: 40px; 
  height: 40px; 
  border: none; 
  border-radius: 6px; 
  background: transparent; 
  display: grid; 
  place-items: center; 
  color: #6b7280; 
  cursor: pointer;
  transition: all 0.2s ease;
}
.view-btn:hover { background: #f3f4f6; }
.view-btn.active { background: #22c55e; color: #fff; }
.icon, .icon-sm { width: 20px; height: 20px; }

/* Кнопка фильтров */
.filters-toggle { 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  padding: 12px 16px; 
  border-radius: 10px; 
  border: 1px solid #e5e7eb; 
  background: #fff; 
  cursor: pointer; 
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.filters-toggle:hover { 
  background: #f9fafb; 
  border-color: #d1d5db;
}
.badge { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  min-width: 20px; 
  height: 20px; 
  padding: 0 6px; 
  border-radius: 999px; 
  background: #22c55e; 
  color: #fff; 
  font-size: 12px;
  font-weight: 600;
}

/* Фильтры (справа) */
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 39; }
.filters-drawer { 
  position: fixed; 
  top: 0; 
  right: 0; 
  height: 100vh; 
  width: 380px; 
  background: #fff; 
  border-left: 1px solid #e5e7eb; 
  z-index: 40; 
  display: flex; 
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
}
.drawer-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 20px 24px; 
  border-bottom: 1px solid #f3f4f6; 
}
.drawer-title { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.title-icon { 
  width: 24px; 
  height: 24px; 
  color: #22c55e; 
}
.title-badge { 
  background: #22c55e; 
  color: white; 
  padding: 2px 8px; 
  border-radius: 12px; 
  font-size: 12px; 
  font-weight: 600;
}
.close-btn { 
  padding: 8px; 
  border: none; 
  background: none; 
  border-radius: 6px; 
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}
.close-btn:hover { background: #f3f4f6; color: #374151; }

.drawer-body { 
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
  overflow: auto; 
  flex: 1;
}
.field .label { 
  display: flex; 
  align-items: center; 
  gap: 8px;
  margin-bottom: 8px; 
  color: #374151; 
  font-size: 14px;
  font-weight: 500;
}
.label-icon { 
  width: 18px; 
  height: 18px; 
  color: #6b7280; 
}
.select { 
  width: 100%; 
  padding: 12px; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  font-size: 14px;
  transition: all 0.2s ease;
}
.select:focus { 
  outline: none; 
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Активные фильтры */
.active-filters { 
  background: #f9fafb; 
  padding: 16px; 
  border-radius: 8px; 
  border: 1px solid #e5e7eb;
}
.filters-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 12px;
}
.filters-title { 
  font-size: 14px; 
  font-weight: 600; 
  color: #374151;
}
.clear-all { 
  background: none; 
  border: none; 
  color: #ef4444; 
  font-size: 13px; 
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.clear-all:hover { background: #fef2f2; }
.filter-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-chip { 
  display: inline-flex; 
  align-items: center; 
  gap: 6px; 
  padding: 6px 12px; 
  background: white; 
  border: 1px solid #e5e7eb; 
  border-radius: 16px; 
  font-size: 13px; 
  color: #374151;
}
.chip-remove { 
  background: none; 
  border: none; 
  color: #9ca3af; 
  cursor: pointer; 
  padding: 2px; 
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}
.chip-remove:hover { background: #f3f4f6; color: #374151; }

.drawer-footer { 
  padding: 20px 24px; 
  border-top: 1px solid #f3f4f6; 
  display: flex; 
  gap: 12px; 
  justify-content: space-between; 
}

/* Кнопки */
.btn { 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  padding: 12px 20px; 
  border: none; 
  border-radius: 8px; 
  font-size: 14px; 
  font-weight: 500; 
  cursor: pointer; 
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}
.btn--primary { 
  background: #22c55e; 
  color: white; 
}
.btn--primary:hover { 
  background: #16a34a; 
}
.btn--secondary { 
  background: #f3f4f6; 
  color: #374151; 
  border: 1px solid #e5e7eb;
}
.btn--secondary:hover { 
  background: #e5e7eb; 
}

/* Анимации */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform .25s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

/* Загрузчик */
.loader { 
  text-align: center; 
  padding: 80px 20px; 
  color: #6b7280;
}
.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
.loader-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Состояние пусто */
.empty-state { 
  text-align: center; 
  padding: 80px 20px; 
  max-width: 400px;
  margin: 0 auto;
}
.empty-icon { 
  width: 80px; 
  height: 80px; 
  color: #d1d5db; 
  margin-bottom: 20px; 
}
.empty-state h2 { 
  margin: 0 0 12px; 
  color: #374151; 
  font-size: 24px;
}
.empty-state p { 
  margin: 0 0 24px; 
  color: #6b7280; 
  line-height: 1.5;
}
.empty-actions { 
  display: flex; 
  gap: 12px; 
  justify-content: center;
  flex-wrap: wrap;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
  padding: 16px;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

/* Индикатор загрузки при бесконечной прокрутке */
.load-more-indicator {
  text-align: center;
  padding: 32px 20px;
  color: #6b7280;
}

.load-more-indicator .loader-spinner {
  margin-bottom: 12px;
}

/* Переключатель режима загрузки */
.load-mode-toggle {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  padding: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.toggle-slider:before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-input:checked + .toggle-slider {
  background: #22c55e;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .container { padding: 16px 12px; }
  
  .header-top__wrap { 
    flex-direction: column; 
    align-items: stretch;
    gap: 16px;
  }
  .page-header h1 { font-size: 28px; }
  
  .desktop-sort { display: none; }
  .mobile-sort { 
    display: block; 
    min-width: 140px;
  }
  .sort-select { min-width: auto; }
  
  .top-controls { 
    padding: 12px; 
    gap: 12px;
  }
  .controls-left { 
    flex-direction: column; 
    min-width: auto;
    gap: 8px;
  }
  .controls-right { 
    width: 100; 
    justify-content: space-between;
  }
  
  .filters-drawer { width: 90vw; }
  
  .empty-actions { flex-direction: column; }
  .btn { flex: none; }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .view-switcher { order: -1; }
  .controls-right { flex-wrap: wrap; }
  .filters-toggle { flex: 1; justify-content: center; }
}
</style>