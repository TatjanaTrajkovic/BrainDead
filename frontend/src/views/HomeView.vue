<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGame } from '@/composables/useGame';
import { useAuth } from '@/composables/useAuth';
import { useMediaQuery } from '../composables/useMediaQuery';
import SessionMenu from '@/components/SessionMenu.vue';
import HandbookOpen from '@/components/HandbookOpen.vue';
import StartButton from '@/components/StartButton.vue';
import { handbookPages } from '@/data/handbook';
import HighScoreOverlay from '@/components/HighScoreOverlay.vue';
import LoginCard from '@/components/LoginCard.vue';
import PrologueNotebook from '@/components/PrologueNotebook.vue';
import { prologuePages } from '@/data/prologue';
import HandbookHighscore from '@/components/HandbookHighscore.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const { error, start, resume, hasActiveSession, checkActiveSession } = useGame();
const { player, isAdmin, loadPlayer } = useAuth();

const isDesktop = useMediaQuery(
  '(min-width: 768px) and (min-height: 501px) and (orientation: landscape) and (pointer: fine)',
);

const isCompact = computed(() => !isDesktop.value);

// <dialog> längst ner i templaten ger bakgrund, stängning med Esc och håller fokus i menyn.
// Variabelnamnet matchar ref="menu" i templaten, så Vue lägger elementet här efter rendering
const menu = ref(null);
// Egen ruta i spelets stil som frågar om spelaren vill börja om, ersätter window.confirm
const restartDialog = ref(null);

// Styr om den uppslagna handboken visas
const isHandbookOpen = ref(false);

// Styr om topplistan visas
const isHighScoreOpen = ref(false);

// LoginCard skickar player-changed redan när den skapas, före onMounted.
// Flaggan gör att bara riktiga inloggningar skickar admin vidare, så admin kan gå till startsidan via loggan
let isMounted = false;

onMounted(() => {
  isMounted = true;
  checkActiveSession();
  loadPlayer();
});

// Admin som loggar in skickas till adminsidan, alla andra kollar om de har en pågående omgång
function handlePlayerChanged() {
  if (isMounted && isAdmin.value) {
    router.push({ name: 'admin' });
    return;
  }
  checkActiveSession();
}

function openMenu() {
  menu.value.showModal();
}

function closeMenu() {
  menu.value.close();
}

// Fråga först om spelaren har en pågående omgång, eftersom forceNew pausar den
function handleStartNew() {
  if (hasActiveSession.value) {
    restartDialog.value.open();
    return;
  }
  startNewGame();
}

