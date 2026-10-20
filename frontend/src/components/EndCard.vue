<script setup>
import { computed } from 'vue';
import brainAlive from '@/assets/images/brains/brain1.webp';
import brainDead from '@/assets/images/brains/brain5.webp';

const props = defineProps({
  // Sluthälsan, 0–100 från backend
  health: {
    type: Number,
    required: true,
  },
  // false när hälsan nått 0, true när spelaren klarat alla frågor
  isAlive: {
    type: Boolean,
    required: true,
  },
});

// Frisk hjärna om spelaren klarade sig, annars den mest medtagna
const brainImg = computed(() => (props.isAlive ? brainAlive : brainDead));

const healthPercent = computed(() => props.health);

const emit = defineEmits(['play-again']);

function playAgain() {
  emit('play-again');
}
</script>

<template>
  <section class="end-card content-card">
    <img :src="brainImg" class="brain" alt="" />

    <h2>{{ isAlive ? 'Framme vid IKEA' : 'Brain Dead' }}</h2>

    <p v-if="isAlive">
      Du tog dig genom apokalypsen hela vägen till IKEA i Bäckebol med hjärnan i behåll.
      Köttbullarna avstår du framöver.
    </p>
    <p v-else>Din hjärnkapacitet är slut. Du har anslutit dig till majoriteten.</p>

    <p class="health">Hjärnkapacitet kvar: {{ healthPercent }} %</p>

    <button type="button" class="btn btn-gray" @click="playAgain">Spela igen</button>
  </section>
</template>

<style scoped>
/* Ram, bakgrund och typsnitt kommer från .content-card, knappen från .btn i base.css */
.end-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 24px;
  text-align: center;
}

.brain {
  width: 96px;
}

h2 {
  font-size: 2rem;
  text-transform: uppercase;
}

.health {
  font-family: var(--font-handwritten);
  font-size: 2.1rem;
}
</style>
