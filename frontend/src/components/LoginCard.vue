<script setup>
defineProps({
  // null = ingen inloggad. Formen bestäms när inloggningen finns
  player: { type: Object, default: null },
  // Knapparna för inloggning visas bara när inloggningen är byggd
  authEnabled: { type: Boolean, default: false },
});

const emit = defineEmits(['identify', 'logout', 'signup']);
</script>

<template>
  <section class="id-card">
    <div class="text">
      <h2>ID-KORT</h2>
      <p class="company">Skumma Aktier AB</p>
      <p class="status" :class="{ known: player }">
        {{ player ? player.username : 'OIDENTIFIERAD' }}
      </p>
      <div v-if="authEnabled && !player" class="actions">
        <button type="button" class="stamp" @click="emit('identify')">IDENTIFIERA</button>
        <button type="button" class="stamp new-id" @click="emit('signup')">NY IDENTITET</button>
      </div>
      <button v-else-if="player" type="button" class="stamp logout" @click="emit('logout')">
        STÄMPLA UT
      </button>
    </div>
  </section>
</template>

<style scoped>
.id-card {
  position: relative;
  width: 100%;
  aspect-ratio: 550 / 357;
  background: url('@/assets/images/logincard.webp') center / contain no-repeat;
  container-type: inline-size;
  color: var(--color-ink);
  text-align: left;
}

/* Ytan till höger om fotot */
.text {
  position: absolute;
  inset: 13% 6% 13% 51%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  font-size: 6.5cqw;
  font-weight: normal;
  line-height: 1;
}

.company {
  font-size: 3.4cqw;
  padding-bottom: 2cqw;
  border-bottom: 2px solid currentColor;
}

.status {
  padding: 2cqw 0 1.5cqw;
  border-bottom: 2px solid currentColor;
  font-size: 5cqw;
  letter-spacing: 0.05em;
  color: #750000;
  text-align: center;
}

.status.known {
  color: #5f0069;
}

/* Knapparna skjuts ner till kortets nederkant tillsammans */
.actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5cqw;
}

.logout {
  margin-top: auto;
}

.stamp {
  padding: 2cqw;
  font-size: 5cqw;
  background: rgb(255 255 255 / 25%);
  border: 2px solid #c9a227;
  border-radius: 1cqw;
  cursor: pointer;
}

.new-id {
  font-size: 4cqw;
}

.stamp:hover {
  background: rgb(201 162 39 / 20%);
}
</style>
