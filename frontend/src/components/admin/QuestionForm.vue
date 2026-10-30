<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Samma komponent för ny och redigerad fråga. Redigering har ett id i URL:en
const isEdit = computed(() => route.params.questionId !== undefined);
</script>

<template>
  <!-- Platshållare så att länkarna från listan fungerar. Byggs i #178 -->
  <section>
    <div class="admin-page-head">
      <div>
        <h1 class="admin-title">
          {{ isEdit ? `Redigera fråga ${route.params.questionId}` : 'Ny fråga' }}
        </h1>
        <p class="admin-subtitle">Byggs i #178.</p>
      </div>
    </div>
  </section>
</template>
