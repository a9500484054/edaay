<template>
  <HeaderBar />
  <div class="grid">
    <div class="card" v-for="n in 9" :key="n">
      <h3>Рецепт {{ n }}</h3>
      <p>20 мин · 2 порции · 250 ккал</p>
      <button>+ Добавить</button>
    </div>
  </div>
</template>
<script setup>
  import HeaderBar from '@/widgets/header/index.vue'

</script>
<style scoped>
.grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.card { border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
</style>
