<script setup>
import { onMounted, ref } from 'vue';
import { getHighScores } from '@/api/gameApi';

const entries = ref([]);
const isLoading = ref(true);
const error = ref('');

async function loadHighScores() {
  try {
    entries.value = await getHighScores();
  } catch (err) {
    error.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadHighScores);
</script>

<template>
  <section class="highscore-board" aria-label="Topplista">
    <!-- Statustexterna skrivs på första raden, som en lapp på det tomma pappret -->
    <p v-if="isLoading" class="status loading">Hämtar topplistan…</p>
    <p v-else-if="error" class="status error" role="alert">{{ error }}</p>
    <p v-else-if="entries.length === 0" class="status">Ingen har tagit sig till IKEA än.</p>

    <ol v-else>
      <!-- --row styr när raden börjar skrivas, se animationen i CSS:en -->
      <li v-for="(entry, index) in entries" :key="entry.username" :style="{ '--row': index }">
        <!-- title visar hela namnet vid hover när det klipps med … -->
        <span class="name" :title="entry.username">{{ entry.username }}</span>
        <span class="score">{{ entry.score }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.highscore-board {
  position: relative;
  container-type: inline-size;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1232 / 1552;
  background: url('../assets/images/highscore.webp') center / contain no-repeat;
  color: var(--color-ink);
  font-family: var(--font-main);
}

/* Listan och statustexterna delar samma yta på pappret */
ol,
.status {
  position: absolute;
  top: 35.3%; /* 548 / 1552: rubriklinjen */
  left: 12.6%; /* 155 / 1232: där "Användare" börjar */
  right: 15.4%; /* (1232 - 1042) / 1232: där "Poäng" slutar */
  margin: 0;
}

ol {
  height: 46.4%; /* (1268 - 548) / 1552: tio rader */
  display: grid;
  grid-template-rows: repeat(10, 1fr);
  padding: 0;
  list-style: none;
}

.status {
  height: 4.64%; /* en rad, en tiondel av listans höjd */
  display: flex;
  align-items: flex-end;
  font-size: 3.5cqw;
  line-height: 1;
  padding-bottom: 0.3cqw;
  text-align: left;
}

/* Blyertsgrått, som något som inte är färdigskrivet */
.loading {
  opacity: 0.6;
}

/* Samma röda bläck som rubriken "Topplista" i bilden */
.error {
  color: #8b1a1a;
}

li {
  display: grid;
  grid-template-columns: 52% 45%;
  justify-content: space-between;
  align-items: end;
  /* Vänsterställt */
  text-align: left;
  font-size: 3.5cqw;
  line-height: 1;
  padding-bottom: 0.3cqw;
  /* Takten i skrivmaskinsanimationen. */
  --name-time: 0.3s;
  --pause: 0.1s; /* mellan namn och poäng */
  --score-time: 0.15s;
  /* Räknas ut, så nästa rad börjar först när poängen på raden ovanför är skriven */
  --row-time: calc(var(--name-time) + var(--pause) + var(--score-time));
  --row-start: calc(var(--row) * var(--row-time));
}

/* Skrivmaskin: först namnet, en kort paus, sedan poängen. En rad i taget uppifrån.
   backwards döljer texten medan den väntar, och tar bort klippningen när den är klar */
@keyframes type-row {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.name {
  animation: type-row var(--name-time) steps(15, end) backwards;
  animation-delay: var(--row-start);
}

.score {
  animation: type-row var(--score-time) steps(4, end) backwards;
  animation-delay: calc(var(--row-start) + var(--name-time) + var(--pause));
  padding-top: 0.25em;
}

/* Respektera spelare som stängt av animationer i operativsystemet */
@media (prefers-reduced-motion: reduce) {
  .name,
  .score {
    animation: none;
  }
}

/* Max 11 tecken får alltid plats, se validateUsername.js.
   Ellipsis är en säkerhet för namn som redan finns i databasen */
.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 0.25em;
}
</style>
