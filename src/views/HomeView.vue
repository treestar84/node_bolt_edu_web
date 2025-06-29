<template>
  <div class="home-view">
    <Navigation />
    
    <main class="main-content">
      <div class="container">
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title fade-in">
              {{ authStore.siteName }}에 오신 것을 환영합니다! 🌟
            </h1>
            <p class="hero-description fade-in">
              {{ authStore.childAge }}세 {{ authStore.userProfile?.username }}님을 위한 맞춤형 학습 콘텐츠
            </p>
            
            <div class="hero-actions fade-in">
              <router-link to="/words" class="btn btn-primary btn-lg">
                <span>📚</span>
                단어 학습하기
              </router-link>
              <router-link to="/quiz" class="btn btn-secondary btn-lg">
                <span>🧩</span>
                퀴즈 놀이
              </router-link>
            </div>
          </div>
          
          <div class="hero-image fade-in">
            <div class="main-image-container">
              <img 
                :src="heroImageUrl" 
                :alt="authStore.siteName"
                class="main-image"
              />
            </div>
            <div class="floating-card">
              <img src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Learning" />
            </div>
            <div class="floating-card delay-1">
              <img src="https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Cat" />
            </div>
          </div>
        </section>

        <section class="features-section">
          <h2 class="section-title">{{ authStore.childAge }}세 맞춤 학습 모드</h2>
          
          <div class="features-grid">
            <div class="feature-card" v-for="feature in features" :key="feature.path">
              <router-link :to="feature.path" class="feature-link">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
                <div class="feature-stats">
                  <span class="stat">{{ feature.count }}개 콘텐츠</span>
                </div>
              </router-link>
            </div>
          </div>
        </section>

        <section class="stats-section">
          <div class="stats-grid" v-if="authStore.userProgress">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-value">{{ contentStore.words.length }}</div>
              <div class="stat-label">학습 단어</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div class="stat-value">{{ contentStore.books.length }}</div>
              <div class="stat-label">그림책</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-value">{{ authStore.userProgress.quizScore }}</div>
              <div class="stat-label">퀴즈 점수</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🧩</div>
              <div class="stat-value">{{ authStore.userProgress.puzzleCompletions }}</div>
              <div class="stat-label">퍼즐 완성</div>
            </div>
          </div>
        </section>

        <!-- Badge Display -->
        <BadgeDisplay />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Navigation from '@/components/Navigation.vue';
import BadgeDisplay from '@/components/BadgeDisplay.vue';
import { useAuthStore } from '@/stores/auth';
import { useContentStore } from '@/stores/content';
import { useFileUpload } from '@/composables/useFileUpload';

const authStore = useAuthStore();
const contentStore = useContentStore();
const { getUploadedFileUrl } = useFileUpload();

const heroImageUrl = computed(() => {
  if (authStore.mainImageUrl) {
    if (authStore.mainImageUrl.startsWith('/uploads/')) {
      return getUploadedFileUrl(authStore.mainImageUrl.replace('/uploads/', '')) || authStore.mainImageUrl;
    }
    return authStore.mainImageUrl;
  }
  // Default hero image
  return 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600';
});

const features = computed(() => [
  {
    icon: '📚',
    title: '단어 학습',
    description: '이미지를 누르면 음성과 함께 단어를 배워요',
    path: '/words',
    count: contentStore.words.length
  },
  {
    icon: '🧩',
    title: '퀴즈 게임',
    description: '음성을 듣고 정답을 찾는 재미있는 퀴즈',
    path: '/quiz',
    count: Math.floor(contentStore.words.length / 3)
  },
  {
    icon: '🧩',
    title: '퍼즐 맞추기',
    description: '이미지 조각을 맞춰서 완성하는 퍼즐 게임',
    path: '/puzzle',
    count: contentStore.words.length
  },
  {
    icon: '📖',
    title: '그림책',
    description: '재미있는 그림책 읽기',
    path: '/books',
    count: contentStore.books.length
  }
]);
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.main-content {
  flex: 1;
}

.hero-section {
  padding: var(--spacing-3xl) 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  align-items: center;
  min-height: 60vh;
}

.hero-content {
  z-index: 2;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation-delay: 0.2s;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.6;
  animation-delay: 0.4s;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-lg);
  animation-delay: 0.6s;
}

.hero-image {
  position: relative;
  height: 400px;
  animation-delay: 0.8s;
}

.main-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  z-index: 2;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.floating-card {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: float 3s ease-in-out infinite;
}

.floating-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.floating-card:nth-child(2) {
  top: 20%;
  right: 20%;
  animation-delay: 0s;
}

.floating-card:nth-child(3) {
  top: 60%;
  right: 60%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

.features-section {
  padding: var(--spacing-3xl) 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: var(--spacing-2xl);
  color: var(--color-text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-2xl);
}

.feature-card {
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-link {
  display: block;
  text-decoration: none;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
}

.feature-link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.feature-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.feature-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.stat {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.stats-section {
  padding: var(--spacing-2xl) 0;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  margin: var(--spacing-2xl) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-xl);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-xl);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    text-align: center;
    padding: var(--spacing-2xl) 0;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-image {
    height: 250px;
    order: -1;
  }
  
  .main-image-container {
    width: 200px;
    height: 200px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .floating-card {
    width: 80px;
    height: 80px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .feature-link {
    padding: var(--spacing-xl);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .stat-card {
    padding: var(--spacing-md);
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>