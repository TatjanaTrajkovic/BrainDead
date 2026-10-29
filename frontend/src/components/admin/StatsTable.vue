<script setup>
import { onMounted, ref } from 'vue';
import { getStats } from '@/api/adminApi';

const questions = ref([]);
const isLoading = ref(true);
const error = ref('');

async function load() {
  isLoading.value = true;
  error.value = '';
  try {
    questions.value = await getStats();
  } catch (err) {
    error.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section>
    <div class="admin-page-head">
      <div>
        <h1 class="admin-title">Statistik per fråga</h1>
        <p class="admin-subtitle">
          Ett dödsfall räknas på frågan som besvarades sist innan hälsan nådde 0.
        </p>
      </div>
    </div>

    <p v-if="isLoading" class="admin-subtitle">Hämtar statistiken…</p>
    <p v-else-if="error" class="stats-error" role="alert">{{ error }}</p>
    <p v-else-if="questions.length === 0" class="admin-subtitle">Det finns inga frågor än.</p>

    <ul v-else>
      <li v-for="question in questions" :key="question.question_id">
        {{ question.position }}. {{ question.text }} – {{ question.times_answered }} svar,
        {{ question.deaths }} dödsfall
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stats-error {
  color: var(--admin-danger);
}
</style>
