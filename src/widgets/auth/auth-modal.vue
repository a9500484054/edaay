<template>
  <div class="auth">
    <!-- Левая колонка -->
    <section class="auth__left">
      <header class="auth__header">
        <!-- <div class="tabs">
          <button :class="{ active: mode==='login' }" @click="mode='login'">Войти</button>
          <button :class="{ active: mode==='register' }" @click="mode='register'">Регистрация</button>
        </div> -->
        <RouterLink to="/app" class="auth__logo">
          <img :src="logo" alt="Edaay" />
        </RouterLink>
        <p class="muted">{{ headerText }}</p>
      </header>

      <form class="form" @submit.prevent="onSubmit">
        <!-- email -->
        <label class="field">
          <span class="label">Эл. почта</span>
          <input
            class="input"
            type="email"
            v-model.trim="email"
            placeholder="Введите свой email"
            required
          />
        </label>

        <!-- password -->
        <label class="field" v-if="mode==='login' || showPassword">
          <span class="label">Пароль</span>
          <div class="password">
            <input
              :type="show ? 'text' : 'password'"
              class="input"
              v-model="password"
              :placeholder="mode==='register' ? 'Придумайте пароль' : 'Введите ваш пароль'"
              :required="mode==='login' || showPassword"
              minlength="6"
            />
            <button type="button" class="eye" @click="show = !show" :aria-pressed="show">
              <Icon :icon="show ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" />
            </button>
          </div>
        </label>

        <div class="row" v-if="mode==='login'">
          <RouterLink to="/auth/forgot" class="link">Забыли пароль?</RouterLink>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn btn--primary" type="submit" :disabled="loading">
          {{ loading ? (mode==='login' ? 'Входим…' : 'Регистрируем…') : (mode==='login' ? 'Вход' : 'Зарегистрироваться') }}
        </button>

        <button v-if="mode==='login'" class="btn btn--link" type="button" @click="loginMagic" :disabled="loading">
          Войти без пароля — отправить magic‑ссылку
        </button>

        <div class="sep">
          <span class="line" />
          <span class="or">или</span>
          <span class="line" />
        </div>

        <button class="btn btn--oauth" type="button" @click="continueWith('google')" :disabled="loading">
          <Icon icon="mdi:google" class="icon" />
          Продолжить с Google
        </button>

        <!-- <button class="btn btn--oauth" type="button" @click="continueWith('facebook')" :disabled="loading">
          <Icon icon="mdi:facebook" class="icon" />
          Продолжить с Facebook
        </button> -->

        <p class="small auth-switch" v-if="mode==='login'">
          У вас ещё нет аккаунта?
          <button type="button" class="link" @click="switchTo('register')">Зарегистрироваться</button>
        </p>
        <p class="small auth-switch" v-else>
          Уже есть аккаунт?
          <button type="button" class="link" @click="switchTo('login')">Войти</button>
        </p>
   

        <!-- <div class="lang">
          <button type="button" class="lang__btn" @click="toggleLang">
            <Icon icon="mdi:earth" class="icon" />
            <span>{{ langLabel }}</span>
            <Icon icon="mdi:chevron-down" class="icon chev" :class="{ open: langOpen }" />
          </button>
          <ul v-if="langOpen" class="lang__menu" @mouseleave="langOpen=false">
            <li><button type="button" @click="setLang('ru')">Русский</button></li>
            <li><button type="button" @click="setLang('en')">English</button></li>
            <li><button type="button" @click="setLang('pl')">Polski</button></li>
          </ul>
        </div> -->
      </form>
    </section>

    <!-- Правая колонка -->
    <section class="auth__right">
      <button class="close" @click="close" aria-label="Закрыть">×</button>
      <div class="brand">Edaay</div>
      <h1 class="hero__title">Начните планировать и экономить</h1>
      <p class="hero__text">Ходите в магазин со списком, чтобы купить всё нужное и не купить ничего ненужного</p>
      <div class="social-proof">
        <div class="faces"><span class="face" v-for="n in 5" :key="n" /></div>
        <div class="proof-text">Более 1 386 295 довольных пользователей!</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useModal } from '@/shared/ui/modal/modal-service' // используем сервис, а не локальный Modal
import { Icon } from '@iconify/vue'
import logo from '@/app/assets/images/logo-edaay.svg'
import { useAuthStore } from '@/entities/auth/model/auth.store'

const auth = useAuthStore()
const { close } = useModal()

const mode = ref('login')
const showPassword = ref(false)

const email = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const error = ref('')

const headerText = computed(() => mode.value === 'login' ? 'Рады вас видеть! 😊' : 'Создайте аккаунт за минуту')

const lang = ref('ru')
const langOpen = ref(false)
const langLabel = computed(() => lang.value === 'en' ? 'English' : lang.value === 'pl' ? 'Polski' : 'Русский')
const toggleLang = () => (langOpen.value = !langOpen.value)
const setLang = (code) => { lang.value = code; langOpen.value = false }

const switchTo = (m) => { mode.value = m; error.value = ''; showPassword.value = m === 'register' }

const validate = () => {
  error.value = ''
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { error.value = 'Некорректный email'; return false }
  if ((mode.value === 'login' || showPassword.value) && password.value.length < 6) { error.value = 'Минимум 6 символов в пароле'; return false }
  return true
}

const onSubmit = async () => {
  // if (!validate()) return
  // loading.value = true
  // try { await new Promise(r => setTimeout(r, 900)); close() }
  // catch { error.value = 'Не удалось выполнить действие. Попробуйте ещё раз.' }
  // finally { loading.value = false }

  loading.value = true
  error.value = ''
  try {
    if (mode.value === 'login') await auth.login({ email: email.value, password: password.value })
    else await auth.register({ email: email.value, password: password.value })
    close()
  } catch (e) {
    error.value = 'Не удалось выполнить действие'
  } finally {
    loading.value = false
  }
}

