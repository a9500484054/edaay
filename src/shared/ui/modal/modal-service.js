import { ref, shallowRef, provide, inject, h } from 'vue'

const MODAL_KEY = Symbol('modal-service')

export function provideModal() {
  const isOpen = ref(false)
  const component = shallowRef(null)
  const props = ref({})
  const options = ref({})

  const open = (comp, p = {}, opts = {}) => {
    component.value = comp
    props.value = p
    options.value = opts
    isOpen.value = true
  }
  const close = () => { isOpen.value = false }

  provide(MODAL_KEY, { open, close })

  return { isOpen, component, props, options, open, close }
}

export function useModal() {
  const api = inject(MODAL_KEY, null)
  if (!api) throw new Error('useModal must be used within ModalProvider')
  return api
}
