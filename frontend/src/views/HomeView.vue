<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGame } from '@/composables/useGame';
import { useAuth } from '@/composables/useAuth';
import SessionMenu from '@/components/SessionMenu.vue';
import HandbookOpen from '@/components/HandbookOpen.vue';
import { handbookPages } from '@/data/handbook';
import HighScoreOverlay from '@/components/HighScoreOverlay.vue';
import LoginCard from '@/components/LoginCard.vue';
import PrologueNotebook from '@/components/PrologueNotebook.vue';
import { prologuePages } from '@/data/prologue';
import HandbookHighscore from '@/components/HandbookHighscore.vue';
import ThumbTest from '@/components/ThumbTest.vue';
import { useAccessFlow } from '@/composables/useAccessFlow';
import AccessPanel from '@/components/AccessPanel.vue';

const router = useRouter();
const { error, start, resume, hasActiveSession, checkActiveSession } = useGame();
const { player, loadPlayer } = useAuth();

// <dialog> längst ner i templaten ger bakgrund, stängning med Esc och håller fokus i menyn.
// Variabelnamnet matchar ref="menu" i templaten, så Vue lägger elementet här efter rendering
const menu = ref(null);

// Tillståndsmaskinen för panelen och tummen. handleLogin anropas när spelaren valt Google/GitHub
const {
  items,
  state: accessState,
  progress,
  selected,
  canScan,
  message,
  reset: resetAccess,
  onScanStart,
  onScanProgress,
  onScanCancel,
  onScanned,
  moveSelection,
  confirmSelection,
} = useAccessFlow(handleLogin);

// Styr om den uppslagna handboken visas
const isHandbookOpen = ref(false);

// Styr om topplistan visas
const isHighScoreOpen = ref(false);

onMounted(() => {
  checkActiveSession();
  loadPlayer();
});

function openMenu() {
  menu.value.showModal();
}

function closeMenu() {
  menu.value.close();
}

// provider är 'google' eller 'github'. Koppla in din inloggning här
// (jag har inte sett useAuth, så anpassa efter vad den erbjuder)
function handleLogin(provider) {
  console.log('Logga in med', provider);
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

function handleStart() {
  resetAccess();
  openMenu();
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
    <div class="area-handbook">
      <HandbookHighscore
        @open-handbook="isHandbookOpen = true"
        @open-highscore="isHighScoreOpen = true"
      />
    </div>
    <div class="area-prolog">
      <PrologueNotebook :pages="prologuePages" />
    </div>
    <LoginCard class="area-id" :player="player" />
    <div class="area-panel">
      <AccessPanel
        class="panel"
        :state="accessState"
        :message="message"
        :progress="progress"
        :items="items"
        :selected="selected"
        @up="moveSelection(-1)"
        @down="moveSelection(1)"
        @ok="confirmSelection"
        @start="handleStart"
      />
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
  <ThumbTest
    anchor-to=".home"
    anchor-side="right"
    :anchor-offset-x="-10"
    :anchor-offset-y="30"
    scanner-selector=".access-scanner"
    :scan-enabled="canScan"
    :z-index="30"
    @scan-start="onScanStart"
    @scan-progress="onScanProgress"
    @scan-cancel="onScanCancel"
    @scanned="onScanned"
  />
</template>

<style scoped>
.home {
  display: grid;
  /* Bredderna är valda så att prologen och panelen blir lika höga */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'handbook prolog panel'
    'handbook prolog panel';
  gap: 2rem;
  height: 100%;
}

.area-handbook {
  grid-area: handbook;
  width: 100%;
  height: 100%;
}
.area-prolog {
  grid-area: prolog;
}
.area-id {
  grid-area: id;
}

.area-panel {
  grid-area: panel;
  min-height: 0;
  /* Innehållet räknas som 0 i höjd, så panelen påverkar inte radhöjden.
     Rutan sträcks ändå till grid-arean. */
  contain: size;
  display: flex;
  justify-content: center;
}

/* Panelen fyller grid-arean på höjden, bredden följer bildens proportioner.
   .area-panel > .panel behövs för att slå AccessPanels egen width: 100% */
.area-panel > .panel {
  width: auto;
  height: 100%;
  max-width: 100%;
  min-width: 0;
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
