<script setup>
import { computed, nextTick, ref, watch, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import IdForm from '@/components/homepage/IdForm.vue';
import waxStamped from '@/assets/images/wax_stamped.webp';
import { stampQuotes } from '@/utils/stampQuotes';

const props = defineProps({
  // Spelaren från useAuth, null för en ny besökare. Gäster har is_guest = true
  player: { type: Object, default: null },
  popup: { type: Boolean, default: false },
});

const survivorQuote = computed(() => {
  if (!props.player?.has_survived || props.player?.survived_health == null) return '';
  return stampQuotes(props.player.survived_health);
});

const expanded = ref(false);

// Skickas efter inloggning, registrering och utloggning, så att HomeView kan kolla
// om den nya spelaren har en pågående omgång
const emit = defineEmits(['player-changed']);

const { logout } = useAuth();

// Bara registrerade spelare har ett konto att stämpla ut från. Gäster kan fortfarande identifiera sig
const isRegistered = computed(() => props.player && !props.player.is_guest);

// true = kortet är vänt och visar formuläret på baksidan
const isFlipped = ref(false);
// 'signup' (NY IDENTITET) eller 'login' (IDENTIFIERA), styr vad formuläret på baksidan gör
const formMode = ref('signup');
// Nytt key varje gång kortet vänds, så att formuläret alltid börjar tomt
const formKey = ref(0);
// true = utloggningen misslyckades, visas på framsidan
const logoutFailed = ref(false);

const idForm = ref(null);
// Knappen som vände kortet, så att fokus kan gå tillbaka dit
let lastButton = null;

async function showForm(mode, event) {
  lastButton = event.currentTarget;
  formMode.value = mode;
  formKey.value++;
  logoutFailed.value = false;
  isFlipped.value = true;
  // Vänta tills baksidan inte längre är inert, annars går den inte att fokusera
  await nextTick();
  idForm.value.focus();
}

async function showFront() {
  isFlipped.value = false;
  await nextTick();
  // Efter inloggning finns knappen inte längre, då hamnar fokus på sidan som vanligt
  if (lastButton?.isConnected) {
    lastButton.focus();
  }
}

function handleDone() {
  emit('player-changed');
  showFront();
}

async function handleLogout() {
  logoutFailed.value = false;
  try {
    await logout();
  } catch {
    // useAuth har redan nollat player. Men cookien kan fortfarande gälla i backend,
    // så spelaren kan vara inloggad igen efter en omladdning
    logoutFailed.value = true;
  }
}

function expand(event) {
  if (props.popup && !expanded.value) {
    event.stopPropagation();
    event.preventDefault();
    expanded.value = true;
  }
}

function collapse() {
  expanded.value = false;
  isFlipped.value = false;
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    collapse();
  }
}

watch(expanded, (isExpanded) => {
  if (isExpanded) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

watch(
  () => props.popup,
  (isPopup) => {
    if (!isPopup) {
      expanded.value = false;
    }
  },
);
emit('player-changed');
</script>

<template>
  <Teleport to="body" :disabled="!expanded">
    <!-- wrap-div för tryck på bakgrund stänger -->
    <div class="wrap" :class="{ expanded }" @click.self="collapse">
      <section
        class="id-card"
        :class="{ flipped: isFlipped, flipped: isFlipped, clickable: popup && !expanded }"
        @click="expand"
      >
        <div class="card-inner">
          <!-- inert: sidan som är vänd bort går inte att klicka eller tabba till -->
          <div class="face front" :inert="isFlipped">
            <div class="text">
              <h2>ID-KORT</h2>
              <p class="company">Skumma Aktier AB</p>
              <!-- display_name är samma namn som i topplistan: användarnamnet eller Gäst-<id> -->
              <p class="status" :class="{ known: isRegistered }">
                {{ player ? player.display_name : 'OIDENTIFIERAD' }}
              </p>
              <p v-if="logoutFailed" class="notice" role="alert">Kunde inte stämpla ut</p>
              <div v-if="!isRegistered" class="actions">
                <button type="button" class="stamp" @click="showForm('login', $event)">
                  IDENTIFIERA
                </button>
                <button type="button" class="stamp new-id" @click="showForm('signup', $event)">
                  NY IDENTITET
                </button>
              </div>
              <button v-else type="button" class="stamp logout" @click="handleLogout">
                STÄMPLA UT
              </button>
            </div>

            <!-- Överlevarsigill om spelaren har klarat apokalypsen -->
            <div v-if="player?.has_survived" class="wax-stamp">
              <img class="wax-img" :src="waxStamped" alt="Överlevarsigill" />
              <div class="stamp-text">
                <span class="stamp-percent">{{ player.survived_health }}%</span>
                <span class="stamp-capacity">HJÄRNKAPACITET</span>
                <span class="stamp-quote">{{ survivorQuote }}</span>
              </div>
            </div>
          </div>

          <div class="face back" :inert="!isFlipped">
            <IdForm
              ref="idForm"
              :key="formKey"
              :mode="formMode"
              @done="handleDone"
              @cancel="showFront"
            />
          </div>
        </div>
      </section>
      <button
        v-if="expanded"
        type="button"
        class="close-corner"
        aria-label="Stäng"
        @click="collapse"
      >
        ✕
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.wrap {
  display: contents;
}

.wrap.expanded {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: var(--color-backdrop);
}

.expanded .id-card {
  width: min(92vw, calc((100dvh - 1rem) * 550 / 357));
}

.clickable {
  cursor: pointer;
}
.id-card {
  width: 100%;
  aspect-ratio: 550 / 357;
  container-type: inline-size;
  color: var(--color-ink);
  text-align: left;
  perspective: 1200px;
}

/* Vänds runt sin mittlinje. Båda sidorna ligger på samma plats, baksidan är redan vänd 180° */
.card-inner {
  position: relative;
  height: 100%;
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
}

.flipped .card-inner {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.front {
  background: url('@/assets/images/logincard.webp') center / contain no-repeat;
}

/* Samma papper som framsidan, men utan fotot */
.back {
  padding: 8% 7% 8%;
  background: url('@/assets/images/idPlaceholderClean.webp') center / contain no-repeat;
  transform: rotateY(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .card-inner {
    transition: none;
  }
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
  /* Namnet bryts aldrig till två rader. Max 11 tecken får plats, se validateUsername.js.
     Ellipsis är en säkerhet för namn som redan finns i databasen */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.notice {
  padding-top: 1cqw;
  font-size: 3cqw;
  color: #750000;
  white-space: nowrap;
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

/* Överlevarsigill på ID-kortets foto */
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
  pointer-events: none;
}

.wax-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
}

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
</style>
