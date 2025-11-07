<template>
  <article class="blog-card" @click="goToPost">
    <div class="blog-card__image">
      <img :src="post.image" :alt="post.title" loading="lazy" />
      <span class="category-badge">{{ post.category }}</span>
    </div>
    
    <div class="blog-card__body">
      <h3 class="title">{{ post.title }}</h3>
      <p class="excerpt">{{ post.excerpt }}</p>
      
      <div class="meta">
        <span class="author">{{ post.author }}</span>
        <span class="sep">·</span>
        <span class="date">{{ formatDate(post.date) }}</span>
        <span class="sep">·</span>
        <span class="read-time">{{ post.readTime }} мин чтения</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  post: { type: Object, required: true }
})

const goToPost = () => {
  router.push(`/app/blog/${props.post.id}`)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.blog-card { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; cursor:pointer; transition: box-shadow .2s ease; }
.blog-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.blog-card__image { position:relative; aspect-ratio: 16/9; overflow:hidden; background:#f3f4f6; }
.blog-card__image img { width:100%; height:100%; object-fit:cover; }
.category-badge { position:absolute; top:12px; left:12px; background:#22c55e; color:#fff; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:500; }
.blog-card__body { padding:16px; display:flex; flex-direction:column; gap:10px; }
.title { margin:0; font-size:18px; line-height:1.3; }
.excerpt { margin:0; color:#6b7280; font-size:14px; line-height:1.5; }
.meta { display:flex; align-items:center; gap:6px; font-size:13px; color:#9ca3af; }
.author { font-weight:500; color:#374151; }
.sep { color:#d1d5db; }
</style>
