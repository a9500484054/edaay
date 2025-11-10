<template>

  <div class="layout">
    <!-- Off-canvas overlay for mobile -->
    <transition name="fade">
      <div v-if="isMobile && sidebarOpen" class="overlay" @click="sidebarOpen = false" />
    </transition>

    <!-- Sidebar container -->
    <aside
      class="sidebar"
      :class="{
        'sidebar--collapsed': isTablet && collapsed,
        'sidebar--mobile': isMobile,
        'sidebar--open': isMobile && sidebarOpen
      }"
      aria-label="Боковое меню"
    >
      <Sidebar v-model="sidebarOpen" v-model:collapsed="collapsed" />
    </aside>

    <!-- Content -->
    <main class="content">
      <AppHeader :is-mobile="isMobile" @toggle-sidebar="sidebarOpen = true" />

      <section class="outlet">

        <RouterView />
      </section>

      <AppFooter :cart-count="cartCount" />

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import Sidebar from '@/widgets/sidebar/index.vue'
import AppHeader from '@/widgets/app-header/index.vue'
import AppFooter from '@/widgets/app-footer/index.vue'
import { useBreakpoints } from '@/shared/composables/useBreakpoints'

const { isMobile, isTablet, isDesktop, device } = useBreakpoints()

const sidebarOpen = ref(false)
const collapsed = ref(true)

const width = ref(window.innerWidth)
const onResize = () => { width.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

</script>

<style scoped>


.layout { display:flex; min-height: 100dvh;}

/* Sidebar base */
.sidebar {
  position: fixed;
  width: var(--sidebar-w);
  border-right: 1px solid var(--border);
  background: #fff;
  transition: width .2s ease, transform .2s ease, box-shadow .2s ease;
  z-index: 20;
  height: 100vh;
}

/* Tablet collapsed */
.sidebar--collapsed { width: var(--sidebar-w-collapsed); }

/* Mobile off-canvas */
.sidebar--mobile {
  position: fixed;
  top: 0; bottom: 0; left: 0;
  width: 86vw; max-width: 360px;
  transform: translateX(-100%);
  box-shadow: 0 10px 40px rgba(0,0,0,.2);
}
.sidebar--mobile.sidebar--open {
  transform: translateX(0);
}

/* Overlay for mobile */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 15;
}

/* Content */
.content { flex:1; display:flex; flex-direction:column; min-width: 0;  margin-left: var(--sidebar-w);}
.content__header {
  display:flex; align-items:center; gap:12px;
  min-height: 56px; padding: 8px 12px; border-bottom:1px solid var(--border); background:#fff;
}
.hamburger {
  width:36px; height:36px; border:none; border-radius:8px; background:#f3f4f6; color:#374151; display:grid; place-items:center; cursor:pointer;
}
.hamburger:hover { background:#e5e7eb; }

/* Outlet */
.outlet { flex:1; padding: 16px; background: #f3f3f3; }

/* Old breakpoint kept for extra safety */
@media (max-width: 960px){
  .sidebar { width: var(--sidebar-w-collapsed); }
  .content { margin-left: var(--sidebar-w-collapsed);}
}
@media (max-width: 1023px){
  .content { margin-left: var(--sidebar-w-collapsed);}
}

/* Hide sidebar base at mobile: handled by off-canvas state */
@media (max-width: 639px){
  .sidebar { width: 86vw; }
  .content { margin-left: 0; }
  .outlet { margin-top: 64px; }

}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
