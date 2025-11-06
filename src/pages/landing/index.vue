<template>
  <div class="landing">
    <header class="landing__header">
      <h1>Edaay</h1>
      <nav>
        <RouterLink to="/app">Открыть приложение</RouterLink>
      </nav>
    </header>

    <section class="landing__hero">
      <h2>От идеи до покупки за 3 шага</h2>
      <p>Выбирайте рецепты, собирайте меню и получайте список покупок.</p>
      <RouterLink class="btn" to="/app">Начать бесплатно</RouterLink>
    </section>
  </div>
</template>
<script setup></script>
<style scoped>
.landing { padding: 24px; }
.landing__header { display:flex; justify-content:space-between; align-items:center; }
.landing__hero { margin: 64px 0; }
.btn { display:inline-block; padding:10px 16px; border:1px solid #ccc; border-radius:8px; }
</style>
