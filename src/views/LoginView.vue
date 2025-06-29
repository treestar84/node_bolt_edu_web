<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>{{ isRegister ? '회원가입' : '로그인' }}</h1>
          <p>{{ isRegister ? '새 계정을 만들어보세요' : '계정에 로그인하세요' }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">이메일</label>
            <input
              id="email"
              type="email"
              v-model="formData.email"
              class="form-input"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">비밀번호</label>
            <input
              id="password"
              type="password"
              v-model="formData.password"
              class="form-input"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div v-if="isRegister" class="register-fields">
            <div class="form-group">
              <label for="username" class="form-label">사용자명</label>
              <input
                id="username"
                type="text"
                v-model="formData.username"
                class="form-input"
                placeholder="사용자명을 입력하세요"
                required
              />
            </div>

            <div class="form-group">
              <label for="userType" class="form-label">사용자 유형</label>
              <select
                id="userType"
                v-model="formData.userType"
                class="form-input"
                required
              >
                <option value="">선택하세요</option>
                <option value="parent">엄마 (일반 사용자)</option>
                <option value="teacher">어린이집 선생님</option>
                <option value="director">원장</option>
              </select>
            </div>

            <div class="form-group">
              <label for="childAge" class="form-label">자녀 나이</label>
              <select
                id="childAge"
                v-model.number="formData.childAge"
                class="form-input"
                required
              >
                <option value="">선택하세요</option>
                <option value="3">3세</option>
                <option value="4">4세</option>
                <option value="5">5세</option>
                <option value="6">6세</option>
              </select>
            </div>
          </div>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full btn-lg" 
            :disabled="authStore.isLoading"
          >
            {{ authStore.isLoading ? '처리 중...' : (isRegister ? '회원가입' : '로그인') }}
          </button>
        </form>

        <div class="login-footer">
          <button 
            @click="toggleMode" 
            class="toggle-button"
            type="button"
          >
            {{ isRegister ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isRegister = ref(false);

const formData = reactive({
  email: '',
  password: '',
  username: '',
  userType: '',
  childAge: 4
});

const handleSubmit = async () => {
  let success = false;

  if (isRegister.value) {
    success = await authStore.register(
      formData.email,
      formData.password,
      formData.username,
      formData.userType as any,
      formData.childAge
    );
  } else {
    success = await authStore.login(formData.email, formData.password);
  }

  if (success) {
    router.push('/');
  }
};

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  authStore.error = '';
};
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 450px;
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

.register-fields {
  margin-top: var(--spacing-lg);
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

.login-footer {
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.toggle-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.toggle-button:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-view {
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