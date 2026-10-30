<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { deleteOldGuests, getUsers, getUserSessions, setUserRole, setUserStatus } from '@/api/adminApi';
import { useAuth } from '@/composables/useAuth';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const { player } = useAuth();
const myId = computed(() => player.value?.user_id);

const users = ref([]);
const isLoading = ref(true);
const loadError = ref('');

// Filtrets värde skickas som ?type= till backend, null visar alla
const filter = ref(null);
const search = ref('');

const filters = [
  { value: null, label: 'Alla' },
  { value: 'registered', label: 'Registrerade' },
  { value: 'guest', label: 'Gäster' },
  { value: 'banned', label: 'Bannade' },
];

// Backend filtrerar och söker, eftersom den bara skickar 100 spelare åt gången.
// Numret gör att ett långsamt svar på en gammal sökning inte skriver över ett nyare
let requestNumber = 0;

async function loadUsers() {
  const thisRequest = ++requestNumber;
  isLoading.value = true;
  loadError.value = '';
  try {
    const result = await getUsers({ type: filter.value, search: search.value.trim() });
    if (thisRequest === requestNumber) users.value = result;
  } catch (err) {
    // err.status saknas när servern inte svarar alls
    if (thisRequest === requestNumber) {
      loadError.value = err.status ? err.message : 'Kunde inte nå servern';
    }
  } finally {
    if (thisRequest === requestNumber) isLoading.value = false;
  }
}

watch(filter, loadUsers);

// Väntar 300 ms efter sista tangenttrycket, så att varje bokstav inte blir ett anrop
let searchTimer;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadUsers, 300);
});

onMounted(loadUsers);

// Utfällda spelare och deras omgångar. Omgångarna hämtas första gången raden öppnas
const expandedIds = ref(new Set());
const sessionsById = ref({});
const sessionErrors = ref({});

async function toggleSessions(user) {
  const id = user.user_id;
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
    return;
  }
  expandedIds.value.add(id);
  if (sessionsById.value[id]) return;

  delete sessionErrors.value[id];
  try {
    sessionsById.value[id] = await getUserSessions(id);
  } catch (err) {
    sessionErrors.value[id] = err.status ? err.message : 'Kunde inte nå servern';
  }
}

// Samma regler som backend: gäster får inga knappar, admins kan inte bannas
// och bannade kan inte byta roll. På egen rad visas inga knappar alls
function canBan(user) {
  return !user.is_guest && user.role === 'PLAYER';
}

function canChangeRole(user) {
  return !user.is_guest && user.status === 'ACTIVE';
}

function hasActions(user) {
  return user.user_id !== myId.value && (canBan(user) || canChangeRole(user));
}

function roleLabel(user) {
  if (user.is_guest) return 'Gäst';
  return user.role === 'ADMIN' ? 'Admin' : 'Spelare';
}

const statusLabels = { ACTIVE: 'Aktiv', INACTIVE: 'Inaktiv', BANNED: 'Bannad' };

