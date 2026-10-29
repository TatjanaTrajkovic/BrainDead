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
      // fullPage: egen layout utan spelets logga (App.vue). Barnens meta slås ihop med denna,
      // så requiresAdmin gäller även flikarna
      meta: { requiresAdmin: true, fullPage: true },
      // /admin öppnar första fliken. Flikarna är egna routes, så en omladdning stannar på rätt flik
      redirect: { name: 'admin-questions' },
      children: [
        // Listan och formuläret är syskon under questions, så fliken Frågor är markerad även
        // när en fråga redigeras. Föräldern har ingen komponent och renderar bara barnen
        {
          path: 'questions',
          children: [
            {
              path: '',
              name: 'admin-questions',
              component: () => import('@/components/admin/QuestionList.vue'),
            },
            {
              path: 'new',
              name: 'admin-question-new',
              component: () => import('@/components/admin/QuestionForm.vue'),
            },
            {
              // Id:t i URL:en gör att en omladdning stannar på samma fråga
              path: ':questionId/edit',
              name: 'admin-question-edit',
              component: () => import('@/components/admin/QuestionForm.vue'),
            },
          ],
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/components/admin/UserList.vue'),
        },
        {
          path: 'stats',
          name: 'admin-stats',
          component: () => import('@/components/admin/StatsTable.vue'),
        },
      ],
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
