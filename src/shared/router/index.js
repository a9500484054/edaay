import { createRouter, createWebHistory } from 'vue-router'

const LandingPage   = () => import('@/pages/landing/index.vue')
const MainLayout    = () => import('@/pages/main/index.vue')

const RecipesHome   = () => import('@/widgets/recipe-grid/index.vue')
const MyRecipesHome = () => import('@/pages/main/my-recipes.vue')
const RecipeDetails = () => import('@/entities/recipe/ui/recipe-details.vue')
const Planner       = () => import('@/pages/main/planner.vue')
const ShoppingList  = () => import('@/pages/main/shopping-list.vue')
const Settings      = () => import('@/pages/main/settings.vue')

// Новые заглушки
const Blog         = () => import('@/pages/main/blog.vue')
const Help         = () => import('@/pages/main/help.vue')

const routes = [
  { path: '/', name: 'landing-public', component: LandingPage },
  {
    path: '/app',
    component: MainLayout,
    children: [
      { path: '', redirect: { name: 'recipes' } },
      { path: 'recipes', name: 'recipes', component: RecipesHome },
      { path: 'my-recipes', name: 'my-recipes', component: MyRecipesHome },
      { path: 'recipes/:id', name: 'recipe-details', component: RecipeDetails, props: true },
      { path: 'planner', name: 'planner', component: Planner },
      { path: 'shopping-list', name: 'shopping-list', component: ShoppingList },
      { path: 'settings', name: 'settings', component: Settings },
      { path: 'blog', name: 'blog', component: Blog },
      { path: 'help', name: 'help', component: Help },
      { path: 'landing', name: 'about', component: LandingPage }, // внутренняя ссылка на публичный лендинг как «О проекте»
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]



const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

export default router
