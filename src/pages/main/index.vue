<template>
  <div class="layout">
    <aside class="sidebar">
      <Sidebar />
    </aside>
    <main class="content">
      <section class="outlet">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/widgets/sidebar/index.vue'
</script>

<style scoped>
.layout { display:flex; min-height: 100dvh; }
.sidebar { width: 280px; border-right: 1px solid var(--border); }
.content { flex:1; display:flex; flex-direction:column; }
.outlet { flex:1; padding: 16px; }
@media (max-width: 960px){
  .sidebar { width: 72px; }
}
</style>
