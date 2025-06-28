<template>
  <div class="admin-api-keys">
    <AdminHeader />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">API 키 관리</h1>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <span>🔑</span>
            새 API 키 생성
          </button>
        </div>

        <div class="api-keys-overview">
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-icon">🔑</div>
              <div class="stat-content">
                <div class="stat-value">{{ store.apiKeys.length }}</div>
                <div class="stat-label">총 API 키</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ activeKeysCount }}</div>
                <div class="stat-label">활성 키</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalUsageCount }}</div>
                <div class="stat-label">총 사용 횟수</div>
              </div>
            </div>
          </div>
        </div>

        <div class="api-keys-table-container">
          <div v-if="store.apiKeys.length === 0" class="empty-state">
            <div class="empty-icon">🔑</div>
            <h3>생성된 API 키가 없습니다</h3>
            <p>첫 번째 API 키를 생성해보세요</p>
          </div>

          <div v-else class="api-keys-table">
            <div class="table-header">
              <div class="header-cell">이름</div>
              <div class="header-cell">키 미리보기</div>
              <div class="header-cell">생성일</div>
              <div class="header-cell">마지막 사용</div>
              <div class="header-cell">사용 횟수</div>
              <div class="header-cell">상태</div>
              <div class="header-cell">작업</div>
            </div>
            
            <div 
              v-for="apiKey in store.apiKeys" 
              :key="apiKey.id"
              class="table-row"
            >
              <div class="cell name-cell">
                <div class="key-name">{{ apiKey.name }}</div>
                <div class="key-description" v-if="apiKey.description">{{ apiKey.description }}</div>
              </div>
              <div class="cell key-cell">
                <code class="key-preview">{{ apiKey.keyPreview }}</code>
              </div>
              <div class="cell date-cell">
                <span class="date-text">{{ formatDate(apiKey.createdAt) }}</span>
              </div>
              <div class="cell date-cell">
                <span class="date-text">{{ apiKey.lastUsed ? formatDate(apiKey.lastUsed) : '사용 안함' }}</span>
              </div>
              <div class="cell usage-cell">
                <span class="usage-count">{{ apiKey.usageCount || 0 }}</span>
              </div>
              <div class="cell status-cell">
                <span class="status-badge" :class="{ active: apiKey.active }">
                  {{ apiKey.active ? '활성' : '비활성' }}
                </span>
              </div>
              <div class="cell actions-cell">
                <button @click="deleteKeyConfirm(apiKey)" class="btn btn-sm btn-danger">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create API Key Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>새 API 키 생성</h2>
          <button @click="closeCreateModal" class="modal-close">×</button>
        </div>
        
        <form @submit.prevent="createKey" class="modal-form">
          <div class="form-group">
            <label class="form-label">API 키 이름 *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              class="form-input" 
              placeholder="예: N8n 워크플로우"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">설명 (선택사항)</label>
            <textarea 
              v-model="formData.description" 
              class="form-input textarea"
              placeholder="이 API 키의 용도를 설명해주세요"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">
              취소
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isCreating">
              {{ isCreating ? '생성 중...' : 'API 키 생성' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Show Created Key Modal -->
    <div v-if="showKeyModal && createdKey" class="modal-overlay" @click="closeKeyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>API 키가 생성되었습니다!</h2>
          <button @click="closeKeyModal" class="modal-close">×</button>
        </div>
        
        <div class="key-display">
          <div class="warning-message">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <strong>중요:</strong> 이 키는 다시 표시되지 않습니다. 안전한 곳에 저장해주세요!
            </div>
          </div>

          <div class="key-info">
            <div class="key-field">
              <label>이름:</label>
              <span>{{ createdKey.name }}</span>
            </div>
            <div class="key-field">
              <label>API 키:</label>
              <div class="key-value-container">
                <code class="key-value">{{ createdKey.key }}</code>
                <button @click="copyKey" class="btn btn-sm btn-secondary copy-btn">
                  {{ copied ? '복사됨!' : '복사' }}
                </button>
              </div>
            </div>
          </div>

          <div class="usage-instructions">
            <h4>사용 방법:</h4>
            <p>HTTP 요청 헤더에 다음과 같이 추가하세요:</p>
            <code class="usage-example">X-API-Key: {{ createdKey.key }}</code>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeKeyModal" class="btn btn-primary">
            확인
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>API 키 삭제</h2>
          <button @click="showDeleteModal = false" class="modal-close">×</button>
        </div>
        
        <div class="delete-content">
          <p>정말로 "<strong>{{ keyToDelete?.name }}</strong>" API 키를 삭제하시겠습니까?</p>
          <p class="delete-warning">이 작업은 되돌릴 수 없으며, 이 키를 사용하는 모든 요청이 실패합니다.</p>
        </div>

        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            취소
          </button>
          <button @click="confirmDelete" class="btn btn-danger">
            삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import AdminHeader from '@/components/AdminHeader.vue';
import { useAppStore } from '@/stores/app';
import type { ApiKey } from '@/types';

const store = useAppStore();

const showCreateModal = ref(false);
const showKeyModal = ref(false);
const showDeleteModal = ref(false);
const isCreating = ref(false);
const createdKey = ref<ApiKey | null>(null);
const keyToDelete = ref<ApiKey | null>(null);
const copied = ref(false);

const formData = reactive({
  name: '',
  description: ''
});

const activeKeysCount = computed(() => {
  return store.apiKeys.filter(key => key.active).length;
});

const totalUsageCount = computed(() => {
  return store.apiKeys.reduce((total, key) => total + (key.usageCount || 0), 0);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  formData.name = '';
  formData.description = '';
};

const closeKeyModal = () => {
  showKeyModal.value = false;
  createdKey.value = null;
  copied.value = false;
};

const createKey = async () => {
  if (!formData.name.trim()) return;
  
  isCreating.value = true;
  
  try {
    const newKey = await store.createApiKey(formData.name.trim(), formData.description.trim());
    
    if (newKey) {
      createdKey.value = newKey;
      showCreateModal.value = false;
      showKeyModal.value = true;
      formData.name = '';
      formData.description = '';
    }
  } catch (error) {
    console.error('Error creating API key:', error);
  } finally {
    isCreating.value = false;
  }
};

const copyKey = async () => {
  if (!createdKey.value) return;
  
  try {
    await navigator.clipboard.writeText(createdKey.value.key);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy key:', error);
  }
};

const deleteKeyConfirm = (apiKey: ApiKey) => {
  keyToDelete.value = apiKey;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!keyToDelete.value) return;
  
  const success = await store.deleteApiKey(keyToDelete.value.id);
  
  if (success) {
    showDeleteModal.value = false;
    keyToDelete.value = null;
  }
};

onMounted(() => {
  store.fetchApiKeys();
});
</script>

<style scoped>
.admin-api-keys {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.main-content {
  padding: var(--spacing-2xl) 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.api-keys-overview {
  margin-bottom: var(--spacing-2xl);
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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

.api-keys-table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
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
}

.api-keys-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 80px 80px 100px;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.header-cell {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 80px 80px 100px;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--color-bg-hover);
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  display: flex;
  align-items: center;
}

.key-name {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.key-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.key-preview {
  background: var(--color-bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--color-text-primary);
}

.date-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.usage-count {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--color-success);
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.modal-form {
  padding: var(--spacing-xl);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.key-display {
  padding: var(--spacing-xl);
}

.warning-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-text {
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.key-info {
  margin-bottom: var(--spacing-xl);
}

.key-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.key-field label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.key-value-container {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.key-value {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  word-break: break-all;
  flex: 1;
  border: 1px solid var(--color-border);
}

.copy-btn {
  flex-shrink: 0;
}

.usage-instructions {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.usage-instructions h4 {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.usage-instructions p {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
}

.usage-example {
  display: block;
  background: var(--color-bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.delete-content {
  padding: var(--spacing-xl);
  text-align: center;
}

.delete-content p {
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.delete-warning {
  color: var(--color-danger);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .header-cell {
    display: none;
  }
  
  .table-row {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);
    background: var(--color-bg-secondary);
  }
  
  .cell {
    justify-content: space-between;
    padding: var(--spacing-sm) 0;
  }
  
  .modal-content {
    margin: var(--spacing-md);
    max-width: none;
  }
  
  .key-value-container {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>