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
            <label for="username" class="form-label">아이디</label>
            <input
              id="username"
              type="text"
              v-model="formData.username"
              class="form-input"
              placeholder="아이디를 입력하세요"
              required
            />
            <div class="form-hint">
              영문, 숫자, 언더스코어(_) 사용 가능 (3-20자)
            </div>
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
            <div class="form-hint">
              최소 6자 이상
            </div>
          </div>

          <div v-if="isRegister" class="register-fields">
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
          
          <div class="demo-accounts">
            <h4>테스트 계정</h4>
            <div class="demo-buttons">
              <button 
                @click="fillDemoAccount('parent')" 
                class="demo-btn"
                type="button"
              >
                엄마 계정
              </button>
              <button 
                @click="fillDemoAccount('teacher')" 
                class="demo-btn"
                type="button"
              >
                선생님 계정
              </button>
            </div>
          </div>
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
  username: '',
  password: '',
  userType: '',
  childAge: 4
});

const handleSubmit = async () => {
  let success = false;

  if (isRegister.value) {
    success = await authStore.register(
      formData.username,
      formData.password,
      formData.userType as any,
      formData.childAge
    );
  } else {
    success = await authStore.login(formData.username, formData.password);
  }

  if (success) {
    router.push('/');
  }
};

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  authStore.error = '';
  resetForm();
};

const resetForm = () => {
  formData.username = '';
  formData.password = '';
  formData.userType = '';
  formData.childAge = 4;
};

const fillDemoAccount = (type: 'parent' | 'teacher') => {
  if (type === 'parent') {
    formData.username = 'demo_mom';
    formData.password = '123456';
    if (isRegister.value) {
      formData.userType = 'parent';
      formData.childAge = 4;
    }
  } else {
    formData.username = 'demo_teacher';
    formData.password = '123456';
    if (isRegister.value) {
      formData.userType = 'teacher';
      formData.childAge = 5;
    }
  }
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

.form-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
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
  margin-bottom: var(--spacing-lg);
}

.toggle-button:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.demo-accounts {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.demo-accounts h4 {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-weight: 500;
}

.demo-buttons {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.demo-btn {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
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
  
  .demo-buttons {
    flex-direction: column;
  }
}
</style>