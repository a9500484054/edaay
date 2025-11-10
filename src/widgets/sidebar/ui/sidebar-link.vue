<template>
  <RouterLink :to="to" class="link" v-slot="{ isActive }">
    <button
      class="btn"
      :aria-current="isActive ? 'page' : null"
      :class="[{ 'btn--active': isActive, compact }]"
      type="button"
      @mouseenter="showTooltip = compact ? true : false"
      @mouseleave="showTooltip = false"
      @focus="showTooltip = compact ? true : false"
      @blur="showTooltip = false"
    >
      <span class="icon-slot">
        <slot name="icon" />
      </span>
      <span v-if="!compact" class="label">{{ label }}</span>
      <span v-if="!compact" class="after-slot">
        <slot name="after" />
      </span>
    </button>

    <!-- Tooltip для compact -->
    <transition name="fade">
      <div
        v-if="compact && showTooltip"
        class="tooltip"
        role="tooltip"
      >
        <span class="tooltip__content">{{ label }}</span>
      </div>
    </transition>
  </RouterLink>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  to: { type: [String, Object], required: true },
  label: { type: String, required: true },
  compact: { type: Boolean, default: false }
})

const showTooltip = ref(false)
</script>

<style scoped>
.link { position: relative; display:block; text-decoration:none; }

/* Кнопка */
.btn {
  width:100%; display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:10px; background:transparent; border:none;
  text-align:left; color:#111827; cursor:pointer; transition: background .15s, color .15s;
}
.btn:hover { background:#f3f4f6; }
.btn--active { background:#ecfdf5; color:#22c55e; }

/* Иконка фикс */
.icon-slot :deep(svg), .icon-slot :deep(img) { width:22px; height:22px; display:block; }
.label { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.after-slot { display:inline-flex; align-items:center; }

/* Компактный режим */
.btn.compact { justify-content:center; padding:10px; gap:0; position: relative; }
.btn.compact .icon-slot :deep(svg),
.btn.compact .icon-slot :deep(img) { width:24px; height:24px; }
.btn.compact .label, .btn.compact .after-slot { display:none; }

/* Активный индикатор (слева) в compact */
.btn.compact.btn--active::before {
  content:''; position:absolute; left:0; top:8px; bottom:8px;
  width:3px; border-radius:2px; background:#22c55e;
}

/* Tooltip */
.tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: #111827;
  color: #fff;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0,0,0,.18);
  z-index: 10;
}
.tooltip::after {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent #111827 transparent transparent;
}

/* Анимация */
.fade-enter-active, .fade-leave-active { transition: opacity .12s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Фокус */
.btn:focus-visible { outline: 2px solid #22c55e; outline-offset: 2px; border-radius: 10px; }
</style>
