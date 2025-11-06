<template>
  <header class="header">
    <RouterLink to="/app/recipes" class="logo">Edaay</RouterLink>
    <SearchBar />
  </header>
</template>
<script setup>
import SearchBar from '@/features/recipe-search/ui/search-bar.vue'
</script>
<style scoped>
.header { position:sticky; top:0; z-index:10; display:flex; gap:16px; align-items:center; padding:12px 16px; border-bottom:1px solid var(--border); background: var(--bg, #fff); }
.logo { font-weight:600; }
</style>