<script setup>
import { ref } from 'vue';
import nukeClosed from '@/assets/images/nuke_closed.webp';
import nukeOpen from '@/assets/images/nuke_open.webp';

// true när musen är över lådan, då visas bilden med öppet lock
const isOpen = ref(false);
</script>

<template>
  <div class="nuke" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <img :src="isOpen ? nukeOpen : nukeClosed" alt="" class="nuke-img" />
  </div>
</template>

<style scoped>
.nuke {
  /* Den röda knappen placeras sedan i förhållande till lådan */
  position: relative;
  width: 100%;
}

.nuke-img {
  display: block;
  width: 100%;
  /* Samma proportioner som bilderna, så höjden är känd innan bilden laddats */
  aspect-ratio: 1226 / 1526;
  user-select: none;
  /* Klick ska gå till den röda knappen, inte till bilden */
  pointer-events: none;
}
</style>
