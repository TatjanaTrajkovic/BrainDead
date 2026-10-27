<script setup>
import { computed, ref } from 'vue';
import HighScoreBoard from '@/components/HighScoreBoard.vue';

const props = defineProps({
  // 'both' (desktop), 'handbook' eller 'highscore' (mobil)
  part: {
    type: String,
    default: 'both',
    validator: (v) => ['both', 'handbook', 'highscore'].includes(v),
  },
});

const emit = defineEmits(['open-highscore', 'open-handbook']);

const showHighscore = computed(() => props.part !== 'handbook');
const showHandbook = computed(() => props.part !== 'highscore');
// Ensam knapp = bara en av dem visas
const isSingle = computed(() => !(showHighscore.value && showHandbook.value));

const animatingHighscore = ref(false);
const animatingHandbook = ref(false);

const triggerHighscore = () => {
  if (animatingHighscore.value) return; // förhindra dubbelklick
  animatingHighscore.value = true;

  // vänta 200ms (som transition i css) innan modulen öppnas
  setTimeout(() => {
    animatingHighscore.value = false;
    emit('open-highscore');
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
    <div class="buttons" :class="{ single: isSingle }">
      <div v-if="showHighscore" class="highscore" :class="{ 'is-animating': animatingHighscore }">
        <HighScoreBoard v-if="part === 'highscore'" />
        <img v-else src="../assets/images/highscore.webp" alt="" />
        <!-- Osynlig knapp över hela ytan, brädet ligger alltså inte inuti en button -->
        <button
          type="button"
          class="hit-area"
          aria-label="Öppna topplistan"
          @click="triggerHighscore"
        />
      </div>
      <button
        v-if="showHandbook"
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
/* ==========================================
   Mobil-first (standard: staplat / enkelt)
   ========================================== */

/* Osynlig knapp över hela ytan, så hela bilden går att trycka på */
.hit-area {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.highscore :deep(.highscore-board) {
  pointer-events: none;
}

.button-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.highscore,
.handbook {
  position: relative;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  rotate: 0deg;
  transition: rotate 0.2s ease-out;
}

/* Mobil: lutning åt vänster vid tryck, innan overlayn öppnas */
.highscore.is-animating {
  rotate: -2deg;
  transition: rotate 0.2s ease-out;
}

.handbook.is-animating {
  rotate: 2deg;
  transition: rotate 0.2s ease-out;
}

img {
  display: block;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .highscore,
  .handbook {
    transition: none;
  }
}

/* ==========================================
   Desktop: överlapp när båda visas
   ========================================== */
@media (min-width: 768px) and (orientation: landscape) {
  .buttons:not(.single) {
    position: relative;
    margin-top: 5%;
    padding-top: 10%;
    gap: 0;
  }

  /* ---------- Highscore ---------- */
  .buttons:not(.single) .highscore {
    position: absolute;
    top: 0;
    left: 50%;
    width: 70%;
    z-index: 1;
    translate: -50% 0;
    rotate: 0deg;
    transition:
      translate 0.2s ease-out,
      rotate 0.2s ease-out;
  }

  .buttons:not(.single) .highscore:hover,
  .buttons:not(.single) .highscore.is-animating {
    translate: -50% -5%;
    rotate: 0.1deg;
  }

  /* ---------- Handbook ---------- */
  .buttons:not(.single) .handbook {
    position: relative;
    left: 50%;
    width: 92%;
    z-index: 2;
    transform-origin: 40% 70%;
    translate: -50% 0;
    rotate: -2deg;
    transition: rotate 0.2s ease-out;
  }

  .buttons:not(.single) .handbook:hover,
  .buttons:not(.single) .handbook.is-animating {
    rotate: 0.1deg;
  }
}
</style>
