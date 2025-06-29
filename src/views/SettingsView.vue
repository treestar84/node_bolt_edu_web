<template>
  <div class="settings-view">
    <Navigation />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">설정</h1>
          <p class="page-description">
            개인 맞춤 설정을 변경하세요
          </p>
        </div>

        <div class="settings-container">
          <div class="settings-card">
            <div class="card-header">
              <h2>기본 정보</h2>
            </div>
            
            <form @submit.prevent="saveSettings" class="settings-form">
              <div class="form-group">
                <label class="form-label">사용자명</label>
                <input 
                  v-model="formData.username" 
                  type="text" 
                  class="form-input" 
                  placeholder="사용자명을 입력하세요"
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">사용자 유형</label>
                <select v-model="formData.userType" class="form-input" required>
                  <option value="parent">엄마 (일반 사용자)</option>
                  <option value="teacher">어린이집 선생님</option>
                  <option value="director">원장</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">사이트 이름</label>
                <input 
                  v-model="formData.siteName" 
                  type="text" 
                  class="form-input" 
                  placeholder="사이트 이름을 입력하세요"
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">자녀 나이</label>
                <select v-model.number="formData.childAge" class="form-input" required>
                  <option value="3">3세</option>
                  <option value="4">4세</option>
                  <option value="5">5세</option>
                  <option value="6">6세</option>
                </select>
                <div class="form-hint">
                  나이에 맞는 콘텐츠가 자동으로 필터링됩니다
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">메인 이미지</label>
                <FileUploadInput
                  v-model="formData.mainImageUrl"
                  label="메인 이미지"
                  placeholder="https://example.com/image.jpg"
                  file-type="image"
                  :required="false"
                />
                <div class="form-hint">
                  홈 화면에 표시될 대표 이미지를 설정하세요
                </div>
              </div>

              <div v-if="authStore.error" class="error-message">
                {{ authStore.error }}
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="authStore.isLoading"
                >
                  {{ authStore.isLoading ? '저장 중...' : '설정 저장' }}
                </button>
                
                <button 
                  type="button" 
                  @click="resetForm"
                  class="btn btn-secondary"
                >
                  취소
                </button>
              </div>
            </form>
          </div>

          <div class="settings-card">
            <div class="card-header">
              <h2>학습 통계</h2>
            </div>
            
            <div class="stats-grid" v-if="authStore.userProgress">
              <div class="stat-item">
                <div class="stat-icon">🧩</div>
                <div class="stat-content">
                  <div class="stat-value">{{ authStore.userProgress.quizScore }}</div>
                  <div class="stat-label">퀴즈 점수</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                  <div class="stat-value">{{ authStore.userProgress.quizStreak }}</div>
                  <div class="stat-label">연속 정답</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">🧩</div>
                <div class="stat-content">
                  <div class="stat-value">{{ authStore.userProgress.puzzleCompletions }}</div>
                  <div class="stat-label">퍼즐 완성</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                  <div class="stat-value">{{ authStore.userProgress.wordsLearned }}</div>
                  <div class="stat-label">학습한 단어</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">📖</div>
                <div class="stat-content">
                  <div class="stat-value">{{ authStore.userProgress.booksRead }}</div>
                  <div class="stat-label">읽은 책</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">🏆</div>
                <div class="stat-content">
                  <div class="stat-value">{{ contentStore.availableBadges.length }}</div>
                  <div class="stat-label">획득 뱃지</div>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header">
              <h2>계정 관리</h2>
            </div>
            
            <div class="account-actions">
              <button @click="handleLogout" class="btn btn-danger">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navigation from '@/components/Navigation.vue';
import FileUploadInput from '@/components/FileUploadInput.vue';
import { useAuthStore } from '@/stores/auth';
import { useContentStore } from '@/stores/content';

const router = useRouter();
const authStore = useAuthStore();
const contentStore = useContentStore();

const formData = reactive({
  username: '',
  userType: 'parent' as 'parent' | 'teacher' | 'director',
  siteName: '',
  childAge: 4,
  mainImageUrl: ''
});

const loadCurrentSettings = () => {
  if (authStore.userProfile) {
    formData.username = authStore.userProfile.username;
    formData.userType = authStore.userProfile.userType;
    formData.siteName = authStore.userProfile.siteName;
    formData.childAge = authStore.userProfile.childAge;
    formData.mainImageUrl = authStore.userProfile.mainImageUrl || '';
  }
};

const saveSettings = async () => {
  const success = await authStore.updateSettings({
    username: formData.username,
    userType: formData.userType,
    siteName: formData.siteName,
    childAge: formData.childAge,
    mainImageUrl: formData.mainImageUrl || undefined
  });

  if (success) {
    // Reload content with new age filter
    await contentStore.loadContent();
    router.push('/');
  }
};

const resetForm = () => {
  loadCurrentSettings();
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  loadCurrentSettings();
});
</script>

<style scoped>
.settings-view {
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

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.settings-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.settings-form {
  padding: var(--spacing-xl);
}

.form-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-top: var(--spacing-xs);
}

.account-actions {
  padding: var(--spacing-xl);
}

@media (max-width: 768px) {
  .settings-container {
    margin: 0 var(--spacing-md);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}
</style>