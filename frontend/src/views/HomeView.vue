<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGame } from '@/composables/useGame';
import SessionMenu from '@/components/SessionMenu.vue';
import HandbookOpen from '@/components/HandbookOpen.vue';
import StartButton from '@/components/StartButton.vue';
import { handbookPages } from '@/data/handbook';
import HighScoreOverlay from '@/components/HighScoreOverlay.vue';
import LoginCard from '@/components/LoginCard.vue';
import PrologueNotebook from '@/components/PrologueNotebook.vue';
import { prologuePages } from '@/data/prologue';

const router = useRouter();
const { error, start, resume, hasActiveSession, checkActiveSession } = useGame();

// <dialog> längst ner i templaten ger bakgrund, stängning med Esc och håller fokus i menyn.
// Variabelnamnet matchar ref="menu" i templaten, så Vue lägger elementet här efter rendering
const menu = ref(null);

// Styr om den uppslagna handboken visas
const isHandbookOpen = ref(false);

// Styr om topplistan visas
const isHighScoreOpen = ref(false);

onMounted(checkActiveSession);

function openMenu() {
  menu.value.showModal();
}

function closeMenu() {
  menu.value.close();
}

// Fråga först om spelaren har en pågående omgång, eftersom forceNew pausar den
function handleStartNew() {
  if (hasActiveSession.value && !window.confirm('Du har en pågående omgång. Vill du börja om?')) {
    return;
  }
  closeMenu();
  start(true);
  router.push({ name: 'game' });
}

function handleResume() {
  closeMenu();
  resume();
  router.push({ name: 'game' });
}
</script>

<template>
  <p v-if="error">{{ error }}</p>

  <div class="home">
    <div class="area-handbook placeholder">
      <!-- Tillfällig knapp tills fliken ovanför handboken finns -->
      <button type="button" class="btn btn-gray" @click="isHighScoreOpen = true">
        Öppna topplista
      </button>
      <!-- Tillfällig knapp tills den stängda handboken finns -->
      <button type="button" class="btn btn-gray" @click="isHandbookOpen = true">
        Öppna handbok
      </button>
    </div>
    <div class="area-prolog">
      <PrologueNotebook :pages="prologuePages" />
    </div>
    <LoginCard class="area-id" />
    <div class="area-start">
      <StartButton @start="openMenu" />
    </div>
  </div>

  <HandbookOpen v-if="isHandbookOpen" :pages="handbookPages" @close="isHandbookOpen = false" />

  <HighScoreOverlay v-if="isHighScoreOpen" @close="isHighScoreOpen = false" />

  <!-- Klick på bakgrunden träffar själva dialogen, innehållet ligger i .menu-content -->
  <dialog ref="menu" class="menu-overlay" @click.self="closeMenu">
    <div class="menu-content">
      <SessionMenu
        :has-active-session="hasActiveSession"
        @start-new="handleStartNew"
        @resume="handleResume"
      />
      <button type="button" class="btn btn-gray" @click="closeMenu">Stäng</button>
    </div>
  </dialog>
</template>

<style scoped>
.home {
  display: grid;
  /* Bredderna är valda så att prologen och ID-kort + startknapp blir lika höga */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'handbook prolog id'
    'handbook prolog start';
  gap: 2rem;
}

.area-handbook {
  grid-area: handbook;
}
.area-prolog {
  grid-area: prolog;
}
.area-id {
  grid-area: id;
}
.area-start {
  grid-area: start;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

/* Tillfälligt, tas bort när alla komponenter är inkopplade */
.placeholder {
  min-height: 120px;
  border: 2px dashed var(--color-border-outer);
}

.menu-overlay {
  margin: auto;
  padding: 0;
  background: var(--color-bg-gray);
  border: 3px solid var(--color-border-outer);
  border-radius: 1rem;
  color: var(--color-text);
}

.menu-overlay::backdrop {
  background: rgb(0 0 0 / 70%);
}

.menu-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}
</style>
