<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Sluthälsan, 0–1 från backend
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

const healthPercent = computed(() => Math.round(props.health * 100));

const emit = defineEmits(['play-again']);

function playAgain() {
  emit('play-again');
}
</script>

<template>
  <section class="end-card">
    <h2>{{ isAlive ? 'Framme vid IKEA' : 'Brain Dead' }}</h2>

    <p v-if="isAlive">
      Du tog dig genom apokalypsen hela vägen till IKEA i Bäckebol med hjärnan i behåll.
      Köttbullarna avstår du framöver.
    </p>
    <p v-else>Din hjärnkapacitet är slut. Du har anslutit dig till majoriteten.</p>

    <p class="health">Hjärnkapacitet kvar: {{ healthPercent }} %</p>

    <button type="button" @click="playAgain">Spela igen</button>
  </section>
</template>

<style scoped>
.end-card {
  padding: 20px;
  border: 2px solid #333;
  border-radius: 10px;
  text-align: center;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
