<template>
  <div class="page">
    <HeaderBar />
    <main class="container">
      <header class="page-header">
        <div class="header-content">
          <div>
            <h1>Планировщик меню</h1>
            <p class="subtitle">Планируйте питание на неделю и формируйте список покупок</p>
          </div>
          <div class="header-actions">
            <button class="btn btn--secondary" @click="clearWeek">
              <Icon icon="mdi:delete-outline" class="icon" />
              Очистить неделю
            </button>
            <button class="btn btn--primary" @click="generateShoppingList">
              <Icon icon="mdi:cart-outline" class="icon" />
              Создать список покупок
            </button>
          </div>
        </div>
      </header>

      <!-- Навигация по неделям -->
      <div class="week-nav">
        <button class="nav-btn" @click="previousWeek">
          <Icon icon="mdi:chevron-left" class="icon" />
        </button>
        <div class="week-info">
          <span class="week-label">Неделя</span>
          <span class="week-date">{{ currentWeekRange }}</span>
        </div>
        <button class="nav-btn" @click="nextWeek">
          <Icon icon="mdi:chevron-right" class="icon" />
        </button>
        <button class="nav-btn" @click="goToToday" title="Сегодня">
          <Icon icon="mdi:calendar-today" class="icon" />
        </button>
      </div>

      <!-- Календарь меню -->
      <div class="planner-grid">
        <!-- Заголовки дней -->
        <div class="day-header empty"></div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-header"
          :class="{ today: isToday(day.date) }"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ formatDate(day.date) }}</div>
        </div>

        <!-- Строки для приёмов пищи -->
        <template v-for="meal in mealTypes" :key="meal.id">
          <div class="meal-label">
            <Icon :icon="meal.icon" class="icon" />
            <span>{{ meal.name }}</span>
          </div>

          <div 
            v-for="day in weekDays" 
            :key="`${day.date}-${meal.id}`"
            class="meal-cell"
            :class="{ 
              today: isToday(day.date),
              'drag-over': isDragOver(day.date, meal.id)
            }"
            @click="openRecipeSelector(day.date, meal.id)"
            @drop="onDrop($event, day.date, meal.id)"
            @dragover.prevent="onDragOver($event, day.date, meal.id)"
            @dragleave="onDragLeave"
          >
            <div v-if="getMealRecipes(day.date, meal.id).length === 0" class="empty-cell">
              <Icon icon="mdi:plus" class="icon-sm" />
              <span>Добавить</span>
            </div>

            <div v-else class="recipe-cards">
              <div 
                v-for="recipe in getMealRecipes(day.date, meal.id)" 
                :key="recipe.id"
                class="recipe-mini-card"
                draggable="true"
                @dragstart="onDragStart($event, day.date, meal.id, recipe)"
                @dragend="onDragEnd"
              >
                <div class="drag-handle">
                  <Icon icon="mdi:drag-vertical" class="icon-xs" />
                </div>
                <img :src="recipe.image" :alt="recipe.title" class="recipe-img" />
                <div class="recipe-info">
                  <div class="recipe-title">{{ recipe.title }}</div>
                  <div class="recipe-meta">{{ recipe.servings }} порц</div>
                </div>
                <button 
                  class="remove-btn" 
                  @click.stop="removeRecipe(day.date, meal.id, recipe.id)"
                  title="Удалить"
                >
                  <Icon icon="mdi:close" class="icon-xs" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/shared/ui/modal/modal-service' // используем сервис, а не локальный Modal
import HeaderBar from '@/widgets/header/index.vue'
import RecipeSelectorModal from '@/shared/features/recipe-selector/recipe-selector-modal.vue'
import { fetchWeekPlan, saveMealPlan, clearWeekPlan } from '@/shared/api/plannerApi'
import { Icon } from '@iconify/vue'

const router = useRouter()
const { open } = useModal()

const currentWeekStart = ref(getMonday(new Date()))
const weekPlan = ref({}) // { 'YYYY-MM-DD': { breakfast: [], lunch: [], dinner: [] } }

// Drag and drop state
const draggedItem = ref(null) // { date, mealId, recipe }
const dragOverCell = ref(null) // { date, mealId }

