<script setup>
import { computed, ref } from 'vue';
import waxUnstamped from '@/assets/images/wax_unstamped.webp';
import waxStamped from '@/assets/images/wax_stamped.webp';
import { stampQuotes } from '@/utils/stampQuotes';
import stampImg from '@/assets/images/stamp.webp';
import thumbImg from '@/assets/images/thumb.webp';

const props = defineProps({
  name: { type: String, default: 'OIDENTIFIERAD' },
  health: { type: Number, default: 100 },
});

const isRegistered = computed(() => props.name && props.name !== 'OIDENTIFIERAD');

const isStamped = ref(false);
const isMoving = ref(false);
const isPressing = ref(false);
const isWagging = ref(false);
const hasRevealed = ref(false);

const emit = defineEmits(['stamped']);

const quote = computed(() => stampQuotes(props.health));

function performWagging() {
  if (isMoving.value || isStamped.value) return;

  // Gör tummen synlig omedelbart om man klickar innan 3s-fade hunnit klart
  hasRevealed.value = true;

  if (isWagging.value) return;

  isWagging.value = true;

  setTimeout(() => {
    isWagging.value = false;
  }, 1000);
}

function performStamp() {
  // Tillåt stämpling endast en gång
  if (isStamped.value || isMoving.value || isPressing.value) return;

  isMoving.value = true;

  setTimeout(() => {
    isPressing.value = true;
  }, 400);

  setTimeout(() => {
    isStamped.value = true;
  }, 650);

  setTimeout(() => {
    isPressing.value = false;
    isMoving.value = false;
  }, 1200);

  setTimeout(() => {
    emit('stamped');
  }, 1700);
}

defineExpose({
  performWagging,
});
</script>

<template>
  <div class="stamp-area">
    <div
      role="button"
      class="id-card"
      :class="{ 'can-stamp': !isStamped }"
      aria-label="Klicka för att stämpla ID-kortet"
      @click="performWagging"
    >
      <div class="text">
        <h2>ID-KORT</h2>
        <p class="company">Skumma Aktier AB</p>
        <p class="user" :class="{ known: isRegistered }">
          {{ name }}
        </p>
      </div>

      <div class="wax-stamp" :class="{ stamped: isStamped }">
        <img class="wax-img" :src="isStamped ? waxStamped : waxUnstamped" alt="Sigill" />
        <div v-if="isStamped" class="stamp-text">
          <span class="stamp-percent">{{ health }}%</span>
          <span class="stamp-capacity">HJÄRNKAPACITET</span>
          <span class="stamp-quote">{{ quote }}</span>
        </div>
      </div>
      <img
        role="button"
        tabindex="0"
        :src="stampImg"
        alt="Stämpel"
        class="stamp-tool"
        :class="{
          idle: !isMoving && !isPressing && !isStamped,
          moving: isMoving && !isPressing,
          moved: isStamped && !isPressing,
          pressing: isPressing,
        }"
        @click.stop="performStamp"
        @keydown.enter.space.stop.prevent="performStamp"
      />
      <div
        v-if="!isMoving && !isPressing && !isStamped"
        class="thumb-wrap"
        :class="{ revealed: hasRevealed }"
      >
        <img :src="thumbImg" alt="pekande finger" class="thumb" :class="{ wagging: isWagging }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stamp-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.id-card {
  position: relative;
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  aspect-ratio: 550 / 357;
  container-type: inline-size;
  color: var(--color-ink);
  text-align: left;
  background: url('@/assets/images/logincard.webp') center / contain no-repeat;
}
/* Textfältet till höger om fotot */
.text {
  position: absolute;
  inset: 13% 6% 13% 51%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
.user {
  padding: 2cqw 0 1.5cqw;
  border-bottom: 2px solid currentColor;
  font-size: 5cqw;
  letter-spacing: 0.05em;
  color: #750000;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user.known {
  color: #5f0069;
}

.wax-stamp {
  position: absolute;
  top: 12%;
  left: 1%;
  width: 50%;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.wax-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
}

/* Text i stämpel */
.stamp-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #414141;
  color: transparent;
  transform: rotate(-6deg);
  mix-blend-mode: multiply;
  text-transform: uppercase;

  /* Skapar shadow inuti för djup */
  text-shadow: 1px 1px 4px rgba(251, 251, 251, 0.7);
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
}

.stamp-quote {
  font-size: 5cqw;
  font-weight: bold;
  margin-top: 0.8cqw;
  white-space: pre-line;
}

.stamp-capacity {
  font-size: 4cqw;
  font-weight: bold;
  text-transform: uppercase;
}

.stamp-percent {
  font-size: 10cqw;
  font-weight: bold;
  line-height: 1;
}

.stamp-tool {
  position: absolute;
  top: 4%;
  width: 50%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  pointer-events: auto;
  z-index: 10;
  cursor: pointer;
  transform: translate(110%, 20%) scale(0.9) rotate(15deg);
  filter: drop-shadow(8px 12px 8px rgba(0, 0, 0, 0.4));
  transition:
    transform 0.35s ease-out,
    filter 0.25s ease;
}

.stamp-tool.moving,
.stamp-tool.pressing,
.stamp-tool.moved {
  pointer-events: none;
}

/* 1. Startposition, står vid sidan och väntar på klick */
.stamp-tool.idle {
  transform: translate(110%, 20%) scale(0.9) rotate(15deg);
  filter: drop-shadow(8px 12px 8px rgba(0, 0, 0, 0.4));
}
/* 2. Flyttar in över vaxet och svävar i luften */
.stamp-tool.moving {
  transform: translate(-10%, -30%) scale(1) rotate(-20deg);
  filter: drop-shadow(15px 25px 12px rgba(0, 0, 0, 0.5));
}
/* 3. Trycks ned i vaxet */
.stamp-tool.pressing {
  transform: translate(0, 0) scale(0.9) rotate(0deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
}
/* 4. Glider tillbaka till sidan */
.stamp-tool.moved {
  transform: translate(110%, 20%) scale(0.9) rotate(15deg);
  filter: drop-shadow(8px 12px 8px rgba(0, 0, 0, 0.4));
}

/* TUMME */
.thumb-wrap {
  position: absolute;
  top: 130%;
  right: 32%;
  width: 50%;
  aspect-ratio: 1 / 1;
  pointer-events: none;
  z-index: 20;
  animation: thumbFadeIn 3s ease-in forwards;
}

.thumb-wrap.revealed {
  animation: none;
  opacity: 1;
}

.thumb {
  width: 100%;
  height: 100%;
  transform-origin: top center;
  rotate: -140deg;
  object-fit: contain;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5));
  animation: point 1s ease-in-out infinite;
}
/* Rör sig fram och tillbaka mot stämpeln */
@keyframes point {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(0, -40px) scale(1.1);
  }
}

/* Vaggande tumme */
.thumb.wagging {
  transform-origin: top center;
  animation: wag 1s ease-in-out;
}
@keyframes wag {
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-25deg);
  }
  40% {
    transform: rotate(25deg);
  }
  60% {
    transform: rotate(-25deg);
  }
  80% {
    transform: rotate(8deg);
    animation-timing-function: ease-out;
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
