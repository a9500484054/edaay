// Моковое хранилище планов
let planStorage = {
  // '2025-11-07': { breakfast: [recipe], lunch: [], dinner: [], snack: [] }
}

export async function fetchWeekPlan(weekStartDate) {
  await wait(300)
  // В реальном приложении - запрос к API с датой начала недели
  return { ...planStorage }
}

export async function saveMealPlan(date, mealId, recipes) {
  await wait(200)
  if (!planStorage[date]) {
    planStorage[date] = { breakfast: [], lunch: [], dinner: [], snack: [] }
  }
  planStorage[date][mealId] = [...recipes]
  return { success: true }
}

export async function clearWeekPlan(weekStartDate) {
  await wait(200)
  planStorage = {}
  return { success: true }
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }
