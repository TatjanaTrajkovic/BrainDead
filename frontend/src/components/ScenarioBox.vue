<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="scenario-box content-card">
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
.scenario-box {
  height: 100%;
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.5;
}

.scenario-box p {
  margin: 0;
}
</style>
