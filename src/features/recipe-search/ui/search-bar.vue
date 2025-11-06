<template>
  <div class="search">
    <input v-model="q" type="search" placeholder="Поиск рецептов..." @keyup.enter="go" />
    <button @click="go">Найти</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const q = ref('')
const router = useRouter()
const go = () => {
  router.push({ name: 'recipes', query: { q: q.value } })
}
</script>
<style scoped>
.search { display:flex; gap:8px; flex:1; }
.search input { flex:1; }
</style>
