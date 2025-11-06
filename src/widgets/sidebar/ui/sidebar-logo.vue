<template>
  <RouterLink to="/app" class="logo">
    <img :src="logo" alt="Edaay" />
  </RouterLink>
</template>
<script setup>
import logo from '@/assets/images/logo/logo-edaay.svg'
</script>
<style scoped>
.logo { display:block; padding: 8px 0; }
.logo img { height: 28px; width: auto; }
</style>