function startNewGame() {
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
    <div class="col">
      <div class="area-handbook">
        <HandbookHighscore
          :part="isDesktop ? 'both' : 'handbook'"
          @open-handbook="isHandbookOpen = true"
          @open-highscore="isHighScoreOpen = true"
        />
      </div>
      <div class="area-prolog">
        <PrologueNotebook :pages="prologuePages" :popup="isCompact" />
      </div>
    </div>
    <div class="col">
      <div class="area-id">
        <LoginCard :player="player" :popup="isCompact" @player-changed="handlePlayerChanged" />
      </div>
      <div class="area-start">
        <!-- Admin spelar inte, så startknappen byts mot en länk till adminsidan -->
        <div v-if="isAdmin" class="admin-slot">
          <RouterLink :to="{ name: 'admin' }" class="btn btn-large admin-link">
            <span>Till adminsidan</span>
          </RouterLink>
        </div>
        <StartButton v-else @start="openMenu" />
      </div>
      <div v-if="!isDesktop" class="area-highscore">
        <HandbookHighscore part="highscore" @open-highscore="isHighScoreOpen = true" />
      </div>
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
      <!-- Kryss i hörnet, samma som i prologen och på id-kortet -->
      <button type="button" class="close" aria-label="Stäng" @click="closeMenu">✕</button>
    </div>
  </dialog>
  <ConfirmDialog
    ref="restartDialog"
    title="Pågående omgång"
    message="Du har en pågående omgång. Vill du börja om?"
    confirm-text="Börja om"
    cancel-text="Avbryt"
    @confirm="startNewGame"
  />
</template>

<style scoped>
.home {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  /* Taket: kolumnerna blir aldrig högre än skärmen.
     -header-h = loggans höjd */
  max-width: calc((100dvh - var(--header-h) - 0.5rem) * 0.63);
  margin-inline: auto;
}

.col {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.area-start {
  display: flex;
  justify-content: center;
  margin-top: -10%;
}

.menu-overlay {
  margin: auto;
  padding: 0;
  background: transparent;
  border: none;
}

.admin-slot {
  width: 100%;
}

.admin-link {
  display: block;
  color: var(--color-text);
  text-decoration: none;
  padding: 12% 5%;
}

/* Mindre text än i startknappen, "Till adminsidan" är längre */
.admin-link span {
  font-size: 13cqi;
}

.menu-overlay::backdrop {
  background: rgb(0 0 0 / 90%);
}

.menu-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

/* Samma kryss som .close i PrologueNotebook och LoginCard */
.close {
  position: fixed;
  top: max(0.5rem, env(safe-area-inset-top));
  right: max(0.5rem, env(safe-area-inset-right));
  width: 2.75rem;
  height: 2.75rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

/* Om stor bildskärm och muspekare */
@media (min-width: 768px) and (min-height: 501px) and (orientation: landscape) and (pointer: fine) {
  .home {
    display: grid;
    max-width: none;
    /* Tre lika breda kolumner så att prologen ligger mitt under loggan.
   ID-kort och startknapp görs mindre med width: 70% nedan */
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: 1fr auto;
    grid-template-areas:
      'handbook prolog id'
      'handbook prolog start';
  }

  .col {
    display: contents;
  }

  .area-handbook {
    grid-area: handbook;
  }

  .area-prolog {
    grid-area: prolog;
  }

  .area-id,
  .area-start {
    display: flex;
    justify-content: start;
  }

  .area-id :deep(.id-card),
  .area-start :deep(.nuke),
  .area-start .admin-slot {
    width: 70%;
  }

  /* Lika hög som startknappens bild, så att ID-kortet hamnar på samma plats för admin och spelare.
     Knappen ligger överst i rutan, direkt under ID-kortet */
  .admin-slot {
    aspect-ratio: 1226 / 1526;
    padding-top: 8%;
  }

  .area-id {
    align-self: center;
  }
}

/* Liggande kompakt skärm: --bild-h och --topp definieras i main.css */
@media (orientation: landscape) and (max-width: 767px),
  (orientation: landscape) and (pointer: coarse),
  (orientation: landscape) and (max-height: 500px) {
  .home {
    display: grid;
    align-items: stretch;
    gap: 0.4rem;
    max-width: none;
    margin-inline: auto;
    margin-top: var(--topp);
    width: calc(var(--bild-h) * 3.07);
    height: calc(var(--bild-h) * 1.55);
    /* Räknat på bildernas bredd/höjd */
    grid-template-columns: 0.794fr 0.755fr 0.716fr 0.803fr;
    grid-template-rows: calc(var(--bild-h) * 0.52) 1fr;
    grid-template-areas:
      'logo      logo     logo  id'
      'highscore handbook prolog start';
  }

  .col {
    display: contents;
  }

  .area-handbook {
    grid-area: handbook;
  }
  .area-highscore {
    grid-area: highscore;
  }
  .area-prolog {
    grid-area: prolog;
  }
  .area-start {
    grid-area: start;
    margin-top: 0;
  }

  .area-handbook,
  .area-highscore,
  .area-prolog,
  .area-id,
  .area-start {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    container-type: size;
    min-width: 0;
    min-height: 0;
  }

  .area-id {
    grid-area: id;
    align-items: start;
  }

  .area-prolog :deep(.notebook) {
    width: min(100cqw, calc(100cqh * 1640 / 2292));
    height: auto;
    aspect-ratio: 1640 / 2292;
  }

  .area-handbook :deep(.buttons) {
    width: min(100cqw, calc(100cqh * 800 / 1060));
    height: auto;
    aspect-ratio: 800 / 1060;
  }

  .area-highscore :deep(.buttons) {
    width: min(100cqw, calc(100cqh * 1232 / 1552));
    height: auto;
    aspect-ratio: 1232 / 1552;
  }

  .area-start :deep(.nuke) {
    width: min(100cqw, calc(100cqh * 1226 / 1526));
    height: auto;
    aspect-ratio: 1226 / 1526;
  }
  .area-id :deep(.id-card) {
    width: min(100cqw, calc(100cqh * 550 / 357));
    height: auto;
    aspect-ratio: 550 / 357;
  }
}
</style>
