<template>
  <ul class="legal">
    <li><RouterLink to="/legal/privacy">Политика конфиденциальности</RouterLink></li>
    <li><RouterLink to="/legal/terms">Условия использования</RouterLink></li>
  </ul>
</template>
<script setup></script>
<style scoped>
.legal { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px; }
.legal a { font-size:12px; color:#6b7280; }
.legal a:hover { color:#111827; }
</style>
