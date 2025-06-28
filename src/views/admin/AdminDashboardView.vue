<template>
  <div class="admin-dashboard">
    <AdminHeader />
    
    <main class="main-content">
      <div class="container">
        <div class="dashboard-header">
          <h1 class="page-title">관리자 대시보드</h1>
          <p class="page-description">
            유아 학습 앱의 콘텐츠를 관리하고 통계를 확인하세요
          </p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-value">{{ store.currentWords.length }}</div>
              <div class="stat-label">등록된 단어</div>
            </div>
            <router-link to="/admin/words" class="stat-action">
              관리하기 →
            </router-link>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📖</div>
            <div class="stat-content">
              <div class="stat-value">{{ store.currentBooks.length }}</div>
              <div class="stat-label">등록된 책</div>
            </div>
            <router-link to="/admin/books" class="stat-action">
              관리하기 →
            </router-link>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-value">{{ store.quizScore }}</div>
              <div class="stat-label">총 퀴즈 점수</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">{{ store.quizStreak }}</div>
              <div class="stat-label">현재 연속 정답</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🏅</div>
            <div class="stat-content">
              <div class="stat-value">{{ store.availableBadges.length }}</div>
              <div class="stat-label">획득한 뱃지</div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h2 class="section-title">빠른 작업</h2>
          <div class="actions-grid">
            <router-link to="/admin/words" class="action-card">
              <div class="action-icon">➕</div>
              <h3>단어 추가</h3>
              <p>새로운 학습 단어를 추가하세요</p>
            </router-link>

            <router-link to="/admin/books" class="action-card">
              <div class="action-icon">📖</div>
              <h3>책 추가</h3>
              <p>새로운 그림책을 만들어보세요</p>
            </router-link>

            <router-link to="/" class="action-card">
              <div class="action-icon">👶</div>
              <h3>앱 미리보기</h3>
              <p>사용자 화면을 확인해보세요</p>
            </router-link>
          </div>
        </div>

        <div class="recent-activity">
          <h2 class="section-title">카테고리별 단어 현황</h2>
          <div class="category-stats">
            <div 
              v-for="(words, category) in store.wordsByCategory" 
              :key="category"
              class="category-item"
            >
              <div class="category-name">{{ getCategoryName(category) }}</div>
              <div class="category-count">{{ words.length }}개</div>
              <div class="category-bar">
                <div 
                  class="category-progress" 
                  :style="{ width: `${(words.length / store.currentWords.length) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="badge-overview">
          <h2 class="section-title">뱃지 시스템 현황</h2>
          <div class="badge-stats">
            <div class="badge-progress-card">
              <h3>전체 뱃지 진행률</h3>
              <div class="overall-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${(store.availableBadges.length / store.currentBadges.length) * 100}%` }"
                  ></div>
                </div>
                <div class="progress-text">
                  {{ store.availableBadges.length }} / {{ store.currentBadges.length }} 뱃지 획득
                </div>
              </div>
            </div>
            
            <div class="recent-badges">
              <h3>최근 획득 뱃지</h3>
              <div v-if="store.availableBadges.length > 0" class="badge-list">
                <div 
                  v-for="badge in store.availableBadges.slice(-3)" 
                  :key="badge.id"
                  class="badge-item"
                >
                  <span class="badge-icon">{{ badge.icon }}</span>
                  <span class="badge-name">{{ badge.name }}</span>
                </div>
              </div>
              <div v-else class="no-badges">
                아직 획득한 뱃지가 없습니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminHeader from '@/components/AdminHeader.vue';
import { useAppStore } from '@/stores/app';

const store = useAppStore();

const getCategoryName = (category: string) => {
  const categoryNames: Record<string, string> = {
    'animals': '동물',
    'fruits': '과일',
    'vehicles': '탈것',
    'objects': '사물',
    'nature': '자연',
    'toys': '장난감',
    'clothes': '옷'
  };
  return categoryNames[category] || category;
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.main-content {
  padding: var(--spacing-2xl) 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-light);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-top: var(--spacing-xs);
}

.stat-action {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.stat-action:hover {
  color: var(--color-primary-dark);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
}

.quick-actions {
  margin-bottom: var(--spacing-3xl);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.action-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.action-card p {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.recent-activity {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.category-item {
  display: grid;
  grid-template-columns: 1fr auto 200px;
  gap: var(--spacing-md);
  align-items: center;
}

.category-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.category-count {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.category-bar {
  height: 8px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.category-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
}

.badge-overview {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
}

.badge-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.badge-progress-card h3,
.recent-badges h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.overall-progress {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--color-bg-secondary);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), var(--color-secondary));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.badge-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.badge-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.badge-icon {
  font-size: 1.5rem;
}

.badge-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.no-badges {
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .stat-card {
    padding: var(--spacing-lg);
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .action-card {
    padding: var(--spacing-xl);
  }
  
  .category-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    text-align: center;
  }
  
  .category-bar {
    width: 100%;
  }
  
  .badge-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}
</style>