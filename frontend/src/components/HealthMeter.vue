<script setup>
import { computed } from 'vue';
import brain1 from '@/assets/brain/brain1.webp';
import brain2 from '@/assets/brain/brain2.webp';
import brain3 from '@/assets/brain/brain3.webp';

const props = defineProps({
  health: { type: Number, required: true },
  totalBlobs: { type: Number, default: 15 },
});

const filled = computed(() => Math.ceil(Math.max(0, Math.min(1, props.health)) * props.totalBlobs));

function blobClass(i) {
  if (i > filled.value) return 'blob--empty';
  if (i <= 3) return 'blob--red';
  if (i <= 7) return 'blob--orange';
  if (i <= 11) return 'blob--yellow';
  return 'blob--green';
}

const brainImg = computed(() => {
  if (props.health > 0.7) return brain1;
  if (props.health > 0.2) return brain2;
  return brain3;
});
</script>

<template>
  <div class="meter">
    <div class="blobs">
      <div v-for="i in totalBlobs" :key="i" class="blob" :class="blobClass(i)"></div>
    </div>
    <img :src="brainImg" class="icon" :alt="`Hjärnkapacitet ${Math.round(health * 100)} %`" />
  </div>
</template>

<style scoped>
.meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
  height: 100%;
  padding: 8px;
  gap: 6px;
  background: #221e1b;
  border: 3px solid #cbb98a;
  border-radius: 16px;
}
.blobs {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  width: 100%;
  flex: 1;
}
.blob {
  flex: 1;
  border-radius: 4px;
  transition:
    background-color 0.3s,
    opacity 0.3s;
}
.blob--red {
  background: #f0365a;
}
.blob--orange {
  background: #fbb75f;
}
.blob--yellow {
  background: #fbf15f;
}
.blob--green {
  background: #4fc64f;
}
.blob--empty {
  opacity: 0;
} /* eller en mörk "tom" färg om du vill se platsen */
.icon {
  width: 40px;
  aspect-ratio: 720 / 530; /* samma proportioner som bilderna, så höjden är känd innan bilden laddats */
  flex-shrink: 0;
  object-fit: contain;
}
</style>
