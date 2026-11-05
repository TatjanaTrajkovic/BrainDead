<script setup>
import { ref } from 'vue';
import IdStampCard from './IdStampCard.vue';

defineProps({
  name: { type: String, default: 'OIDENTIFIERAD' },
  health: { type: Number, required: true },
});
const emit = defineEmits(['continue']);

const hasStamped = ref(false);
const stampCardRef = ref(null);

function handleStamped() {
  hasStamped.value = true;
}

function handleMissClick() {
  stampCardRef.value?.performWagging();
}
</script>

<template>
  <Teleport to="body">
    <div class="stamp-modal-backdrop" @click="handleMissClick">
      <section class="stamp-modal-card">
        <IdStampCard ref="stampCardRef" :name="name" :health="health" @stamped="handleStamped" />
        <div v-if="hasStamped" class="actions">
          <button
            type="button"
            class="btn-large"
            @click.stop="emit('continue')"
          >
            <span>RESULTAT</span>
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
/* Mörk halvgenomskinlig bakgrund som täcker hela skärmen */
.stamp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--color-backdrop, rgba(0, 0, 0, 0.85));
  display: grid;
  place-items: center;
  padding: 12px;
  overflow-x: hidden;
  box-sizing: border-box;
}

.stamp-modal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(94vw, calc((100dvh - 8rem) * 550 / 357), 550px);
  margin: 0 auto;
  text-align: center;
  animation: modalFadeIn 2s ease-out;
}

.actions {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 16px;
  width: min(200px, 45cqi, 65vw);
  display: flex;
  justify-content: center;
  z-index: 30;
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
