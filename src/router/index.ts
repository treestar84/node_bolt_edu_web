import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/words',
    name: 'Words',
    component: () => import('@/views/WordsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('@/views/QuizView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/puzzle',
    name: 'Puzzle',
    component: () => import('@/views/PuzzleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('@/views/BooksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/book/:id',
    name: 'BookReader',
    component: () => import('@/views/BookReaderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLoginView.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAdminAuth: true }
  },
  {
    path: '/admin/words',
    name: 'AdminWords',
    component: () => import('@/views/admin/AdminWordsView.vue'),
    meta: { requiresAdminAuth: true }
  },
  {
    path: '/admin/books',
    name: 'AdminBooks',
    component: () => import('@/views/admin/AdminBooksView.vue'),
    meta: { requiresAdminAuth: true }
  },
  {
    path: '/admin/badges',
    name: 'AdminBadges',
    component: () => import('@/views/admin/AdminBadgesView.vue'),
    meta: { requiresAdminAuth: true }
  },
  {
    path: '/admin/api-keys',
    name: 'AdminApiKeys',
    component: () => import('@/views/admin/AdminApiKeysView.vue'),
    meta: { requiresAdminAuth: true }
  },
  {
    path: '/api-guide',
    name: 'ApiGuide',
    component: () => import('@/views/ApiGuideView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth if not already done
  if (!authStore.user && !authStore.isLoading) {
    await authStore.initialize();
  }
  
  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
    return;
  }
  
  // Admin routes still use the old system
  if (to.meta.requiresAdminAuth) {
    const { useAppStore } = await import('@/stores/app');
    const appStore = useAppStore();
    const isValid = await appStore.verifyAdminToken();
    
    if (!isValid) {
      next('/admin');
      return;
    }
  }
  
  next();
});

export default router;