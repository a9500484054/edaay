<template>
  <header class="app-header" v-if="isMobile">
    <div class="app-header-logo">
      <RouterLink to="/app" class="app-header-logo__logo">
        <img :src="logo" alt="Edaay" />
      </RouterLink>
    </div>

    <button
      class="hamburger"
      @click="$emit('toggle-sidebar')"
      aria-label="Открыть меню"
      title="Меню"
    >
      <Icon icon="mdi:menu" />
    </button>

    <!-- <div class="header-slot">
      <slot />
    </div>

    <div class="header-actions">
      <slot name="actions" />
    </div> -->
  </header>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import logo from '@/app/assets/images/logo-edaay.svg'

defineProps({
  isMobile: { type: Boolean, default: false }
})
defineEmits(['toggle-sidebar'])
</script>

<style scoped>
.app-header {
  display:flex; align-items:center; gap:12px;
  min-height: 56px; padding: 8px 12px;
  border-bottom:1px solid var(--border); background:#fff;
  position: fixed;
  width: 100%;
  z-index: 11;
}
.app-header-logo__logo img{
  width: 4rem;
}
.hamburger {
  width:36px; height:36px; border:none; border-radius:8px; margin-left: auto;
  background:#f3f4f6; color:#374151; display:grid; place-items:center; cursor:pointer;
}
.hamburger:hover { background:#e5e7eb; }
.header-slot { flex:1; min-width:0; }
.header-actions { display:flex; gap:8px; align-items:center; }
</style>
