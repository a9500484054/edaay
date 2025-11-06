<template>
  <ModalProvider>
    <RouterView />
  </ModalProvider>
</template>
<script setup>
import ModalProvider from '@/shared/ui/modal/modal-provider.vue'
</script>