const mealTypes = [
  { id: 'breakfast', name: 'Завтрак', icon: 'mdi:coffee-outline' },
  { id: 'lunch', name: 'Обед', icon: 'mdi:food-variant' },
  { id: 'dinner', name: 'Ужин', icon: 'mdi:moon-waning-crescent' },
  { id: 'snack', name: 'Перекус', icon: 'mdi:fruit-cherries' },
]

const weekDays = computed(() => {
  const days = []
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    days.push({
      name: dayNames[i],
      date: formatDateKey(date)
    })
  }
  
  return days
})

const currentWeekRange = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  const startStr = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  const endStr = end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  
  return `${startStr} — ${endStr}`
})

onMounted(async () => {
  await loadWeekPlan()
})

const loadWeekPlan = async () => {
  const plan = await fetchWeekPlan(currentWeekStart.value)
  weekPlan.value = plan
}

const getMealRecipes = (date, mealId) => {
  return weekPlan.value[date]?.[mealId] || []
}

const openRecipeSelector = (date, mealId) => {
  open(
    RecipeSelectorModal,
    { 
      onSelect: (recipe) => addRecipeToMeal(date, mealId, recipe)
    },
    { title: 'Выберите рецепт', size: 'medium', showFooter: false }
  )
}

const addRecipeToMeal = async (date, mealId, recipe) => {
  if (!weekPlan.value[date]) {
    weekPlan.value[date] = { breakfast: [], lunch: [], dinner: [], snack: [] }
  }
  
  weekPlan.value[date][mealId].push(recipe)
  await saveMealPlan(date, mealId, weekPlan.value[date][mealId])
}

const removeRecipe = async (date, mealId, recipeId) => {
  const meals = weekPlan.value[date][mealId]
  weekPlan.value[date][mealId] = meals.filter(r => r.id !== recipeId)
  await saveMealPlan(date, mealId, weekPlan.value[date][mealId])
}

const clearWeek = async () => {
  if (!confirm('Очистить план на эту неделю?')) return
  weekPlan.value = {}
  await clearWeekPlan(currentWeekStart.value)
}

const generateShoppingList = () => {
  const allIngredients = []
  
  Object.values(weekPlan.value).forEach(day => {
    Object.values(day).forEach(meals => {
      meals.forEach(recipe => {
        if (recipe.ingredients) {
          allIngredients.push(...recipe.ingredients)
        }
      })
    })
  })
  
  router.push({ name: 'shopping-list', query: { fromPlanner: '1' } })
  localStorage.setItem('plannerIngredients', JSON.stringify(allIngredients))
}

// Drag and Drop handlers
const onDragStart = (event, date, mealId, recipe) => {
  draggedItem.value = { date, mealId, recipe }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', recipe.id)
  
  // Визуальный эффект
  event.target.style.opacity = '0.5'
}

const onDragEnd = (event) => {
  event.target.style.opacity = '1'
  draggedItem.value = null
  dragOverCell.value = null
}

const onDragOver = (event, date, mealId) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverCell.value = { date, mealId }
}

const onDragLeave = () => {
  dragOverCell.value = null
}

const onDrop = async (event, targetDate, targetMealId) => {
  event.preventDefault()
  dragOverCell.value = null
  
  if (!draggedItem.value) return
  
  const { date: sourceDate, mealId: sourceMealId, recipe } = draggedItem.value
  
  // Если перетаскиваем в ту же ячейку - игнорируем
  if (sourceDate === targetDate && sourceMealId === targetMealId) return
  
  // Удаляем из источника
  const sourceMeals = weekPlan.value[sourceDate][sourceMealId]
  weekPlan.value[sourceDate][sourceMealId] = sourceMeals.filter(r => r.id !== recipe.id)
  await saveMealPlan(sourceDate, sourceMealId, weekPlan.value[sourceDate][sourceMealId])
  
  // Добавляем в целевую ячейку
  if (!weekPlan.value[targetDate]) {
    weekPlan.value[targetDate] = { breakfast: [], lunch: [], dinner: [], snack: [] }
  }
  weekPlan.value[targetDate][targetMealId].push(recipe)
  await saveMealPlan(targetDate, targetMealId, weekPlan.value[targetDate][targetMealId])
  
  draggedItem.value = null
}

