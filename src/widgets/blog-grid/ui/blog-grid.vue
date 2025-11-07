<template>
  <div class="blog-grid">
    <BlogCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script setup>
import BlogCard from '@/entities/blog/ui/blog-card.vue'

defineProps({
  posts: { type: Array, default: () => [] }
})
</script>

<style scoped>
.blog-grid { display:grid; gap:20px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
</style>
