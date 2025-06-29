import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './style.css';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize auth store
import { useAuthStore } from '@/stores/auth';
import { useContentStore } from '@/stores/content';

const initializeApp = async () => {
  const authStore = useAuthStore();
  const contentStore = useContentStore();
  
  // Initialize authentication
  await authStore.initialize();
  
  // Load content if user is authenticated
  if (authStore.isAuthenticated) {
    await contentStore.loadContent();
  }
};

initializeApp().then(() => {
  app.mount('#app');
});