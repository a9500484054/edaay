<template>
  <div class="recipe-details">
    <h2>Рецепт {{ id }}</h2>
    <p>Описание рецепта (заглушка).</p>
  </div>
</template>
<script setup>
import { defineProps } from 'vue'
defineProps({ id: { type: String, required: false } })
</script>