const loginMagic = async () => {
  if (!email.value) { error.value = 'Укажите email для отправки ссылки'; return }
  loading.value = true
  try { await new Promise(r => setTimeout(r, 900)); error.value = 'Письмо с ссылкой отправлено. Проверьте почту.' }
  catch { error.value = 'Не удалось отправить ссылку.' }
  finally { loading.value = false }
}

const continueWith = async () => {
  loading.value = true
  try { await new Promise(r => setTimeout(r, 600)) }
  finally { loading.value = false }
}
</script>

<style scoped>
/* Layout */

.auth { display:grid; grid-template-columns: 1fr 1fr; height: 100vh; }
.auth__left { padding:  48px 100px;; display:flex; flex-direction:column; justify-content: center; }
.auth__right { position:relative; background:#15a03d; color:#fff; padding:56px; display:flex; flex-direction:column; justify-content:center; }

/* Header */
.auth__header { margin-bottom: 16px; }
.auth__logo img { display: block; height:84px; }
.muted {  color:#6b7280; }

/* Tabs */
.tabs { display:flex; gap:8px; margin-bottom:8px; }
.tabs button { padding:6px 10px; border-radius:8px; border:1px solid transparent; background:#f3f4f6; cursor:pointer; color:#111827; }
.tabs button:hover { background:#e5e7eb; }
.tabs button.active { background:#22c55e; color:#fff; }

/* Form */
.form { display:flex; flex-direction:column; gap:14px; max-width:520px; }
.field { display:flex; flex-direction:column; gap:6px; }
.label { font-size:14px; color:#374151; }
.input { width:100%; height:44px; border:1px solid #e5e7eb; border-radius:10px; padding:0 12px; background:#fff; color:#111827; }
.input::placeholder { color:#9ca3af; }
.input:focus { outline:none; border-color:#a7f3d0; box-shadow:0 0 0 3px rgba(16,185,129,.2); }

/* Password field */
.password { position:relative; }
.password .input { padding-right:40px; }
.eye { position:absolute; right:6px; top:50%; transform:translateY(-50%); background:transparent; border:none; padding:6px; border-radius:8px; cursor:pointer; color:#6b7280; }
.eye:hover { background:#f3f4f6; }

/* Links and helper rows */
.row { display:flex; justify-content:flex-end; }
.link { background:transparent; border:none; color:#15803d; text-decoration:underline; cursor:pointer; padding:0; }
.link:hover { color:#166534; }

/* Errors */
.error { color:#dc2626; font-size:13px; }

/* Buttons */
.btn { height:44px; border-radius:10px; border:1px solid transparent; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:0 14px; cursor:pointer; }
.btn--primary { background:#22c55e; color:#fff; }
.btn--primary:hover { background:#16a34a; }
.btn--primary:disabled { opacity:.6; cursor:default; }

.btn--link { background:transparent; border:none; color:#15803d; text-decoration:underline; height:auto; padding:0; }
.btn--link:hover { color:#166534; }

.btn--oauth { background:#fff; border:1px solid #e5e7eb; color:#111827; }
.btn--oauth:hover { background:#f9fafb; }
.icon { width:18px; height:18px; }

/* Separator */
.sep { display:flex; align-items:center; gap:8px; color:#6b7280; margin:8px 0; }
.sep .line { flex:1; height:1px; background:#e5e7eb; }
.sep .or { font-size:12px; }

.auth-switch {text-align: center;}

/* Language switcher */
.lang { position:relative; margin-top:6px; width:max-content; }
.lang__btn { display:inline-flex; align-items:center; gap:6px; padding:6px 8px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; color:#374151; }
.lang__btn:hover { background:#f9fafb; }
.lang__menu { position:absolute; top:100%; left:0; margin-top:6px; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 8px 20px rgba(0,0,0,.06); padding:6px; list-style:none; min-width:140px; z-index:2; }
.lang__menu li button { width:100%; text-align:left; padding:8px 10px; border:none; background:transparent; border-radius:8px; cursor:pointer; color:#111827; }
.lang__menu li button:hover { background:#f3f4f6; }
.chev { transition: transform .16s; }
.chev.open { transform: rotate(180deg); }

/* Right column */
.close { position:absolute; top:16px; right:16px; width:36px; height:36px; display:grid; place-items:center; background:rgba(255,255,255,.2); color:#fff; border:none; border-radius:50%; font-size:22px; cursor:pointer; }
.close:hover { background:rgba(255,255,255,.3); }
.brand { position:absolute; top:24px; left:24px; font-weight:800; font-size:22px; letter-spacing:.02em; }
.hero__title { margin:0 0 12px; font-size:40px; line-height:1.1; max-width: 560px; }
.hero__text { margin:0 0 18px; font-size:16px; max-width: 560px; }
.social-proof { display:flex; align-items:center; gap:12px; }
.faces { display:flex; }
.face { width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,.9); border:2px solid #15a03d; margin-left:-8px; }
.face:first-child { margin-left:0; }

/* Responsiveness */
@media (max-width: 1024px) {
  .hero__title { font-size:34px; }
  .auth__left { padding: 40px 40px; }
  .auth__right { padding: 40px; }
}

@media (max-width: 960px) {
  .auth { grid-template-columns: 1fr; }
  .auth__right { order:-1; min-height: 220px; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }
}

@media (max-width: 420px) {
  .auth__left { padding: 28px 20px; }
  .auth__right { padding: 28px 20px; }
  .hero__title { font-size:28px; }
}
</style>
