import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '@/stores/app';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/words',
    name: 'Words',
    component: () => import('@/views/WordsView.vue')
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('@/views/QuizView.vue')
  },
  {
    path: '/puzzle',
    name: 'Puzzle',
    component: () => import('@/views/PuzzleView.vue')
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('@/views/BooksView.vue')
  },
  {
    path: '/book/:id',
    name: 'BookReader',
    component: () => import('@/views/BookReaderView.vue')
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
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/words',
    name: 'AdminWords',
    component: () => import('@/views/admin/AdminWordsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/books',
    name: 'AdminBooks',
    component: () => import('@/views/admin/AdminBooksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/badges',
    name: 'AdminBadges',
    component: () => import('@/views/admin/AdminBadgesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/api-keys',
    name: 'AdminApiKeys',
    component: () => import('@/views/admin/AdminApiKeysView.vue'),
    meta: { requiresAuth: true }
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

router.beforeEach(async (to, _, next) => {
  const store = useAppStore();
  
  if (to.meta.requiresAuth) {
    // Try to verify existing token
    const isValid = await store.verifyAdminToken();
    
    if (!isValid) {
      next('/admin');
      return;
    }
  }
  
  next();
});

export default router;