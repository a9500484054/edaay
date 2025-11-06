<template>
  <article class="recipe-card"  @click="goToDetails">
    <div class="recipe-card__image">
      <img :src="recipe.image" :alt="recipe.title" loading="lazy" />
      <button class="fav-btn" :class="{ active: recipe.isFavorite }" @click="toggleFav" aria-label="В избранное">
        <Icon :icon="recipe.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" class="icon" />
      </button>
    </div>

    <div class="recipe-card__body">
      <h3 class="title">{{ recipe.title }}</h3>
      <div class="meta">
        <span class="meta-item">
          <Icon name="mdi:clock-outline" class="icon-sm" />
          {{ recipe.time }} мин
        </span>
        <span class="meta-item">
          <Icon name="mdi:account-outline" class="icon-sm" />
          {{ recipe.servings }} порц
        </span>
        <span class="meta-item">
          <Icon name="mdi:fire" class="icon-sm" />
          {{ recipe.calories }} ккал
        </span>
      </div>
      <button class="btn btn--primary" @click="$emit('add', recipe)">
        <Icon name="mdi:plus" class="icon-sm" />
        Добавить
      </button>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

defineEmits(['add', 'toggle-favorite'])

const router = useRouter()
const props = defineProps({
  recipe: { type: Object, required: true }
})

const goToDetails = () => {
  console.log('props.recipe.id', props.recipe.id)
  router.push(`/app/recipes/${props.recipe.id}`)
}

const toggleFav = () => {
  e.stopPropagation() // не переходить при клике на избранное
  // временно меняем локально; в проде через стор
  // this.recipe.isFavorite = !this.recipe.isFavorite
}
</script>

<style scoped>
.recipe-card { cursor:pointer; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; transition: box-shadow .2s ease; }
.recipe-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.recipe-card__image { position:relative; aspect-ratio: 4/3; overflow:hidden; background:#f3f4f6; }
.recipe-card__image img { width:100%; height:100%; object-fit:cover; }
.fav-btn { position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.9); border:none; display:grid; place-items:center; cursor:pointer; color:#6b7280; }
.fav-btn.active { color:#ef4444; }
.fav-btn:hover { background:#fff; }
.recipe-card__body { padding:12px; display:flex; flex-direction:column; gap:8px; }
.title { margin:0; font-size:16px; line-height:1.3; }
.meta { display:flex; gap:10px; font-size:13px; color:#6b7280; }
.meta-item { display:inline-flex; align-items:center; gap:4px; }
.icon-sm { width:14px; height:14px; }
.icon { width:18px; height:18px; }
.btn { height:36px; border-radius:8px; border:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; }
.btn--primary { background:#22c55e; color:#fff; width:100%; }
.btn--primary:hover { background:#16a34a; }
</style>
