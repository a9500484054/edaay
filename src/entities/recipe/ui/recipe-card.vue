<template>
  <article class="recipe-card" @click="goToDetails" @keyup.enter="goToDetails" tabindex="0" role="button" aria-label="Открыть рецепт">
    <div class="recipe-card__image">
      <img :src="recipe.image" :alt="recipe.title" loading="lazy" />

      <!-- Лайк со счётчиком -->
      <button
        class="like-btn"
        :class="{ active: liked }"
        @click.stop="toggleLike"
        :aria-pressed="liked ? 'true' : 'false'"
        :aria-label="liked ? 'Убрать лайк' : 'Поставить лайк'"
        title="Нравится"
      >
        <Icon :icon="liked ? 'mdi:heart' : 'mdi:heart-outline'" class="icon" />
        <span class="likes-count">{{ likes }}</span>
      </button>

      <!-- Избранное (опционально оставим как закладка) -->
      <!-- <button
        class="fav-btn"
        :class="{ active: isFavorite }"
        @click.stop="toggleFav"
        aria-label="В избранное"
        title="В избранное"
      >
        <Icon :icon="isFavorite ? 'mdi:bookmark' : 'mdi:bookmark-outline'" class="icon" />
      </button> -->

      <!-- Кнопка Добавить — показывается при hover/focus карточки -->
      <button class="add-btn" @click.stop="$emit('add', recipe)" aria-label="Добавить в мои рецепты">
        <Icon icon="mdi:plus" class="icon" />
        Добавить
      </button>
    </div>

    <div class="recipe-card__body">
      <h3 class="title">{{ recipe.title }}</h3>

      <div class="meta">
        <span class="meta-item">
          <Icon icon="mdi:clock-outline" class="icon-sm" />
          {{ recipe.time }} мин
        </span>
        <span class="meta-item">
          <Icon icon="mdi:account-outline" class="icon-sm" />
          {{ recipe.servings }} порц
        </span>
        <span class="meta-item">
          <Icon icon="mdi:fire" class="icon-sm" />
          {{ recipe.calories }} ккал
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['add', 'toggle-favorite', 'toggle-like'])
const router = useRouter()

const props = defineProps({
  recipe: { type: Object, required: true }
})

// Локальные реактивные фолбеки (если API не отдаёт)
const liked = ref(!!props.recipe.isLiked)
const likes = ref(Number.isFinite(props.recipe.likes) ? props.recipe.likes : 0)
const isFavorite = ref(!!props.recipe.isFavorite)

const goToDetails = () => {
  router.push(`/app/recipes/${props.recipe.id}`)
}

const toggleFav = () => {
  isFavorite.value = !isFavorite.value
  emit('toggle-favorite', { id: props.recipe.id, value: isFavorite.value })
}

const toggleLike = () => {
  liked.value = !liked.value
  likes.value = Math.max(0, likes.value + (liked.value ? 1 : -1))
  emit('toggle-like', { id: props.recipe.id, value: liked.value, likes: likes.value })
}
</script>

<style scoped>
.recipe-card { 
  cursor:pointer; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; 
  transition: box-shadow .2s ease, transform .06s ease; position: relative; outline: none;
  position: relative;
}
.recipe-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.recipe-card:focus-visible { box-shadow: 0 0 0 3px rgba(34,197,94,.25); transform: translateY(-1px); }

.recipe-card__image { position:relative; aspect-ratio: 4/3; overflow:hidden; background:#f3f4f6; }
.recipe-card__image img { width:100%; height:100%; object-fit:cover; display:block; }

/* Лайк со счётчиком */
.like-btn { 
  position:absolute; right:8px; top:8px; height:32px; padding:0 10px; border-radius:16px; 
  background:rgba(255,255,255,.95); border:1px solid #e5e7eb; display:inline-flex; align-items:center; gap:6px;
  cursor:pointer; color:#ef4444; line-height:1; transition: background .15s, border-color .15s, transform .06s;
}
.like-btn:hover { background:#fff; }
.like-btn:active { transform: scale(0.98); }
.like-btn .icon { width:18px; height:18px; }
.likes-count { font-size:13px; color:#ef4444; font-weight:600; }
.like-btn.active { background:#ffe4e6; border-color:#fecdd3; }

/* Избранное */
.fav-btn { 
  position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; 
  background:rgba(255,255,255,.95); border:1px solid #e5e7eb; display:grid; place-items:center; cursor:pointer; color:#6b7280;
  transition: background .15s, border-color .15s;
}
.fav-btn:hover { background:#fff; }
.fav-btn.active { color:#f59e0b; border-color:#fcd34d; }
.fav-btn .icon { width:18px; height:18px; }

/* Кнопка Добавить, появляется на hover/focus */
.add-btn {
  position:absolute; right:10px; bottom:18px; display:inline-flex; align-items:center; gap:6px;
  padding:8px 12px; border-radius:10px; border:none; background:#22c55e; color:#fff; cursor:pointer;
  opacity:0; transform: translateY(6px); transition: opacity .15s ease, transform .15s ease, background .15s;
  box-shadow: 0 4px 12px rgba(34,197,94,.28);
}
.recipe-card:hover .add-btn,
.recipe-card:focus-within .add-btn { opacity:1; transform: translateY(0); z-index: 99999;}
.add-btn:hover { background:#16a34a; }
.add-btn .icon { width:18px; height:18px; }

/* Тело карточки */
.recipe-card__body { 
  padding:12px; display:flex; flex-direction:column; gap:8px;
  background: #ffffffbf; position: absolute; bottom: 0; width: 100%;
}
.title { margin:0; font-size:16px; line-height:1.3; color:#111827; }
.meta { display:flex; gap:10px; font-size:13px; color:#6b7280; flex-wrap: wrap; }
.meta-item { display:inline-flex; align-items:center; gap:4px; }
.icon-sm { width:14px; height:14px; }

/* Небольшая адаптивность */
@media (max-width: 640px) {
  .like-btn { height:30px; padding:0 8px; }
  .likes-count { font-size:12px; }
  .add-btn { padding:8px 10px; }
}
</style>
