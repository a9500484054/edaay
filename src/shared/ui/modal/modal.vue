<template>
  <Teleport to="body">
    <transition :name="transitionName">
      <div v-if="modelValue" class="backdrop" @click="onBackdrop">
        <div
          class="modal"
          :class="[sizeClass, { 'is-full': size === 'fullscreen' }]"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <header v-if="showHeader" class="modal__header">
            <slot name="title">
              <h3 class="modal__title">{{ title }}</h3>
            </slot>
            <button class="modal__close" @click="onCloseClick" aria-label="Закрыть">
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <section class="modal__body" :class="{ 'no-header': !showHeader, 'no-footer': !showFooter || !$slots.footer }">
            <slot />
          </section>

          <footer v-if="showFooter && $slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'medium' }, // small | medium | fullscreen
  closeOnEsc: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  persistent: { type: Boolean, default: false },
  animation: { type: String, default: 'fade' }, // fade | slide-fade
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'open', 'close', 'close-click'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small': return 'modal--sm'
    case 'fullscreen': return 'modal--full'
    default: return 'modal--md'
  }
})

const transitionName = computed(() => props.animation === 'slide-fade' ? 'slide-fade' : 'fade')

const close = () => emit('update:modelValue', false)

const onCloseClick = () => {
  emit('close-click')
  if (!props.persistent) close()
}

const onBackdrop = () => {
  if (props.persistent) return
  if (props.closeOnBackdrop) close()
}

const onKeydown = (e) => {
  if (props.persistent) return
  if (props.closeOnEsc && e.key === 'Escape') close()
}

watch(() => props.modelValue, (val) => {
  document.documentElement.style.overflow = val ? 'hidden' : ''
  if (val) emit('open')
  else emit('close')
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); display:grid; place-items:center; z-index: 1000; }
.modal { width: 100vw; max-height: 100vh; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.15); display:flex; flex-direction:column; }
.modal--sm { max-width: 420px; }
.modal--md { max-width: 720px; }
.modal--full { max-width: 100%; height: 100%; border-radius: 0; }
.modal__header { display:flex; align-items:center; justify-content:space-between; gap:8px; padding: 14px 16px; border-bottom: 1px solid var(--border); }
.modal__title { margin: 0; font-size: 18px; }
.modal__close { background: transparent; border: none; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 20px; line-height: 1; }
.modal__close:hover { background: #f3f4f6; }

/* Body takes remaining space; add padding variants depending on header/footer presence */
.modal__body { flex:1 1 auto; overflow:auto; }
.modal__body.no-header { padding-top: 0; }
.modal__body.no-footer { padding-bottom: 0; }

.modal__footer { display:flex; justify-content:flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); }

/* fade */
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* slide-fade */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .2s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(16px) scale(.98); }
.slide-fade-leave-to { opacity: 0; transform: translateY(16px) scale(.98); }
</style>
