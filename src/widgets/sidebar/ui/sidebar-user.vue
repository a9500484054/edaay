<template>
  <div class="user" :class="{ compact }">
    <!-- Гость -->
    <button
      v-if="!isAuth"
      class="cta"
      @click="openLogin"
      :title="compact ? 'Войти' : undefined"
    >
      <div class="avatar --guest">
        <Icon icon="mdi:account-circle-outline" class="icon" />
      </div>
      <div v-if="!compact" class="meta">
        <strong>Войти</strong>
        <!-- <small>Доступ к спискам с любого устройства</small> -->
      </div>
    </button>

    <!-- Профиль -->
    <div v-else class="profile">
      <button
        class="profile__btn"
        @click="toggleMenu"
        @mouseenter="compact && (hovering = true)"
        @mouseleave="hovering = false"
        :title="compact ? user.name : undefined"
      >
        <div class="avatar">
          <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
          <Icon v-else icon="mdi:account-circle" class="icon" />
        </div>

        <div v-if="!compact" class="meta">
          <strong class="name">{{ user.name }}</strong>
          <small class="email">{{ user.email }}</small>
        </div>

        <Icon v-if="!compact" icon="mdi:cog-outline" class="chev" :class="{ open: menuOpen }" />
      </button>

      <!-- Tooltip имя в компактном режиме -->
      <transition name="fade">
        <div v-if="compact && hovering" class="tooltip" role="tooltip">
          {{ user.name || 'Профиль' }}
        </div>
      </transition>

      <!-- Меню -->
      <transition name="fade">
        <ul
          v-if="menuOpen"
          class="menu"
          @mouseleave="menuOpen=false"
        >
          <li><button type="button" @click="openSettings">Настройки</button></li>
          <li><button type="button" @click="logout">Выйти</button></li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useModal } from '@/shared/ui/modal/modal-service'
import SettingsPanel from '@/pages/main/settings.vue'
import AuthModal from '@/widgets/auth/auth-modal.vue'
import { useAuthStore } from '@/entities/auth/model/auth.store'

const props = defineProps({
  compact: { type: Boolean, default: false }
})

const auth = useAuthStore()
const user = computed(() => auth.user || {})
const isAuth = computed(() => !!auth.user)

const menuOpen = ref(false)
const hovering = ref(false)

const toggleMenu = () => (menuOpen.value = !menuOpen.value)
const logout = () => {
  // вызовите метод стора, если есть
  auth.logout?.()
  menuOpen.value = false
}

const { open } = useModal()
const openLogin = () =>
  open(
    AuthModal,
    {},
    { title: '', size: 'fullscreen', animation: 'slide-fade', persistent: false, showHeader: false, showFooter: false }
  )

const openSettings = () =>
  open(
    SettingsPanel,
    {},
    { title: 'Настройки', size: 'modal--sm', animation: 'slide-fade', persistent: false }
  )
</script>

<style scoped>
.user { position: relative; display:flex; flex-direction:column; gap:8px; }
.cta, .profile__btn {
  width:100%; display:flex; gap:10px; align-items:center;
  padding:8px 10px; border-radius:10px; background:transparent; border:1px solid transparent;
  text-align:left; cursor:pointer;
}
.cta:hover, .profile__btn:hover { background:#f3f4f6; }

.avatar { width:32px; height:32px; border-radius:50%; overflow:hidden; display:grid; place-items:center; background:#e5e7eb; }
.avatar.--guest { background:#ecfdf5; color:#22c55e; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.icon { width:20px; height:20px; }

.meta { display:flex; flex-direction:column; min-width:0; }
.name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.email { color:#6b7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.chev { margin-left: auto; width: 25px; height: 24px;}
/* .chev.open { transform: rotate(180deg); } */

/* Меню позиционируется справа, чтобы не обрезалось узким сайдбаром */
.menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  list-style:none; padding:6px;
  width: 100%;
  border:1px solid var(--border); border-radius:10px; background:#fff;
  box-shadow:0 8px 20px rgba(0,0,0,.08); min-width: 180px; z-index: 20;
}
.menu li { padding:2px 4px; }
.menu a, .menu button { display:block; width:100%; text-align:left; background:none; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; color:#111827; }
.menu a:hover, .menu button:hover { background:#f3f4f6; }

/* Tooltip для compact */
.tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 8px;
  background:#111827; color:#fff; padding:6px 8px; border-radius:8px; font-size:12px; white-space:nowrap;
  box-shadow:0 6px 18px rgba(0,0,0,.18); pointer-events:none; z-index: 15;
}
.tooltip::after {
  content:''; position:absolute; right:100%; top:10px;
  border-width:6px; border-style:solid; border-color: transparent #111827 transparent transparent;
}

/* Компактный режим (tablet) */
.user.compact .cta,
.user.compact .profile__btn { justify-content: center; padding: 8px; }
.user.compact .meta,
.user.compact .chev { display: none; }
</style>
