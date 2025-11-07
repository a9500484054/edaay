<template>
  <div class="page">
    <HeaderBar />
    <main class="container">
      <header class="page-header">
        <h1>Шеф Блог</h1>
        <p class="subtitle">Советы, рецепты и полезные статьи о еде и планировании меню</p>
      </header>

      <div v-if="loading" class="loader">Загрузка...</div>
      <BlogGrid v-else :posts="posts" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeaderBar from '@/widgets/header/index.vue'
import BlogGrid from '@/widgets/blog-grid/ui/blog-grid.vue'
import { fetchBlogPosts } from '@/shared/api/blogApi'

const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    posts.value = await fetchBlogPosts()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { min-height:100vh; background:#f9fafb; }
.container { max-width:1280px; margin:0 auto; padding:24px 16px; }
.page-header { margin-bottom:32px; }
.page-header h1 { margin:0 0 6px; font-size:36px; }
.subtitle { color:#6b7280; margin:0; font-size:16px; }
.loader { text-align:center; padding:40px; color:#6b7280; }
</style>
