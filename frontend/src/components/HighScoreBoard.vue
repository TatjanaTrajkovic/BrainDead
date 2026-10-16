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
    <p v-if="isLoading">Hämtar topplistan…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="entries.length === 0">Ingen har tagit sig till IKEA än.</p>

    <ol v-else>
      <li v-for="entry in entries" :key="entry.username">
        <!-- title visar hela namnet vid hover när det klipps med … -->
        <span class="name" :class="{ long: entry.username.length > 18 }" :title="entry.username">{{
          entry.username
        }}</span>
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
  font-family: var(--font-handwritten);
}
ol {
  position: absolute;
  top: 35.3%; /* 548 / 1552: rubriklinjen */
  left: 12.6%; /* 155 / 1232: där "Användare" börjar */
  right: 15.4%; /* (1232 - 1042) / 1232: där "Poäng" slutar */
  height: 46.4%; /* (1268 - 548) / 1552: tio rader */
  display: grid;
  grid-template-rows: repeat(10, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: grid;
  grid-template-columns: 52% 45%;
  justify-content: space-between;
  align-items: end;
  /* Vänsterställt som när man fyller i ett papper för hand */
  text-align: left;
  font-size: 5cqw;
  line-height: 1;
  padding-bottom: 0.3cqw;
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Långa namn krymper lite så fler tecken får plats före … */
.name.long {
  font-size: 0.75em;
}
</style>