const isDragOver = (date, mealId) => {
  return dragOverCell.value?.date === date && dragOverCell.value?.mealId === mealId
}

const previousWeek = () => {
  const prev = new Date(currentWeekStart.value)
  prev.setDate(prev.getDate() - 7)
  currentWeekStart.value = prev
  loadWeekPlan()
}

const nextWeek = () => {
  const next = new Date(currentWeekStart.value)
  next.setDate(next.getDate() + 7)
  currentWeekStart.value = next
  loadWeekPlan()
}

const goToToday = () => {
  currentWeekStart.value = getMonday(new Date())
  loadWeekPlan()
}

const isToday = (dateStr) => {
  return dateStr === formatDateKey(new Date())
}

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}`
}

const formatDateKey = (date) => {
  return date.toISOString().split('T')[0]
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f9fafb; }
.container { max-width: 1400px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.header-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.page-header h1 { margin: 0 0 6px; font-size: 36px; }
.subtitle { color: #6b7280; margin: 0; font-size: 16px; }
.header-actions { display: flex; gap: 10px; }

.btn { height: 40px; border-radius: 8px; border: none; display: inline-flex; align-items: center; gap: 8px; padding: 0 16px; cursor: pointer; font-weight: 500; }
.btn--primary { background: #22c55e; color: #fff; }
.btn--primary:hover { background: #16a34a; }
.btn--secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
.btn--secondary:hover { background: #f9fafb; }
.icon { width: 18px; height: 18px; }
.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 12px; height: 12px; }

.week-nav { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: #fff; border-radius: 12px; }
.nav-btn { width: 36px; height: 36px; border: none; border-radius: 8px; background: #f3f4f6; display: grid; place-items: center; cursor: pointer; color: #374151; }
.nav-btn:hover { background: #e5e7eb; }
.week-info { text-align: center; }
.week-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px; }
.week-date { font-size: 16px; font-weight: 600; }

.planner-grid { display: grid; grid-template-columns: 100px repeat(7, 1fr); gap: 1px; background: #e5e7eb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }

.day-header, .meal-label, .meal-cell { background: #fff; padding: 12px; }
.day-header.empty { background: #f9fafb; }
.day-header { text-align: center; font-weight: 600; }
.day-header.today { background: #ecfdf5; }
.day-name { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
.day-date { font-size: 16px; }

.meal-label { display: flex; align-items: center; gap: 8px; font-weight: 500; background: #f9fafb; }

.meal-cell { min-height: 100px; cursor: pointer; transition: background 0.15s; position: relative; }
.meal-cell:hover { background: #f9fafb; }
.meal-cell.today { background: #f0fdf4; }
.meal-cell.today:hover { background: #dcfce7; }
.meal-cell.drag-over { background: #dbeafe; border: 2px dashed #3b82f6; }

.empty-cell { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #9ca3af; }

.recipe-cards { display: flex; flex-direction: column; gap: 8px; }
.recipe-mini-card { display: flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; transition: box-shadow 0.15s; cursor: grab; }
.recipe-mini-card:active { cursor: grabbing; }
.recipe-mini-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,.06); }

.drag-handle { display: grid; place-items: center; color: #d1d5db; cursor: grab; padding: 0 4px; }
.drag-handle:active { cursor: grabbing; }

.recipe-img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; }
.recipe-info { flex: 1; min-width: 0; }
.recipe-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.recipe-meta { font-size: 11px; color: #6b7280; }
.remove-btn { width: 20px; height: 20px; border: none; border-radius: 4px; background: #f3f4f6; display: grid; place-items: center; cursor: pointer; color: #6b7280; flex-shrink: 0; }
.remove-btn:hover { background: #fee2e2; color: #ef4444; }

@media (max-width: 1024px) {
  .planner-grid { grid-template-columns: 80px repeat(7, 1fr); font-size: 13px; }
  .header-content { flex-direction: column; align-items: stretch; }
  .header-actions { flex-direction: column; }
}

@media (max-width: 768px) {
  .planner-grid { grid-template-columns: 1fr; }
  .day-header, .meal-label { display: none; }
}
</style>
