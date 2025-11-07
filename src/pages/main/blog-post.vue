<template>
  <div class="page">
    <HeaderBar />
    <main class="container">
      <button class="back-btn" @click="$router.back()">
        <Icon icon="mdi:arrow-left" class="icon" />
        Назад к блогу
      </button>

      <div v-if="loading" class="loader">Загрузка...</div>
      <div v-else-if="!post" class="error">Статья не найдена</div>

      <article v-else class="post">
        <header class="post__header">
          <span class="category-badge">{{ post.category }}</span>
          <h1>{{ post.title }}</h1>
          
          <div class="meta">
            <div class="author-info">
              <div class="avatar">{{ post.author[0] }}</div>
              <div>
                <div class="author-name">{{ post.author }}</div>
                <div class="post-meta">
                  {{ formatDate(post.date) }} · {{ post.readTime }} мин чтения
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="post__image">
          <img :src="post.image" :alt="post.title" />
        </div>

        <div class="post__content" v-html="post.content"></div>

        <footer class="post__footer">
          <div class="share">
            <span>Поделиться:</span>
            <button class="share-btn" @click="share('twitter')">
              <Icon icon="mdi:twitter" class="icon" />
            </button>
            <button class="share-btn" @click="share('facebook')">
              <Icon icon="mdi:facebook" class="icon" />
            </button>
            <button class="share-btn" @click="share('telegram')">
              <Icon icon="mdi:telegram" class="icon" />
            </button>
          </div>
        </footer>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '@/widgets/header/index.vue'
import { fetchBlogPostById } from '@/shared/api/blogApi'

const route = useRoute()
const post = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = route.params.id
    post.value = await fetchBlogPostById(Number(id))
  } finally {
    loading.value = false
  }
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const share = (platform) => {
  console.log('Share to', platform)
  // TODO: реализовать шаринг
}
</script>

<style scoped>
.page { min-height:100vh; background:#f9fafb; }
.container { max-width:800px; margin:0 auto; padding:24px 16px; }
.back-btn { display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; color:#15803d; cursor:pointer; margin-bottom:24px; }
.back-btn:hover { text-decoration:underline; }
.icon { width:18px; height:18px; }
.loader, .error { text-align:center; padding:40px; color:#6b7280; }

.post { background:#fff; border-radius:16px; padding:40px; }
.post__header { margin-bottom:32px; }
.category-badge { display:inline-block; background:#22c55e; color:#fff; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:500; margin-bottom:16px; }
.post__header h1 { margin:0 0 20px; font-size:40px; line-height:1.2; }

.meta { border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:16px 0; }
.author-info { display:flex; align-items:center; gap:12px; }
.avatar { width:48px; height:48px; border-radius:50%; background:#22c55e; color:#fff; display:grid; place-items:center; font-size:20px; font-weight:600; }
.author-name { font-weight:500; color:#111827; margin-bottom:4px; }
.post-meta { font-size:14px; color:#6b7280; }

.post__image { margin-bottom:32px; border-radius:12px; overflow:hidden; }
.post__image img { width:100%; height:auto; display:block; }

.post__content { line-height:1.8; color:#374151; }
.post__content :deep(h2) { margin:32px 0 16px; font-size:28px; color:#111827; }
.post__content :deep(h3) { margin:24px 0 12px; font-size:22px; color:#111827; }
.post__content :deep(p) { margin:0 0 20px; }
.post__content :deep(ul), .post__content :deep(ol) { margin:0 0 20px; padding-left:24px; }
.post__content :deep(li) { margin-bottom:8px; }

.post__footer { margin-top:40px; padding-top:24px; border-top:1px solid #e5e7eb; }
.share { display:flex; align-items:center; gap:12px; }
.share span { color:#6b7280; font-weight:500; }
.share-btn { width:40px; height:40px; border-radius:50%; border:1px solid #e5e7eb; background:#fff; display:grid; place-items:center; cursor:pointer; color:#6b7280; }
.share-btn:hover { background:#f9fafb; color:#111827; }

@media (max-width: 768px) {
  .post { padding:24px 20px; }
  .post__header h1 { font-size:28px; }
}
</style>
