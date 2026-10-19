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

// Bara musen öppnar locket vid hover. Touch skickar pointerenter vid tryck
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

// Minns att det här trycket öppnade locket, så att det inte också startar omgången
let openedByThisTap = false;

// Öppna bara locket vid tangentbordsfokus, inte när fokus kommer från ett tryck
function handleFocus(event) {
  if (event.target.matches(':focus-visible')) {
    isOpen.value = true;
  }
}

// Touch: tryck var som helst i lådan öppnar locket utan att starta omgången
function handleBoxPointerDown(event) {
  openedByThisTap = false;
  if (event.pointerType !== 'mouse' && !isOpen.value) {
    isOpen.value = true;
    openedByThisTap = true;
  }
}

// Trycket som öppnade locket kan ta fokus från knappen, då ska locket inte stängas igen
function handleBlur() {
  if (openedByThisTap) {
    openedByThisTap = false;
    return;
  }
  isOpen.value = false;
}

// Trycket som öppnade locket (touch) ska inte starta omgången
// Annars startar omgången bara om locket redan är öppet
function handleClick() {
  if (openedByThisTap) {
    openedByThisTap = false;
    return;
  }
  if (isOpen.value) {
    emit('start');
  }
}
</script>

<template>
  <div class="nuke" @pointerdown="handleBoxPointerDown">
    <img :src="isOpen ? nukeOpen : nukeClosed" alt="" class="nuke-img" />
    <div class="hover-zone" @pointerenter="handleEnter" @pointerleave="handleLeave">
      <button
        type="button"
        class="red-button"
        aria-label="Initiera apokalyps"
        :disabled="disabled"
        @click="handleClick"
        @focus="handleFocus"
        @blur="handleBlur"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.nuke {
  /* Den röda knappen placeras i förhållande till lådan */
  position: relative;
  width: 100%;
  /* Gör att glöden kan anges i cqw (procent av lådans bredd) och skalas med lådan */
  container-type: inline-size;
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

.hover-zone {
  position: absolute;
  top: 22%;
  left: 15%;
  width: 70%;
  height: 58%;
}

/* Osynlig rund knapp ovanpå den röda cirkeln i bilden. Procent gör att den följer med när lådan skalas */
.red-button {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 58%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  transition:
    background 0.2s,
    box-shadow 0.2s;
}

/* Knappen lyser upp när musen är över den. (hover: hover) hindrar att glöden fastnar
   efter ett tryck på mobil, där webbläsaren behåller :hover tills man trycker någon annanstans */
@media (hover: hover) {
  .red-button:hover:not(:disabled) {
    background: radial-gradient(
      circle,
      rgb(255 160 140 / 55%),
      rgb(255 40 40 / 25%) 60%,
      transparent 72%
    );
    box-shadow: 0 0 6cqw 2cqw rgb(255 40 40 / 65%);
  }
}

/* Samma glöd när knappen nås med tangentbordet, i stället för en vanlig fokusram */
.red-button:focus-visible:not(:disabled) {
  outline: none;
  background: radial-gradient(
    circle,
    rgb(255 160 140 / 55%),
    rgb(255 40 40 / 25%) 60%,
    transparent 72%
  );
  box-shadow: 0 0 6cqw 2cqw rgb(255 40 40 / 65%);
}

.red-button:disabled {
  cursor: not-allowed;
}
</style>
