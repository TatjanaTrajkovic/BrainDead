<script setup>
defineProps({
  // Sidorna i boken, t.ex. handbookPages från data/handbook.js. Varje sida är { title, text }
  pages: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);
</script>

<template>
  <section class="handbook">
    <div class="page page-left">
      <h2>{{ pages[0]?.title }}</h2>
      <p>{{ pages[0]?.text }}</p>
    </div>

    <div class="page page-right">
      <h2>{{ pages[1]?.title }}</h2>
      <p>{{ pages[1]?.text }}</p>
    </div>

    <button type="button" @click="emit('close')">Stäng</button>
  </section>
</template>
