import { createRouter, createWebHistory } from 'vue-router';
import GameView from '@/views/GameView.vue';
import HomeView from '@/views/HomeView.vue';
import { useAuth } from '@/composables/useAuth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
    },
    {
      path: '/admin',
      name: 'admin',
      // Laddas först när någon går till /admin, så spelare slipper hämta adminkoden
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAdmin: true },
    },
  ],
});

// Skickar alla som inte är admin till startsidan. Det här är bara för att visa rätt sida,
// den riktiga spärren är requireAdmin i backend
router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) {
    return true;
  }

  const { player, isAdmin, loadPlayer } = useAuth();

  // Vid sidladdning direkt på /admin är spelaren inte hämtad än
  if (!player.value) {
    await loadPlayer();
  }

  if (!isAdmin.value) {
    return { name: 'home' };
  }
  return true;
});

export default router;
