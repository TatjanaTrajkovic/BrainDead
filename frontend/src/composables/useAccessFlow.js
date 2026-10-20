import { ref, computed, onBeforeUnmount } from 'vue';

// Alternativen i menyn på panelens skärm. `id` skickas till onChoice.
const ITEMS = [
  { id: 'google', label: 'GOOGLE' },
  { id: 'github', label: 'GITHUB' },
  { id: 'avbryt', label: 'AVBRYT' },
];

const GRANTED_MS = 700; // hur länge "ÅTKOMST BEVILJAD" visas innan menyn kommer
const RESULT_MS = 2500; // hur länge "LOGGAR IN MED …" visas innan panelen återställs

/**
 * Tillståndsmaskinen bakom panelen:
 *
 *   idle ──(tummen hålls över scannern)──▶ scanning ──(klar)──▶ granted ──▶ menu ──(OK)──▶ result ──▶ idle
 *                  ▲                            │                            │
 *                  └────(tummen lämnar/släpps)──┘                            └──(AVBRYT)──▶ idle
 *
 * @param {(provider: 'google' | 'github') => void} onChoice  anropas när användaren valt en inloggning
 */
export function useAccessFlow(onChoice) {
  const state = ref('idle'); // idle | scanning | granted | menu | result
  const progress = ref(0); // 0–1 under scanningen
  const selected = ref(0); // index i ITEMS
  const chosen = ref('');
  let timer = null;

  // Tummen ska bara reagera på scannern i dessa lägen
  const canScan = computed(() => state.value === 'idle' || state.value === 'scanning');

  // Texten som visas på skärmen (när menyn inte visas)
  const message = computed(() => {
    switch (state.value) {
      case 'scanning':
        return `SKANNAR… ${Math.round(progress.value * 100)} %`;
      case 'granted':
        return 'ÅTKOMST BEVILJAD';
      case 'result':
        return `LOGGAR IN MED ${chosen.value.toUpperCase()}…`;
      default:
        return 'HÅLL TUMMEN PÅ SCANNERN';
    }
  });

  function reset() {
    clearTimeout(timer);
    state.value = 'idle';
    progress.value = 0;
  }

  // ---- Händelser från ThumbTest ----
  function onScanStart() {
    state.value = 'scanning';
    progress.value = 0;
  }

  function onScanProgress(value) {
    if (state.value !== 'scanning') return;
    progress.value = value;
  }

  function onScanCancel() {
    if (state.value === 'scanning') reset();
  }

  function onScanned() {
    if (state.value !== 'scanning') return;
    state.value = 'granted';
    progress.value = 1;
    clearTimeout(timer);
    timer = setTimeout(() => {
      selected.value = 0;
      state.value = 'menu';
    }, GRANTED_MS);
  }

  // ---- Händelser från panelens knappar ----
  function moveSelection(step) {
    if (state.value !== 'menu') return;
    selected.value = (selected.value + step + ITEMS.length) % ITEMS.length;
  }

  function confirmSelection() {
    if (state.value !== 'menu') return;
    const picked = ITEMS[selected.value].id;
    if (picked === 'avbryt') {
      reset();
      return;
    }
    chosen.value = picked;
    state.value = 'result';
    onChoice?.(picked);
    timer = setTimeout(reset, RESULT_MS);
  }

  onBeforeUnmount(() => clearTimeout(timer));

  return {
    items: ITEMS,
    state,
    progress,
    selected,
    canScan,
    message,
    reset,
    onScanStart,
    onScanProgress,
    onScanCancel,
    onScanned,
    moveSelection,
    confirmSelection,
  };
}
