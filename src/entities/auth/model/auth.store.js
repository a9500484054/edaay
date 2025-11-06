import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  apiLogin, apiRegister, apiMagicLink, apiOAuth, apiRefresh, apiLogout,
} from '@/shared/api/authApi'

const STORAGE_KEY = 'edaay_auth'

export const useAuthStore = defineStore('auth', () => {
  // state
  const user = ref(null)
  const accessToken = ref('')
  const refreshToken = ref('')
  const tokenExpiresAt = ref(0) // epoch seconds

  // getters
  const isAuth = computed(() => !!user.value && !!accessToken.value)
  const displayName = computed(() => (user.value?.name || user.value?.email || ''))

  // hydrate from storage
  const hydrate = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      user.value = data.user || null
      accessToken.value = data.accessToken || ''
      refreshToken.value = data.refreshToken || ''
      tokenExpiresAt.value = data.tokenExpiresAt || 0
    } catch {}
  }

  // persist to storage
  const persist = () => {
    const data = {
      user: user.value,
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      tokenExpiresAt: tokenExpiresAt.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // clear
  const clear = () => {
    user.value = null
    accessToken.value = ''
    refreshToken.value = ''
    tokenExpiresAt.value = 0
    localStorage.removeItem(STORAGE_KEY)
  }

  // helpers
  const setSession = ({ user: u, accessToken: at, refreshToken: rt, expiresIn }) => {
    user.value = u
    accessToken.value = at
    refreshToken.value = rt || refreshToken.value
    tokenExpiresAt.value = Math.floor(Date.now() / 1000) + (expiresIn || 3600)
    persist()
  }

  const needsRefresh = () => accessToken.value && tokenExpiresAt.value - Math.floor(Date.now() / 1000) < 60

  // actions
  const login = async (payload) => {
    const res = await apiLogin(payload)
    setSession(res)
    return res.user
  }

  const register = async (payload) => {
    const res = await apiRegister(payload)
    setSession(res)
    return res.user
  }

  const sendMagicLink = async ({ email }) => {
    return apiMagicLink({ email })
  }

  const oauth = async (provider) => {
    const res = await apiOAuth(provider)
    setSession(res)
    return res.user
  }

  const refresh = async () => {
    if (!refreshToken.value) return
    const res = await apiRefresh(refreshToken.value)
    setSession({ user: user.value, accessToken: res.accessToken, refreshToken: refreshToken.value, expiresIn: res.expiresIn })
  }

  const ensureToken = async () => {
    if (needsRefresh()) await refresh()
    return accessToken.value
  }

  const logout = async () => {
    try { await apiLogout() } finally { clear() }
  }

  // init
  hydrate()

  return {
    // state
    user, accessToken, refreshToken,
    // getters
    isAuth, displayName, tokenExpiresAt,
    // actions
    login, register, sendMagicLink, oauth, refresh, ensureToken, logout, clear, hydrate,
  }
})
