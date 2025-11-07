// Моковые данные для "Моих рецептов"
let myRecipesData = [
  {
    id: 101,
    title: 'Домашняя пицца Маргарита',
    time: 45,
    servings: 4,
    calories: 380,
    description: 'Моя любимая пицца с тонким тестом и базиликом',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    isCustom: true,
  },
  {
    id: 102,
    title: 'Бабушкин яблочный пирог',
    time: 60,
    servings: 8,
    calories: 290,
    description: 'Семейный рецепт, передаётся из поколения в поколение',
    image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400',
    isCustom: true,
  },
  {
    id: 103,
    title: 'Овощное рагу',
    time: 35,
    servings: 4,
    calories: 180,
    description: 'Лёгкое и полезное блюдо на каждый день',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    isCustom: true,
  },
]

export async function fetchMyRecipes() {
  await wait(400)
  return [...myRecipesData]
}

export async function deleteRecipe(id) {
  await wait(300)
  myRecipesData = myRecipesData.filter(r => r.id !== id)
  return { success: true }
}

export async function createRecipe(recipeData) {
  await wait(500)
  const newRecipe = {
    id: Date.now(),
    ...recipeData,
    isCustom: true,
  }
  myRecipesData.push(newRecipe)
  return newRecipe
}

export async function updateRecipe(id, updates) {
  await wait(400)
  const index = myRecipesData.findIndex(r => r.id === id)
  if (index !== -1) {
    myRecipesData[index] = { ...myRecipesData[index], ...updates }
    return myRecipesData[index]
  }
  throw new Error('Recipe not found')
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }
