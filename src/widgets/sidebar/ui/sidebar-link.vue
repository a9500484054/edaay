<!-- widgets/sidebar/ui/sidebar-link.vue -->
<template>
  <RouterLink :to="to" class="link" v-slot="{ isActive }">
    <button
      class="btn"
      :aria-current="isActive ? 'page' : null"
      :class="{ 'btn--active': isActive }"
      type="button"
    >
      <slot name="icon" />
      <span class="label">{{ label }}</span>
      <slot name="after" />
    </button>
  </RouterLink>
</template>
<script setup>
defineProps({
  to: { type: [String, Object], required: true },
  label: { type: String, required: true },
  is: { type: String },
})
</script>
<style scoped>
.link { display:block; text-decoration:none; }
.btn { width:100%; display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; background:transparent; border:none; text-align:left; color:#111827; cursor:pointer; }
.btn:hover { background:#f3f4f6; }
.btn--active { background:#eef2ff; color:#3730a3; }
.label { flex:1; }
</style>
