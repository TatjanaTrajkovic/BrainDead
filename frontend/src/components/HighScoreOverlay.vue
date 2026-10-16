<script setup>
import HighScoreBoard from '@/components/HighScoreBoard.vue';

const emit = defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Topplista">
        <HighScoreBoard />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgb(0 0 0 / 70%);
}

.sheet {
  position: relative;
  /* Max 480px bred, och aldrig högre än fönstret */
  width: min(100%, 480px, calc((100dvh - 2rem) * 1232 / 1552));
}
</style>
