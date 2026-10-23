import { ref } from 'vue';
import {
  ensurePlayer as ensurePlayerApi,
  getMe,
  login as loginApi,
  logout as logoutApi,
  signup as signupApi,
} from '../api/gameApi';

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

  async function signup(username, password) {
    player.value = await signupApi(username, password);
  }

  async function login(username, password) {
    player.value = await loginApi(username, password);
  }

  // player blir null även om anropet misslyckas, t.ex. om nyckeln redan slutat gälla.
  async function logout() {
    try {
      await logoutApi();
    } finally {
      player.value = null;
    }
  }

  return { player, loadPlayer, ensurePlayer, signup, login, logout };
}
