<!-- widgets/sidebar/ui/sidebar-section.vue -->
<template>
  <section class="section">
    <div v-if="title" class="section__title">
      <span>{{ title }}</span>
    </div>

    <transition name="slide">
      <ul v-show="open" class="section__list">
        <li v-for="item in links" :key="itemKey(item)">
          <SidebarLink :to="item.to" :label="item.label">
            <template #icon>
              <Icon v-if="item.icon" :icon="item.icon" class="w-5 h-5" />
            </template>
            {{ item.label }}
          </SidebarLink>
        </li>
      </ul>
    </transition>
  </section>
</template>
<script setup>
  import { ref } from 'vue'
  import SidebarLink from './sidebar-link.vue'
  import { Icon } from '@iconify/vue'

  const props = defineProps({
    title: { type: String, default: '' },
    links: { type: Array, default: () => [] },
    icon: { type: String, default: '' },
    defaultOpen: { type: Boolean, default: true },
  })
  const open = ref(props.defaultOpen)
  const itemKey = (item) => (typeof item.to === 'string' ? item.to : item.to.name || item.label)
</script>
<style scoped>
.section { display:flex; flex-direction:column; gap:6px; }
.section__title { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; background:transparent; border:0; padding:6px 8px; border-radius:6px; cursor:pointer; }
.section__title:hover { background:#f3f4f6; }
.section__list { display:flex; flex-direction:column; gap:4px; list-style:none; padding:0; margin:0; }
.icon { width:18px; height:18px; }
.chev { transform: rotate(-90deg); transition: .15s transform; }
.chev.open { transform: rotate(0); }
.slide-enter-active, .slide-leave-active { transition: all .15s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
</style>
