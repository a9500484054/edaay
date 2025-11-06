<template>
  <div class="user">
    <button v-if="!isAuth" class="cta" @click="openLogin">
      <!-- <div class="avatar --guest">
        <Icon name="mdi:account-circle-outline" class="icon" />
      </div> -->
      <div class="meta">
        <strong>Войти</strong>
        <small>Доступ к спискам с любого устройства</small>
      </div>
    </button>

    <div v-else class="profile">
      <button class="profile__btn" @click="toggleMenu">
        <div class="avatar">
          <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
          <Icon v-else name="mdi:account-circle" class="icon" />
        </div>
        <div class="meta">
          <strong>{{ user.name }}</strong>
          <small>{{ user.email }}</small>
        </div>
        <Icon name="mdi:chevron-down" class="chev" :class="{ open: menuOpen }" />
      </button>

      <transition name="fade">
        <ul v-if="menuOpen" class="menu" @mouseleave="menuOpen=false">
          <li><button type="button" @click="openSettings">Настройки</button></li>
          <li><button type="button" @click="logout">Выйти</button></li>
        </ul>
      </transition>
    </div>

    <!-- Кнопка для демонстрации менеджера модалок (можно убрать) -->
    <!-- <button class="cta" @click="openSettings">Открыть настройки</button> -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useModal } from '@/shared/ui/modal/modal-service' // путь без подпапки modal
import SettingsPanel from '@/pages/main/settings.vue'
import AuthModal from '@/widgets/auth/auth-modal.vue'

const user = ref(null)
user.value = { name: '', email: 'maria@example.com', avatar: '' }

const isAuth = computed(() => !!user.value)
const menuOpen = ref(false)

const toggleMenu = () => (menuOpen.value = !menuOpen.value)
const logout = () => { user.value = null; menuOpen.value = false }

const { open } = useModal()
const openLogin = () =>
  open(AuthModal, {}, { title: '', size: 'fullscreen', animation: 'slide-fade', persistent: false, showHeader: false, showFooter: false  })

const openSettings = () =>
  open(SettingsPanel, {}, { title: 'Настройки', size: 'modal--sm', animation: 'slide-fade', persistent: false })
</script>

<style scoped>
.user { display:flex; flex-direction:column; gap:8px; }
.cta, .profile__btn { width:100%; display:flex; gap:10px; align-items:center; padding:8px 10px; border-radius:10px; background:transparent; border:1px solid transparent; text-align:left; cursor:pointer; }
.cta:hover, .profile__btn:hover { background:#f3f4f6; }
.avatar { width:32px; height:32px; border-radius:50%; overflow:hidden; display:grid; place-items:center; background:#e5e7eb; }
.avatar.--guest { background:#eef2ff; color:#3730a3; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.meta { display:flex; flex-direction:column; }
small { color:#6b7280; }
.menu { list-style:none; padding:6px; margin:4px 0 0; border:1px solid var(--border); border-radius:10px; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,.06); }
.menu li { padding:2px 4px; }
.menu a, .menu button { display:block; width:100%; text-align:left; background:none; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; color:#111827; }
.menu a:hover, .menu button:hover { background:#f3f4f6; }
.chev { transition: transform .18s; }
.chev.open { transform: rotate(180deg); }
.fade-enter-active, .fade-leave-active { transition: opacity .12s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }
.icon { width:20px; height:20px; }
</style>
