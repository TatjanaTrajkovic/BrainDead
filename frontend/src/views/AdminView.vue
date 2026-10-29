<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { player, logout } = useAuth();

// Guarden har hämtat spelaren innan vyn visas. Namnet sparas, eftersom logout() nollar player
// även när utloggningen misslyckas, och då ska namnet fortfarande synas
const adminName = player.value?.display_name;
const isLoggingOut = ref(false);
const logoutFailed = ref(false);

const tabs = [
  { name: 'admin-questions', label: 'Frågor' },
  { name: 'admin-users', label: 'Spelare' },
  { name: 'admin-stats', label: 'Statistik' },
];

// Går bara till startsidan om utloggningen lyckades. Misslyckas den kan cookien fortfarande
// gälla i backend, och då vore admin inloggad igen efter en omladdning. Admin stannar därför
// kvar och kan försöka igen, samma lösning som i LoginCard
async function handleLogout() {
  isLoggingOut.value = true;
  logoutFailed.value = false;
  try {
    await logout();
    router.push({ name: 'home' });
  } catch {
    logoutFailed.value = true;
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<template>
  <div class="admin">
    <header class="admin-topbar">
      <div class="admin-topbar-inner">
        <RouterLink :to="{ name: 'home' }" class="admin-brand">
          BrainDead <span class="admin-badge">Admin</span>
        </RouterLink>

        <nav class="admin-tabs" aria-label="Adminsidor">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.name"
            :to="{ name: tab.name }"
            class="admin-tab"
            active-class="is-active"
          >
            {{ tab.label }}
          </RouterLink>
        </nav>

        <div class="admin-user">
          <span class="admin-user-name">
            Inloggad som <strong>{{ adminName }}</strong>
          </span>
          <button type="button" class="admin-button" :disabled="isLoggingOut" @click="handleLogout">
            Logga ut
          </button>
        </div>
      </div>
    </header>

    <p v-if="logoutFailed" class="admin-logout-error" role="alert">
      Kunde inte logga ut. Kontrollera anslutningen och försök igen.
    </p>

    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Adminsidan har en neutral design (#183) och egen layout, utan spelets logga och bakgrund.
   main.css styr header och main globalt (bredd, centrering, absolut position i liggande läge),
   så de nollställs här. Klass + scoped-attribut väger tyngre än elementväljarna i main.css.
   Mobile first: grundstilarna gäller mobil, media queries lägger till för större skärmar */

/* Täcker hela skärmen och scrollar själv, eftersom #app har overflow: hidden och i liggande
   läge en fast höjd */
.admin {
  width: 100%;
  height: 100dvh;
  overflow-y: auto;
  background: var(--admin-bg);
}

.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  left: auto;
  display: block;
  width: auto;
  height: auto;
  max-width: none;
  margin: 0;
  text-align: left;
  background: var(--admin-surface);
  border-bottom: 1px solid var(--admin-border);
}

/* Mobil: varumärke och utloggning på första raden, flikarna på hela andra raden */
.admin-topbar-inner {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'brand user'
    'tabs tabs';
  align-items: center;
  column-gap: 1rem;
  max-width: var(--admin-max-width);
  margin: 0 auto;
  padding: 0.5rem 1rem 0;
}

.admin-brand {
  grid-area: brand;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--admin-text);
  text-decoration: none;
}

.admin-user {
  grid-area: user;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Namnet får inte plats bredvid knappen på smala skärmar */
.admin-user-name {
  display: none;
  color: var(--admin-muted);
  white-space: nowrap;
}

.admin-user-name strong {
  color: var(--admin-text);
}

.admin-tabs {
  grid-area: tabs;
  display: flex;
  margin-top: 0.25rem;
}

/* Lika breda flikar på mobil, minst 44 px höga så de är lätta att träffa */
.admin-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 0.75rem;
  color: var(--admin-muted);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 2px solid transparent;
}

.admin-tab:hover {
  color: var(--admin-text);
}

.admin-tab.is-active {
  color: var(--admin-text);
  border-bottom-color: var(--admin-accent);
}

/* Ligger under topraden, i samma bredd som innehållet */
.admin-logout-error {
  width: calc(100% - 2rem);
  max-width: calc(var(--admin-max-width) - 2rem);
  margin: 1rem auto 0;
  padding: 0.75rem 1rem;
  color: var(--admin-danger);
  background: color-mix(in srgb, var(--admin-danger) 8%, var(--admin-surface));
  border: 1px solid color-mix(in srgb, var(--admin-danger) 30%, transparent);
  border-radius: var(--admin-radius);
}

.admin-main {
  width: auto;
  max-width: var(--admin-max-width);
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
  text-align: left;
}

@media (min-width: 600px) {
  .admin-user-name {
    display: inline;
  }
}

/* Desktop: allt på en rad, flikarna direkt efter varumärket */
@media (min-width: 768px) {
  .admin-topbar-inner {
    grid-template-columns: auto 1fr auto;
    grid-template-areas: 'brand tabs user';
    column-gap: 2rem;
    padding: 0 2rem;
  }

  .admin-tabs {
    margin-top: 0;
    align-self: stretch;
  }

  .admin-tab {
    flex: none;
    min-height: 56px;
  }

  .admin-main {
    padding: 2rem 2rem 3rem;
  }

  .admin-logout-error {
    width: calc(100% - 4rem);
    max-width: calc(var(--admin-max-width) - 4rem);
  }
}
</style>

<style>
/* Gemensamt för adminsidan och flikarnas komponenter (QuestionList, UserList, StatsTable).
   Inte scoped, så att barnen kan använda klasserna, men allt ligger under .admin och når
   därför aldrig spelet. Färgerna ligger som variabler på .admin, inte :root, av samma skäl */
.admin {
  --admin-bg: #f6f7f9;
  --admin-surface: #ffffff;
  --admin-text: #1f2328;
  --admin-muted: #656d76;
  --admin-border: #e3e6ea;
  --admin-accent: #1f6feb;
  --admin-accent-hover: #1a5fd0;
  --admin-success-bg: #dafbe1;
  --admin-success-text: #1a7f37;
  --admin-neutral-bg: #eef0f3;
  --admin-danger: #cf222e;
  --admin-radius: 6px;
  --admin-max-width: 1200px;

  color: var(--admin-text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 0.9375rem;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
}

/* Sidrubrik i varje flik: titel och undertext, med en eventuell knapp till höger på desktop */
.admin .admin-page-head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.admin .admin-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
}

.admin .admin-subtitle {
  margin-top: 0.25rem;
  color: var(--admin-muted);
}

.admin .admin-card {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  padding: 1rem;
}

.admin .admin-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 36px;
  padding: 0 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-text);
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  white-space: nowrap;
}

.admin .admin-button:hover {
  background: var(--admin-bg);
}

.admin .admin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin .admin-button--primary {
  color: #ffffff;
  background: var(--admin-accent);
  border-color: var(--admin-accent);
}

.admin .admin-button--primary:hover {
  background: var(--admin-accent-hover);
}

.admin .admin-button--danger {
  color: var(--admin-danger);
}

.admin .admin-button:focus-visible,
.admin a:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}

.admin .admin-badge {
  display: inline-block;
  padding: 0.0625rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
  color: var(--admin-muted);
  background: var(--admin-neutral-bg);
}

.admin .admin-badge--success {
  color: var(--admin-success-text);
  background: var(--admin-success-bg);
}

@media (min-width: 768px) {
  .admin .admin-page-head {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
}
</style>
