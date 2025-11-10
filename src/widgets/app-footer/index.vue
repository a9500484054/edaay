<template>
  <nav class="mb-footer" role="navigation" aria-label="Нижняя навигация">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="mb-footer__item"
      :class="{ active: route.path.startsWith(item.to) }"
      :aria-label="item.label"
    >
      <Icon :icon="item.icon" class="icon" />
      <span class="label">{{ item.label }}</span>

      <span v-if="item.badge && item.badge > 0" class="badge">{{ badgeCap(item.badge) }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

// Примеры путей — подстройте под своё приложение
const props = defineProps({
  cartCount: { type: Number, default: 0 }
})

const route = useRoute()
const items = computed(() => [
  { to: '/app/my-recipes', label: 'Рецепты', icon: 'mdi:book-open-page-variant' },
  { to: '/app/planner', label: 'План', icon: 'mdi:calendar-month' },
  { to: '/app/shopping-list', label: 'Покупки', icon: 'mdi:cart-outline', badge: props.cartCount },
  { to: '/app/profile', label: 'Профиль', icon: 'mdi:account' }
])

const badgeCap = (n) => (n > 99 ? '99+' : n)
</script>

<style scoped>
.mb-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #e5e7eb;
  
}

/* Скрыть на ≥640px */
@media (min-width: 640px) {
  .mb-footer { display: none; }
}

.mb-footer__item {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 6px 4px;
  text-decoration: none;
  color: #111827;
  border-radius: 10px;
}
.mb-footer__item .icon { width: 22px; height: 22px; }
.mb-footer__item .label { font-size: 11px; line-height: 1; }

.mb-footer__item.active {
  background: #f0fdf4;
  color: #16a34a;
}
.mb-footer__item:active { transform: translateY(1px); }

.badge {
  position: absolute;
  top: 0;
  right: 14px;
  transform: translate(50%, -30%);
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display:flex; align-items:center; justify-content:center;
}
</style>
