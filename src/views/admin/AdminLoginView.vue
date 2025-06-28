<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>관리자 로그인</h1>
          <p>콘텐츠 관리를 위해 로그인해주세요</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="password" class="form-label">비밀번호</label>
            <input
              id="password"
              type="password"
              v-model="password"
              class="form-input"
              placeholder="관리자 비밀번호를 입력하세요"
              required
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="isLoading">
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="login-info">
          <p class="info-text">
            <strong>기본 비밀번호:</strong> admin123
          </p>
          <router-link to="/" class="back-link">
            ← 메인 페이지로 돌아가기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const store = useAppStore();

const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  
  try {
    const success = await store.adminLogin(password.value);
    
    if (success) {
      router.push('/admin/dashboard');
    } else {
      errorMessage.value = '비밀번호가 올바르지 않습니다.';
      password.value = '';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
    password.value = '';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // If already logged in, redirect to dashboard
  if (store.isAdminLoggedIn) {
    router.push('/admin/dashboard');
  }
});
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.login-header p {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.login-form {
  margin-bottom: var(--spacing-xl);
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

.login-info {
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.info-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .admin-login {
    padding: var(--spacing-md);
  }
  
  .login-card {
    padding: var(--spacing-xl);
  }
  
  .login-header h1 {
    font-size: 1.75rem;
  }
}
</style>