function formatDate(value) {
  return new Date(value).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sessionResult(session) {
  if (session.status === 'ACTIVE') return 'Pågår';
  if (session.status === 'PAUSED') return 'Pausad';
  return session.current_health > 0 ? 'Överlevde' : 'Dog';
}

// En bekräftelseruta för alla åtgärder. Texten och vad som händer vid OK sätts när
// admin klickar, sedan öppnas rutan
const dialog = ref(null);
const pending = ref({ title: '', message: '', confirmText: 'OK', danger: false, run: null });
const busyIds = ref(new Set());
const actionError = ref('');
const actionMessage = ref('');

async function ask(options) {
  pending.value = options;
  // Väntar tills rutan har fått de nya texterna, annars syns de gamla en kort stund
  await nextTick();
  dialog.value.open();
}

function askBan(user) {
  const isBanned = user.status === 'BANNED';
  ask({
    title: isBanned ? 'Avbanna spelare?' : 'Banna spelare?',
    message: isBanned
      ? `${user.display_name} kan logga in och spela igen.`
      : `${user.display_name} loggas ut direkt, kan inte logga in och syns inte i topplistan.`,
    confirmText: isBanned ? 'Avbanna' : 'Banna',
    danger: !isBanned,
    run: () => setUserStatus(user.user_id, isBanned ? 'ACTIVE' : 'BANNED'),
    busyKey: user.user_id,
  });
}

function askRole(user) {
  const isAdmin = user.role === 'ADMIN';
  ask({
    title: isAdmin ? 'Gör till spelare?' : 'Gör till admin?',
    message: isAdmin
      ? `${user.display_name} förlorar tillgången till adminsidan.`
      : `${user.display_name} får tillgång till adminsidan och kan ändra frågor och spelare.`,
    confirmText: isAdmin ? 'Gör till spelare' : 'Gör till admin',
    danger: !isAdmin,
    run: () => setUserRole(user.user_id, isAdmin ? 'PLAYER' : 'ADMIN'),
    busyKey: user.user_id,
  });
}

// Backend avgör vilka gäster som är gamla, så frontend visar bara antalet som raderades
function askDeleteGuests() {
  ask({
    title: 'Rensa gamla gäster?',
    message:
      'Gäster som är äldre än 30 dagar och aldrig har spelat en omgång raderas. Det går inte att ångra.',
    confirmText: 'Rensa',
    danger: true,
    run: async () => {
      const { deleted } = await deleteOldGuests();
      actionMessage.value =
        deleted === 0
          ? 'Det fanns inga gamla gäster att rensa.'
          : `${deleted} ${deleted === 1 ? 'gammal gäst' : 'gamla gäster'} raderades.`;
    },
    busyKey: 'guests',
  });
}

// Listan hämtas om efter ändringen, så att filtret stämmer. En avbannad spelare
// ska till exempel försvinna från Bannade
async function runPending() {
  const { run, busyKey } = pending.value;
  busyIds.value.add(busyKey);
  actionError.value = '';
  actionMessage.value = '';
  try {
    await run();
    await loadUsers();
  } catch (err) {
    actionError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    busyIds.value.delete(busyKey);
  }
}
</script>

<template>
  <section>
    <div class="admin-page-head">
      <div>
        <h1 class="admin-title">Spelare</h1>
        <p class="admin-subtitle">Klicka på ett namn för att se spelarens omgångar.</p>
      </div>
      <button
        type="button"
        class="admin-button admin-button--danger"
        :disabled="busyIds.has('guests')"
        @click="askDeleteGuests"
      >
        Rensa gamla gäster
      </button>
    </div>

    <div class="toolbar">
      <div class="segmented" role="group" aria-label="Visa spelare">
        <button
          v-for="f in filters"
          :key="f.label"
          type="button"
          class="segment"
          :class="{ 'is-active': filter === f.value }"
          :aria-pressed="filter === f.value"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <label class="search">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none" />
          <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <input v-model="search" type="search" placeholder="Sök namn" aria-label="Sök namn" />
      </label>
    </div>

    <p v-if="actionError" class="admin-alert action-error" role="alert">{{ actionError }}</p>
    <p v-if="actionMessage" class="action-message" role="status">{{ actionMessage }}</p>

    <div v-if="loadError" class="admin-alert load-error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" class="admin-button" @click="loadUsers">Försök igen</button>
    </div>

    <!-- Listan ligger kvar medan en ny sökning hämtas, så att sidan inte blinkar -->
    <p v-else-if="isLoading && users.length === 0" class="admin-subtitle">Hämtar spelare…</p>

    <p v-else-if="users.length === 0" class="admin-card">Inga spelare matchar.</p>

    <div v-else class="list" :class="{ 'is-loading': isLoading }">
      <div class="list-head" aria-hidden="true">
        <span>Namn</span>
        <span>Roll</span>
        <span>Status</span>
        <span>Omgångar</span>
        <span>Bästa</span>
        <span class="align-end">Åtgärder</span>
      </div>

      <ul>
        <li
          v-for="user in users"
          :key="user.user_id"
          class="row"
          :class="{ 'is-banned': user.status === 'BANNED' }"
        >
          <div class="cell-name">
            <button
              type="button"
              class="name-button"
              :aria-expanded="expandedIds.has(user.user_id)"
              @click="toggleSessions(user)"
            >
              <svg class="chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.75" fill="none" />
              </svg>
              {{ user.display_name }}
            </button>
            <span v-if="user.user_id === myId" class="you">(du)</span>
          </div>

          <div class="cell-role">
            <span class="admin-badge" :class="{ 'badge-admin': user.role === 'ADMIN' }">
              {{ roleLabel(user) }}
            </span>
          </div>

          <div class="cell-status">
            <span
              class="admin-badge"
              :class="{
                'admin-badge--success': user.status === 'ACTIVE',
                'badge-banned': user.status === 'BANNED',
              }"
            >
              {{ statusLabels[user.status] }}
            </span>
          </div>

          <div class="cell-sessions">
            {{ user.session_count }}<span class="mobile-label"> omgångar</span>
          </div>

          <div class="cell-best">
            <span class="mobile-label">Bästa </span>{{ user.best_score ?? '–' }}
          </div>

          <!-- Cellen finns alltid, så att kolumnerna stämmer på desktop. På mobil döljs den tom -->
          <div class="cell-actions" :class="{ 'no-actions': !hasActions(user) }">
            <template v-if="hasActions(user)">
              <button
                v-if="canBan(user)"
                type="button"
                class="admin-button"
                :class="{ 'admin-button--danger': user.status !== 'BANNED' }"
                :disabled="busyIds.has(user.user_id)"
                @click="askBan(user)"
              >
                {{ user.status === 'BANNED' ? 'Avbanna' : 'Banna' }}
              </button>
              <button
                v-if="canChangeRole(user)"
                type="button"
                class="admin-button"
                :disabled="busyIds.has(user.user_id)"
                @click="askRole(user)"
              >
                {{ user.role === 'ADMIN' ? 'Gör till spelare' : 'Gör till admin' }}
              </button>
            </template>
          </div>

          <div v-if="expandedIds.has(user.user_id)" class="sessions">
            <p v-if="sessionErrors[user.user_id]" class="admin-alert">
              {{ sessionErrors[user.user_id] }}
            </p>
            <p v-else-if="!sessionsById[user.user_id]" class="admin-subtitle">Hämtar omgångar…</p>
            <p v-else-if="sessionsById[user.user_id].length === 0" class="admin-subtitle">
              Inga omgångar än.
            </p>
            <table v-else>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Hälsa</th>
                  <th>Frågor</th>
                  <th>Resultat</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="session in sessionsById[user.user_id]" :key="session.session_id">
                  <td>{{ formatDate(session.started_at) }}</td>
                  <td>{{ session.current_health }}</td>
                  <td>{{ session.answered_count }}/{{ session.total_questions }}</td>
                  <td>{{ sessionResult(session) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      </ul>
    </div>

    <ConfirmDialog
      ref="dialog"
      variant="admin"
      :danger="pending.danger"
      :title="pending.title"
      :message="pending.message"
      :confirm-text="pending.confirmText"
      @confirm="runPending"
    />
  </section>
</template>

<style scoped>
/* Samma uppbyggnad som QuestionList: kort på mobil, tabell från 768 px */

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.segmented {
  display: flex;
  padding: 0.1875rem;
  background: var(--admin-neutral-bg);
  border-radius: var(--admin-radius);
}

.segment {
  flex: 1;
  min-height: 36px;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
  white-space: nowrap;
  border-radius: calc(var(--admin-radius) - 2px);
}

.segment.is-active {
  color: var(--admin-text);
  background: var(--admin-surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}

.search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0 0.75rem;
  color: var(--admin-muted);
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.search:focus-within {
  border-color: var(--admin-accent);
  outline: 2px solid color-mix(in srgb, var(--admin-accent) 25%, transparent);
}

.search input {
  flex: 1;
  min-width: 0;
  font: inherit;
  color: var(--admin-text);
  background: none;
  border: none;
  outline: none;
}

.action-error {
  margin-bottom: 1rem;
}

/* Grön ruta med resultatet, t.ex. hur många gäster som raderades */
.action-message {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  color: var(--admin-success-text);
  background: var(--admin-success-bg);
  border-radius: var(--admin-radius);
}

.load-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.list.is-loading {
  opacity: 0.6;
}

.list ul {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}

.list-head {
  display: none;
}

/* Kort på mobil: namn och status överst, sedan roll, siffror och knappar */
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'name status'
    'role role'
    'sessions best'
    'actions actions'
    'expanded expanded';
  gap: 0.5rem;
  padding: 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.cell-name {
  grid-area: name;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.name-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  min-height: 32px;
  font: inherit;
  font-weight: 600;
  color: var(--admin-text);
  text-align: left;
  overflow-wrap: anywhere;
  background: none;
  border: none;
  cursor: pointer;
}

.name-button:hover {
  color: var(--admin-accent);
}

.chevron {
  flex-shrink: 0;
  color: var(--admin-muted);
  transition: transform 0.15s;
}

.name-button[aria-expanded='true'] .chevron {
  transform: rotate(90deg);
}

.you {
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.cell-role {
  grid-area: role;
}

.cell-status {
  grid-area: status;
  justify-self: end;
}

.cell-sessions,
.cell-best {
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.cell-sessions {
  grid-area: sessions;
}

.cell-best {
  grid-area: best;
  justify-self: end;
}

.cell-actions {
  grid-area: actions;
  display: flex;
  gap: 0.5rem;
}

.cell-actions.no-actions {
  display: none;
}

.cell-actions .admin-button {
  flex: 1;
}

.badge-admin {
  color: var(--admin-accent);
  background: color-mix(in srgb, var(--admin-accent) 12%, var(--admin-surface));
}

.badge-banned {
  color: var(--admin-danger);
  background: color-mix(in srgb, var(--admin-danger) 10%, var(--admin-surface));
}

.row.is-banned .name-button {
  color: var(--admin-muted);
}

/* Spelarens omgångar, under raden */
.sessions {
  grid-area: expanded;
  padding: 0.75rem;
  background: var(--admin-bg);
  border-radius: var(--admin-radius);
  overflow-x: auto;
}

.sessions table {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}

.sessions th {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: left;
  color: var(--admin-muted);
}

.sessions th,
.sessions td {
  padding: 0.375rem 0.5rem;
  white-space: nowrap;
  border-bottom: 1px solid var(--admin-border);
}

.sessions tr:last-child td {
  border-bottom: none;
}

@media (min-width: 600px) {
  .toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .segment {
    flex: none;
    padding: 0 0.75rem;
  }

  .search {
    width: 250px;
  }

  .cell-actions {
    justify-content: flex-end;
  }

  .cell-actions .admin-button {
    flex: none;
  }
}

/* Desktop: rubrikrad och raderna i samma fasta kolumner, som i QuestionList */
@media (min-width: 768px) {
  .list {
    overflow: hidden;
    background: var(--admin-surface);
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
  }

  .list-head,
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 5.5rem 5.5rem 5.5rem 4rem 16rem;
    grid-template-areas:
      'name role status sessions best actions'
      'expanded expanded expanded expanded expanded expanded';
    align-items: center;
    column-gap: 1rem;
    padding: 0.75rem 1rem;
  }

  .list-head {
    grid-template-areas: none;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--admin-muted);
    border-bottom: 1px solid var(--admin-border);
  }

  .list ul {
    gap: 0;
  }

  .row {
    row-gap: 0;
    border: none;
    border-bottom: 1px solid var(--admin-border);
    border-radius: 0;
  }

  .row:last-child {
    border-bottom: none;
  }

  .row.is-banned {
    background: var(--admin-bg);
  }

  .cell-status,
  .cell-best {
    justify-self: start;
  }

  .cell-sessions,
  .cell-best {
    font-size: inherit;
    color: var(--admin-text);
  }

  .mobile-label {
    display: none;
  }

  .cell-actions.no-actions {
    display: flex;
  }

  .sessions {
    margin-top: 0.75rem;
  }

  .align-end {
    text-align: right;
  }
}
</style>
