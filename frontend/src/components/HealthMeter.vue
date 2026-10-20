<script setup>
import { computed } from 'vue';
import brain1 from '@/assets/images/brains/brain1.webp';
import brain2 from '@/assets/images/brains/brain2.webp';
import brain3 from '@/assets/images/brains/brain3.webp';
import brain4 from '@/assets/images/brains/brain4.webp';
import brain5 from '@/assets/images/brains/brain5.webp';

const props = defineProps({
  health: { type: Number, required: true },
  totalBlobs: { type: Number, default: 16 },
});

const percent = computed(() => Math.max(0, Math.min(100, props.health)) / 100);
const filled = computed(() => Math.ceil(percent.value * props.totalBlobs));

const level = computed(() => {
  if (props.health > 75) return { color: 'green', img: brain1 };
  if (props.health > 50) return { color: 'yellow', img: brain2 };
  if (props.health > 25) return { color: 'orange', img: brain3 };
  if (props.health > 0) return { color: 'red', img: brain4 };
  return { color: 'red', img: brain5 };
});
</script>

<template>
  <div class="meter">
    <div class="blobs">
      <div
        v-for="i in totalBlobs"
        :key="i"
        class="blob"
        :class="i > filled ? 'blob--empty' : `blob--${level.color}`"
      ></div>
    </div>
    <img :src="level.img" class="icon" :alt="`Hjärnkapacitet ${health} %`" />
  </div>
</template>

<style scoped>
.meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
  height: 100%;
  padding: 8px 0;
  background: #221e1b;
  border: 3px solid #cbb98a;
  border-radius: 16px;
}
.blobs {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  padding: 8px;
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
  width: 100%;
  aspect-ratio: 720 / 530; /* samma proportioner som bilderna, så höjden är känd innan bilden laddats */
  flex-shrink: 0;
  object-fit: contain;
}
</style>
