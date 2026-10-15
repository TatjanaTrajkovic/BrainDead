<script setup>
import { ref } from 'vue';
import nukeClosed from '@/assets/images/nuke_closed.webp';
import nukeOpen from '@/assets/images/nuke_open.webp';

defineProps({
  // Spärrar knappen, t.ex. medan en omgång startas
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['start']);

// true när locket är uppe, då visas bilden med öppet lock och knappen går att trycka på
const isOpen = ref(false);

// Bara musen öppnar locket vid hover. Touch-skärmar skickar också pointerenter vid tryck,
// och då skulle locket öppnas och omgången starta på samma tryck
function handleEnter(event) {
  if (event.pointerType === 'mouse') {
    isOpen.value = true;
  }
}

function handleLeave(event) {
  if (event.pointerType === 'mouse') {
    isOpen.value = false;
  }
}

// Med stängt lock öppnar första trycket locket (mobil), först nästa tryck startar omgången
function handleClick() {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }
  emit('start');
}
</script>

<template>
  <div class="nuke" @pointerenter="handleEnter" @pointerleave="handleLeave">
    <img :src="isOpen ? nukeOpen : nukeClosed" alt="" class="nuke-img" />
    <button
      type="button"
      class="red-button"
      aria-label="Initiera apokalyps"
      :disabled="disabled"
      @click="handleClick"
      @focus="isOpen = true"
      @blur="isOpen = false"
    ></button>
  </div>
</template>

<style scoped>
.nuke {
  /* Den röda knappen placeras i förhållande till lådan */
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

/* Osynlig rund knapp ovanpå den röda cirkeln i bilden. Procent gör att den följer med när lådan skalas */
.red-button {
  position: absolute;
  top: 51%;
  left: 50%;
  width: 32%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.red-button:focus-visible {
  outline: 3px solid var(--color-text);
  outline-offset: 3px;
}

.red-button:disabled {
  cursor: not-allowed;
}
</style>
