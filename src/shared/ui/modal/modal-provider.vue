<template>
  <slot />
  <Modal
    v-model="isOpen"
    :title="options.title || ''"
    :size="options.size || 'medium'"
    :persistent="options.persistent || false"
    :show-header="options.showHeader ?? true"
    :show-footer="options.showFooter ?? true"
    :animation="options.animation || 'fade'"
  >
    <component v-if="component" :is="component" v-bind="props" />
    <template #footer v-if="options.footer !== false">
      <button @click="close">Закрыть</button>
    </template>
  </Modal>
</template>

<script setup>
import { provideModal } from './modal-service'
import Modal from './modal.vue'

const { isOpen, component, props, options, close } = provideModal()
</script>
