<template>
  <div class="admin-badges">
    <AdminHeader />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">뱃지 관리</h1>
          <button @click="showAddModal = true" class="btn btn-primary">
            <span>🏆</span>
            새 뱃지 추가
          </button>
        </div>

        <div class="badges-overview">
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-icon">🏅</div>
              <div class="stat-content">
                <div class="stat-value">{{ store.currentBadges.length }}</div>
                <div class="stat-label">전체 뱃지</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ store.availableBadges.length }}</div>
                <div class="stat-label">획득된 뱃지</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value">{{ store.quizScore }}</div>
                <div class="stat-label">현재 점수</div>
              </div>
            </div>
          </div>
        </div>

        <div class="badges-table-container">
          <div v-if="store.currentBadges.length === 0" class="empty-state">
            <div class="empty-icon">🏆</div>
            <h3>등록된 뱃지가 없습니다</h3>
            <p>첫 번째 뱃지를 추가해보세요</p>
          </div>

          <div v-else class="badges-table">
            <div class="table-header">
              <div class="header-cell">뱃지</div>
              <div class="header-cell">이름</div>
              <div class="header-cell">설명</div>
              <div class="header-cell">필요 점수</div>
              <div class="header-cell">상태</div>
              <div class="header-cell">작업</div>
            </div>
            
            <div 
              v-for="badge in store.currentBadges" 
              :key="badge.id"
              class="table-row"
              :class="{ unlocked: badge.unlocked }"
            >
              <div class="cell badge-cell">
                <span class="badge-icon">{{ badge.icon }}</span>
              </div>
              <div class="cell name-cell">
                <div class="badge-name">{{ badge.name }}</div>
              </div>
              <div class="cell description-cell">
                <div class="badge-description">{{ badge.description }}</div>
              </div>
              <div class="cell score-cell">
                <span class="required-score">{{ badge.requiredScore }}점</span>
              </div>
              <div class="cell status-cell">
                <span class="status-badge" :class="{ unlocked: badge.unlocked }">
                  {{ badge.unlocked ? '획득됨' : '미획득' }}
                </span>
              </div>
              <div class="cell actions-cell">
                <button @click="editBadge(badge)" class="btn btn-sm btn-secondary">
                  수정
                </button>
                <button @click="deleteBadgeConfirm(badge)" class="btn btn-sm btn-danger">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? '새 뱃지 추가' : '뱃지 수정' }}</h2>
          <button @click="closeModals" class="modal-close">×</button>
        </div>
        
        <form @submit.prevent="saveBadge" class="modal-form">
          <div class="form-group">
            <label class="form-label">뱃지 이름</label>
            <input 
              v-model="formData.name" 
              type="text" 
              class="form-input" 
              placeholder="예: 자동차 운전사"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">뱃지 아이콘</label>
            <div class="icon-input-container">
              <input 
                v-model="formData.icon" 
                type="text" 
                class="form-input" 
                placeholder="🚗"
                required 
              />
              <div class="icon-preview">{{ formData.icon }}</div>
            </div>
            <div class="icon-suggestions">
              <span 
                v-for="icon in vehicleIcons" 
                :key="icon"
                @click="formData.icon = icon"
                class="icon-suggestion"
              >
                {{ icon }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">설명</label>
            <input 
              v-model="formData.description" 
              type="text" 
              class="form-input" 
              placeholder="예: 퀴즈 5점 달성"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">필요 점수</label>
            <input 
              v-model.number="formData.requiredScore" 
              type="number" 
              class="form-input" 
              placeholder="5"
              min="1"
              required 
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn btn-secondary">
              취소
            </button>
            <button type="submit" class="btn btn-primary">
              {{ showAddModal ? '추가' : '수정' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>뱃지 삭제</h2>
          <button @click="showDeleteModal = false" class="modal-close">×</button>
        </div>
        
        <div class="delete-content">
          <p>정말로 "<strong>{{ badgeToDelete?.name }}</strong>" 뱃지를 삭제하시겠습니까?</p>
          <p class="delete-warning">이 작업은 되돌릴 수 없습니다.</p>
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
import { ref, reactive } from 'vue';
import AdminHeader from '@/components/AdminHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Badge } from '@/types';

const store = useAppStore();

const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingBadge = ref<Badge | null>(null);
const badgeToDelete = ref<Badge | null>(null);

const vehicleIcons = [
  '🚗', '🚌', '🚕', '🚒', '🚑', '🚓', '🚚', '🚂', '🚇', '🚋', 
  '🚝', '🚄', '✈️', '🚁', '🚀', '🚢', '⛵', '🚤', '🏍️', '🏎️',
  '🚜', '🛻', '🚐', '🚙', '🛺', '🚲', '🛴', '🛵', '🚠', '🚡'
];

const formData = reactive({
  name: '',
  icon: '',
  description: '',
  requiredScore: 5,
  category: 'quiz' as 'quiz' | 'puzzle'
});

const resetForm = () => {
  formData.name = '';
  formData.icon = '';
  formData.description = '';
  formData.requiredScore = 5;
  formData.category = 'quiz';
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingBadge.value = null;
  resetForm();
};

const editBadge = (badge: Badge) => {
  editingBadge.value = badge;
  formData.name = badge.name;
  formData.icon = badge.icon;
  formData.description = badge.description;
  formData.requiredScore = badge.requiredScore;
  formData.category = badge.category;
  showEditModal.value = true;
};

const saveBadge = () => {
  if (showAddModal.value) {
    store.addBadge({
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      requiredScore: formData.requiredScore,
      unlocked: false,
      category: formData.category
    });
  } else if (showEditModal.value && editingBadge.value) {
    store.updateBadge(editingBadge.value.id, {
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      requiredScore: formData.requiredScore,
      category: formData.category
    });
  }
  
  closeModals();
};

const deleteBadgeConfirm = (badge: Badge) => {
  badgeToDelete.value = badge;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (badgeToDelete.value) {
    store.deleteBadge(badgeToDelete.value.id);
    showDeleteModal.value = false;
    badgeToDelete.value = null;
  }
};
</script>

<style scoped>
.admin-badges {
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

.badges-overview {
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

.badges-table-container {
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

.badges-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 2fr 120px 100px 150px;
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
  grid-template-columns: 80px 1fr 2fr 120px 100px 150px;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--color-bg-hover);
}

.table-row.unlocked {
  background: rgba(16, 185, 129, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  display: flex;
  align-items: center;
}

.badge-icon {
  font-size: 2rem;
}

.badge-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.badge-description {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.required-score {
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

.status-badge.unlocked {
  background: var(--color-success);
  color: white;
}

.actions-cell {
  gap: var(--spacing-sm);
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
  max-width: 500px;
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

.icon-input-container {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.icon-input-container .form-input {
  flex: 1;
}

.icon-preview {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.icon-suggestions {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  max-height: 120px;
  overflow-y: auto;
}

.icon-suggestion {
  font-size: 1.5rem;
  padding: var(--spacing-xs);
  text-align: center;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.icon-suggestion:hover {
  background: var(--color-bg-hover);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
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
  
  .icon-suggestions {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .modal-content {
    margin: var(--spacing-md);
    max-width: none;
  }
}
</style>