import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

export function useBreakpoints() {
  const queries = {
    mobile: '(max-width: 639px)',
    tablet: '(min-width: 640px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
  }

  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  let mql = null

  const update = () => {
    if (!mql) return
    isMobile.value = mql.mobile.matches
    isTablet.value = mql.tablet.matches
    isDesktop.value = mql.desktop.matches
  }

  const add = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mql = {
      mobile: window.matchMedia(queries.mobile),
      tablet: window.matchMedia(queries.tablet),
      desktop: window.matchMedia(queries.desktop),
    }
    update()
    mql.mobile.addEventListener('change', update)
    mql.tablet.addEventListener('change', update)
    mql.desktop.addEventListener('change', update)
  }

  const remove = () => {
    if (!mql) return
    mql.mobile.removeEventListener('change', update)
    mql.tablet.removeEventListener('change', update)
    mql.desktop.removeEventListener('change', update)
  }

  onMounted(add)
  onBeforeUnmount(remove)

  const device = computed(() => (isMobile.value ? 'mobile' : isTablet.value ? 'tablet' : 'desktop'))

  return { isMobile, isTablet, isDesktop, device }
}
