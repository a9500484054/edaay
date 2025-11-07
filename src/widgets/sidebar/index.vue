<template>
  <div class="side">
    <header class="side__header">
      <RouterLink to="/app" class="side__logo">
        <img :src="logo" alt="Edaay" />
      </RouterLink>
    </header>

    <section class="side__user">
      <SidebarUser />
    </section>
    <nav class="side__nav">
      <SidebarSection v-if="isAuth" :title="'Пользователь'" :links="mainLinks" />
      <SidebarSection :title="'Общие'" :links="exploreLinks" />
      <SidebarSection :title="'Поддержка'" :links="supportLinks" class="side__support" />
    </nav>

    <footer class="side__footer">
      <SocialLinks />
      <LegalLinks />
      <small>© 2025–2026 ЕдаАУ. Все права защищены</small>
    </footer>
  </div>
</template>

<script setup>
import SidebarUser from './ui/sidebar-user.vue'
import SidebarSection from './ui/sidebar-section.vue'
import SocialLinks from './ui/social-links.vue'
import LegalLinks from './ui/legal-links.vue'
import logo from '@/app/assets/images/logo-edaay.svg'

import { useAuthStore } from '@/entities/auth/model/auth.store'
import { computed } from 'vue'
const auth = useAuthStore()
const isAuth = computed(() => auth.isAuth)
const user = computed(() => auth.user)
const logout = () => auth.logout()

const mainLinks = [
  { to: '/app/my-recipes', label: 'Мои рецепты', icon: 'mdi:book-open-page-variant' },
  { to: '/app/planner', label: 'Планировщик меню', icon: 'mdi:calendar-month' },
  { to: '/app/shopping-list', label: 'Список покупок', icon: 'mdi:cart-outline', badge: 0 },
]

const exploreLinks = [
  { to: '/app/landing', label: 'О проекте', icon: 'mdi:information-outline' },
  { to: '/app/recipes', label: 'Идеи рецептов', icon: 'mdi:lightbulb-on-outline' },
  { to: '/app/blog', label: 'Шеф Блог', icon: 'mdi:note-edit-outline' },
]

const supportLinks = [
  { to: '/app/help', label: 'Помощь', icon: 'mdi:help-circle-outline' },
  { to: '/app/settings', label: 'Настройки', icon: 'mdi:cog-outline' },
]
</script>

<style scoped>
.side { display:flex; flex-direction:column; gap:16px; padding:16px; height:100%; }
.side__header { display:flex; align-items:center;}
.side__logo img { height:42px; }
.side__user { padding: 4px 0 8px; border-bottom:1px solid var(--border); }
.side__nav { display:flex; flex-direction:column; gap:12px; flex:1; overflow:auto; padding-right:4px; }
.side__support { margin-top: auto;}
.side__footer { display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--border); padding-top:12px; }
</style>
