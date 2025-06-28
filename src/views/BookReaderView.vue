<template>
  <div class="book-reader">
    <div class="reader-header">
      <button @click="goBack" class="btn btn-secondary">
        ← 뒤로가기
      </button>
      <h1 class="book-title">{{ book?.title }}</h1>
      <div class="page-indicator">
        {{ currentPageIndex + 1 }} / {{ book?.pages.length }}
      </div>
    </div>

    <div v-if="book" class="reader-content">
      <div class="book-container">
        <div class="book-page">
          <div class="page-image">
            <img :src="getImageUrl(currentPage?.imageUrl || '')" :alt="`페이지 ${currentPageIndex + 1}`" />
            <div class="page-text" v-if="currentPage?.text">
              {{ currentPage.text }}
            </div>
          </div>
          
          <div class="page-controls">
            <button 
              @click="playPageAudio" 
              class="audio-button"
              :class="{ playing: isPlaying }"
            >
              <span class="audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</span>
              <span>음성 듣기</span>
            </button>
            
            <div class="auto-play-controls">
              <label class="auto-play-toggle">
                <input 
                  type="checkbox" 
                  v-model="autoPlayEnabled"
                  @change="toggleAutoPlay"
                />
                <span class="toggle-text">자동 넘김</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="navigation-controls">
        <button 
          @click="previousPage" 
          :disabled="currentPageIndex === 0"
          class="btn btn-lg btn-secondary"
        >
          ← 이전
        </button>
        
        <div class="page-dots">
          <button 
            v-for="(page, index) in book.pages" 
            :key="page.id"
            @click="goToPage(index)"
            class="page-dot"
            :class="{ active: index === currentPageIndex }"
          >
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPageIndex === book.pages.length - 1"
          class="btn btn-lg btn-secondary"
        >
          다음 →
        </button>
      </div>

      <!-- Auto-play progress indicator -->
      <div v-if="autoPlayEnabled && autoPlayProgress > 0" class="auto-play-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${autoPlayProgress}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ Math.ceil((100 - autoPlayProgress) / 100 * autoPlayDelay / 1000) }}초 후 다음 페이지
        </div>
      </div>
    </div>

    <div v-else class="book-not-found">
      <div class="error-icon">📖</div>
      <h2>책을 찾을 수 없습니다</h2>
      <p>요청하신 그림책이 존재하지 않습니다</p>
      <router-link to="/books" class="btn btn-primary">
        그림책 목록으로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { useAudio } from '@/composables/useAudio';
import { useFileUpload } from '@/composables/useFileUpload';

const route = useRoute();
const router = useRouter();
const store = useAppStore();
const { isPlaying, playAudio } = useAudio();
const { getUploadedFileUrl } = useFileUpload();

const currentPageIndex = ref(0);
const autoPlayEnabled = ref(true);
const autoPlayProgress = ref(0);
const autoPlayDelay = ref(7000); // 7 seconds default delay
const autoPlayTimer = ref<NodeJS.Timeout | null>(null);
const progressTimer = ref<NodeJS.Timeout | null>(null);

const book = computed(() => {
  const bookId = route.params.id as string;
  return store.currentBooks.find(b => b.id === bookId);
});

const currentPage = computed(() => {
  if (!book.value) return null;
  return book.value.pages[currentPageIndex.value];
});

const getImageUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const getAudioUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const goBack = () => {
  router.push('/books');
};

const previousPage = () => {
  if (currentPageIndex.value > 0) {
    clearAutoPlayTimers();
    currentPageIndex.value--;
  }
};

const nextPage = () => {
  if (book.value && currentPageIndex.value < book.value.pages.length - 1) {
    clearAutoPlayTimers();
    currentPageIndex.value++;
  }
};

const goToPage = (index: number) => {
  clearAutoPlayTimers();
  currentPageIndex.value = index;
};

