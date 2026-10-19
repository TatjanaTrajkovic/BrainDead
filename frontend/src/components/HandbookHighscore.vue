<script setup>
import { ref } from 'vue';

const emit = defineEmits(['open-highscore', 'open-handbook']);

const animatingHighscore = ref(false);
const animatingHandbook = ref(false);

const triggerHighscore = () => {
  if (animatingHighscore.value) return; // förhindra dubbelklick
  animatingHighscore.value = true;

  // vänta 200ms (som transition i css) innan modulen öppnas
  setTimeout(() => {
    animatingHighscore.value = false;
    emit('open-highscore'); // öppna modulen
  }, 200);
};

const triggerHandbook = () => {
  if (animatingHandbook.value) return;
  animatingHandbook.value = true;

  setTimeout(() => {
    animatingHandbook.value = false;
    emit('open-handbook');
  }, 200);
};
</script>

<template>
  <div class="button-container">
    <div class="buttons">
      <button
        class="highscore"
        :class="{ 'is-animating': animatingHighscore }"
        type="button"
        aria-label="Topplista"
        @click="triggerHighscore"
      >
        <img src="../assets/images/highscore.webp" alt="" />
      </button>
      <button
        class="handbook"
        :class="{ 'is-animating': animatingHandbook }"
        type="button"
        aria-label="Handbok"
        @click="triggerHandbook"
      >
        <img src="../assets/images/handbook_closed.webp" alt="" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.button-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
}

.buttons {
  position: relative;
  width: 98%;
  top: 12%;
}

.highscore {
  position: absolute;
  top: -10%;
  left: 10%;
  width: 70%;
  padding: 0;
  border: none;
  background: none;
  z-index: 1;
  cursor: pointer;
  transition: translate 0.2s ease;
}

.highscore:hover,
.highscore.is-animating {
  translate: 0 -5%;
}

.handbook {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 2;
  transform-origin: 40% 70%;
  transition: rotate 0.2s ease;
  rotate: -2deg;
}

.handbook:hover,
.handbook.is-animating {
  rotate: 2deg;
}

img {
  display: block;
  width: 100%;
}
</style>
