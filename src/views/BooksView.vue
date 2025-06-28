<template>
  <div class="books-view">
    <Navigation />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">그림책 읽기</h1>
          <p class="page-description">
            재미있는 그림책을 읽으며 새로운 이야기를 만나보세요
          </p>
        </div>

        <div v-if="store.currentBooks.length > 0" class="books-grid">
          <div 
            v-for="book in store.currentBooks" 
            :key="book.id"
            class="book-card fade-in"
            @click="openBook(book.id)"
          >
            <div class="book-cover">
              <img :src="getImageUrl(book.coverImage)" :alt="book.title" />
              <div class="play-overlay">
                <span class="play-icon">📖</span>
                <span class="play-text">읽기</span>
              </div>
            </div>
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <div class="book-meta">
                <span class="page-count">{{ book.pages.length }}장</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📖</div>
          <h3>아직 그림책이 없습니다</h3>
          <p>관리자 페이지에서 새로운 그림책을 추가해보세요</p>
          <router-link to="/admin" class="btn btn-primary">
            관리자 페이지로 이동
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Navigation from '@/components/Navigation.vue';
import { useAppStore } from '@/stores/app';
import { useFileUpload } from '@/composables/useFileUpload';

const store = useAppStore();
const router = useRouter();
const { getUploadedFileUrl } = useFileUpload();

const getImageUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const openBook = (bookId: string) => {
  router.push(`/book/${bookId}`);
};
</script>

<style scoped>
.books-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.main-content {
  padding: var(--spacing-2xl) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.book-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary);
}

.book-cover {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.book-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 2.5rem;
}

.play-text {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.book-info {
  padding: var(--spacing-xl);
  text-align: center;
}

.book-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
}

.book-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.page-count {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .book-cover {
    height: 250px;
  }
  
  .book-info {
    padding: var(--spacing-lg);
  }
  
  .book-title {
    font-size: 1.25rem;
  }
  
  .play-overlay {
    opacity: 1;
    background: rgba(0, 0, 0, 0.6);
  }
  
  .play-icon {
    font-size: 2rem;
  }
  
  .play-text {
    font-size: 1rem;
  }
}
</style>