const playPageAudio = async () => {
  if (currentPage.value) {
    try {
      const audioUrl = getAudioUrl(currentPage.value.audio);
      const duration = await playAudio(audioUrl);
      
      if (autoPlayEnabled.value) {
        // Calculate delay: audio duration + 5-7 seconds
        const additionalDelay = Math.random() * 2000 + 5000; // 5-7 seconds
        autoPlayDelay.value = (duration * 1000) + additionalDelay;
        startAutoPlayTimer();
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
      if (autoPlayEnabled.value) {
        // Use default delay if audio fails
        autoPlayDelay.value = 7000;
        startAutoPlayTimer();
      }
    }
  }
};

const startAutoPlayTimer = () => {
  if (!autoPlayEnabled.value || !book.value) return;
  
  clearAutoPlayTimers();
  autoPlayProgress.value = 0;
  
  // Progress animation
  const progressInterval = 50; // Update every 50ms
  const progressStep = (progressInterval / autoPlayDelay.value) * 100;
  
  progressTimer.value = setInterval(() => {
    autoPlayProgress.value += progressStep;
    if (autoPlayProgress.value >= 100) {
      clearInterval(progressTimer.value!);
    }
  }, progressInterval);
  
  // Auto advance to next page
  autoPlayTimer.value = setTimeout(() => {
    if (currentPageIndex.value < book.value!.pages.length - 1) {
      currentPageIndex.value++;
    } else {
      // End of book, stop auto-play
      autoPlayEnabled.value = false;
      autoPlayProgress.value = 0;
    }
  }, autoPlayDelay.value);
};

const clearAutoPlayTimers = () => {
  if (autoPlayTimer.value) {
    clearTimeout(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
  if (progressTimer.value) {
    clearInterval(progressTimer.value);
    progressTimer.value = null;
  }
  autoPlayProgress.value = 0;
};

const toggleAutoPlay = () => {
  if (!autoPlayEnabled.value) {
    clearAutoPlayTimers();
  }
};

// Watch for page changes
watch(currentPageIndex, () => {
  clearAutoPlayTimers();
  setTimeout(() => {
    playPageAudio();
  }, 500);
});

onMounted(() => {
  // Auto-play first page audio
  setTimeout(() => {
    playPageAudio();
  }, 1000);
});

onUnmounted(() => {
  clearAutoPlayTimers();
});
</script>

<style scoped>
.book-reader {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  display: flex;
  flex-direction: column;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.book-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  flex: 1;
  margin: 0 var(--spacing-lg);
}

.page-indicator {
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  background: var(--color-bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}

.reader-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-2xl);
}

.book-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  width: 100%;
}

.book-page {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
}

.page-image {
  position: relative;
  width: 100%;
  height: 500px;
}

.page-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg);
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
}

.page-controls {
  padding: var(--spacing-xl);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.audio-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  margin: 0 auto;
}

.audio-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.audio-button.playing {
  animation: pulse 1s infinite;
}

.audio-icon {
  font-size: 1.5rem;
}

.auto-play-controls {
  display: flex;
  justify-content: center;
}

.auto-play-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.auto-play-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 600px;
  justify-content: space-between;
}

.page-dots {
  display: flex;
  gap: var(--spacing-sm);
}

.page-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-dot.active {
  background: var(--color-primary);
  transform: scale(1.2);
}

.page-dot:hover {
  background: var(--color-primary);
  opacity: 0.7;
}

.auto-play-progress {
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  min-width: 250px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.05s linear;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.book-not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-3xl);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.book-not-found h2 {
  font-size: 1.75rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.book-not-found p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .reader-header {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  .book-title {
    font-size: 1.25rem;
    margin: 0;
  }
  
  .reader-content {
    padding: var(--spacing-md);
    gap: var(--spacing-lg);
  }
  
  .page-image {
    height: 350px;
  }
  
  .page-text {
    font-size: 1.125rem;
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
  }
  
  .navigation-controls {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .navigation-controls > .btn {
    width: 100%;
    max-width: 200px;
  }
  
  .audio-button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 1rem;
  }
  
  .auto-play-progress {
    bottom: var(--spacing-md);
    left: var(--spacing-md);
    right: var(--spacing-md);
    transform: none;
    min-width: auto;
  }
}
</style>