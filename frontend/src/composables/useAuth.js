import { ref } from 'vue';
import { ensurePlayer as ensurePlayerApi, getMe } from '../api/gameApi';

// Delat state, som i useGame: alla vyer ser samma spelare.
// null = ingen spelare än (ny besökare). Annars { user_id, username, role, is_guest, display_name }
const player = ref(null);

export function useAuth() {
  // Hämtar spelaren från cookien. 401 betyder att besökaren inte har spelat än
  async function loadPlayer() {
    try {
      player.value = await getMe();
    } catch {
      player.value = null;
    }
  }

  // Gör besökaren till gäst om den inte redan är spelare, och uppdaterar player
  async function ensurePlayer() {
    player.value = await ensurePlayerApi();
  }

  return { player, loadPlayer, ensurePlayer };
}
