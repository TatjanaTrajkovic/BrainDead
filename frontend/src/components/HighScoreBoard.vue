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
  <section class="highscore-board">
    <p v-if="isLoading">Hämtar topplistan…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="entries.length === 0">Ingen har tagit sig till IKEA än.</p>

    <ol v-else>
      <li v-for="entry in entries" :key="entry.username">
        <span class="name">{{ entry.username }}</span>
        <span class="score">{{ entry.score }}</span>
      </li>
    </ol>
  </section>
</template>
