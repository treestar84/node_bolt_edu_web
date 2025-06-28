<template>
  <nav class="navigation">
    <div class="container">
      <div class="nav-content">
        <router-link to="/" class="nav-brand">
          <span class="brand-icon">🎓</span>
          <span class="brand-text">유아학습</span>
        </router-link>
        
        <div class="nav-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path" 
            class="nav-item"
            :class="{ active: $route.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </div>

        <div class="nav-controls">
          <div class="language-toggle">
            <button 
              @click="toggleLanguage"
              class="btn btn-secondary btn-sm"
              :class="{ active: store.currentLanguage === 'ko' }"
            >
              한글
            </button>
            <button 
              @click="toggleLanguage"
              class="btn btn-secondary btn-sm"
              :class="{ active: store.currentLanguage === 'en' }"
            >
              ENG
            </button>
          </div>
          
          <router-link to="/admin" class="btn btn-sm btn-secondary">
            관리자
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

const store = useAppStore();

const menuItems = computed(() => [
  { name: '단어학습', path: '/words', icon: '📚' },
  { name: '퀴즈', path: '/quiz', icon: '❓' },
  { name: '퍼즐', path: '/puzzle', icon: '🧩' },
  { name: '책읽기', path: '/books', icon: '📖' }
]);

const toggleLanguage = () => {
  store.setLanguage(store.currentLanguage === 'ko' ? 'en' : 'ko');
};
</script>

<style scoped>
.navigation {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-md) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
  justify-content: center;
}

.nav-item:hover,
.nav-item.active {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.language-toggle {
  display: flex;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}

.language-toggle .btn {
  border: none;
  background: transparent;
  min-height: 36px;
  padding: var(--spacing-sm) var(--spacing-md);
}

.language-toggle .btn.active {
  background: var(--color-primary);
  color: white;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .nav-menu {
    order: 2;
    width: 100%;
  }
  
  .nav-controls {
    order: 1;
  }
  
  .nav-item {
    flex: 1;
    min-width: auto;
  }
  
  .nav-text {
    font-size: 0.875rem;
  }
}
</style>