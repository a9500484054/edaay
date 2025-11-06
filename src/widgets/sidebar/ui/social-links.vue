<!-- widgets/sidebar/ui/social-links.vue -->
<template>
  <div class="social">
    <a
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      target="_blank"
      rel="noopener"
      class="social__item"
      :aria-label="link.label"
    >
      <Icon v-if="link.icon" :icon="link.icon" class="icon" />
      <span v-if="showLabels" class="label">{{ link.label }}</span>
    </a>
  </div>
</template>

<script setup>
  import { Icon } from '@iconify/vue'

const props = defineProps({
  showLabels: { type: Boolean, default: false },
})
const links = [
  { href: 'https://vk.com',       label: 'VK',       icon: 'mdi:vk' },
  { href: 'https://t.me',         label: 'Telegram', icon: 'mdi:telegram' },
  { href: 'https://youtube.com',  label: 'YouTube',  icon: 'mdi:youtube' },
]
</script>

<style scoped>
.social { display:flex; gap:10px; flex-wrap:wrap; }
.social__item { display:inline-flex; align-items:center; gap:6px; color:#6b7280; }
.social__item:hover { color:#111827; }
.icon { width:40px; height:40px; }
.label { font-size:12px; }
</style>
