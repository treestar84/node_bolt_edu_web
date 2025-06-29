<template>
  <div class="admin-books">
    <AdminHeader />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">책 관리</h1>
          <button @click="showAddModal = true" class="btn btn-primary">
            <span>➕</span>
            새 책 추가
          </button>
        </div>

        <div class="books-grid" v-if="store.currentBooks.length > 0">
          <div 
            v-for="book in store.currentBooks" 
            :key="book.id"
            class="book-card"
          >
            <div class="book-cover">
              <img :src="getImageUrl(book.coverImage)" :alt="book.title" />
            </div>
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <div class="book-meta">
                <span class="page-count">{{ book.pages.length }}장</span>
                <span class="age-range">{{ book.minAge }}-{{ book.maxAge }}세</span>
              </div>
              <div class="book-actions">
                <button @click="editBook(book)" class="btn btn-sm btn-secondary">
                  수정
                </button>
                <button @click="deleteBookConfirm(book)" class="btn btn-sm btn-danger">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📖</div>
          <h3>등록된 책이 없습니다</h3>
          <p>첫 번째 그림책을 추가해보세요</p>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? '새 책 추가' : '책 수정' }}</h2>
          <button @click="closeModals" class="modal-close">×</button>
        </div>
        
        <form @submit.prevent="saveBook" class="modal-form">
          <div class="basic-info-section">
            <h3 class="section-title">기본 정보</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">책 제목</label>
                <input 
                  v-model="formData.title" 
                  type="text" 
                  class="form-input" 
                  placeholder="예: 동물 친구들"
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">적정 나이</label>
                <div class="age-inputs">
                  <select v-model.number="formData.minAge" class="form-input" required>
                    <option value="3">3세</option>
                    <option value="4">4세</option>
                    <option value="5">5세</option>
                    <option value="6">6세</option>
                  </select>
                  <span class="age-separator">~</span>
                  <select v-model.number="formData.maxAge" class="form-input" required>
                    <option value="3">3세</option>
                    <option value="4">4세</option>
                    <option value="5">5세</option>
                    <option value="6">6세</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">표지 이미지</label>
              <FileUploadInput
                v-model="formData.coverImage"
                label="표지 이미지"
                placeholder="https://example.com/cover.jpg"
                file-type="image"
                :required="true"
              />
            </div>
          </div>

          <div class="pages-section">
            <h3 class="section-title">책 페이지 (4장)</h3>
            
            <div class="pages-grid">
              <div 
                v-for="(page, index) in formData.pages" 
                :key="index"
                class="page-form-card"
              >
                <h4 class="page-title">{{ index + 1 }}장</h4>
                
                <div class="page-form-content">
                  <div class="form-group">
                    <label class="form-label">이미지</label>
                    <FileUploadInput
                      v-model="page.imageUrl"
                      label="페이지 이미지"
                      placeholder="https://example.com/page1.jpg"
                      file-type="image"
                      :required="true"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">음성</label>
                    <FileUploadInput
                      v-model="page.audioUrl"
                      label="페이지 음성"
                      placeholder="/audio/book1-page1.mp3"
                      file-type="audio"
                      :required="true"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">텍스트 (선택사항)</label>
                    <textarea 
                      v-model="page.textContent" 
                      class="form-input textarea"
                      placeholder="예: 귀여운 고양이가 있어요"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn btn-secondary">
              취소
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '저장 중...' : (showAddModal ? '추가' : '수정') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>책 삭제</h2>
          <button @click="showDeleteModal = false" class="modal-close">×</button>
        </div>
        
        <div class="delete-content">
          <p>정말로 "<strong>{{ bookToDelete?.title }}</strong>" 책을 삭제하시겠습니까?</p>
          <p class="delete-warning">이 작업은 되돌릴 수 없습니다.</p>
        </div>

        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            취소
          </button>
          <button @click="confirmDelete" class="btn btn-danger" :disabled="isLoading">
            {{ isLoading ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AdminHeader from '@/components/AdminHeader.vue';
import FileUploadInput from '@/components/FileUploadInput.vue';
import { useAppStore } from '@/stores/app';
import { useFileUpload } from '@/composables/useFileUpload';
import type { Book, BookPage } from '@/types';

const store = useAppStore();
const { getUploadedFileUrl } = useFileUpload();

const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingBook = ref<Book | null>(null);
const bookToDelete = ref<Book | null>(null);
const isLoading = ref(false);
const error = ref('');

const createEmptyPage = () => ({
  imageUrl: '',
  audioUrl: '',
  textContent: ''
});

const formData = reactive({
  title: '',
  coverImage: '',
  minAge: 3,
  maxAge: 6,
  pages: [
    createEmptyPage(),
    createEmptyPage(),
    createEmptyPage(),
    createEmptyPage()
  ]
});

const getImageUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const resetForm = () => {
  formData.title = '';
  formData.coverImage = '';
  formData.minAge = 3;
  formData.maxAge = 6;
  formData.pages = [
    createEmptyPage(),
    createEmptyPage(),
    createEmptyPage(),
    createEmptyPage()
  ];
  error.value = '';
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingBook.value = null;
  resetForm();
};

const editBook = (book: Book) => {
  editingBook.value = book;
  formData.title = book.title;
  formData.coverImage = book.coverImage;
  formData.minAge = book.minAge;
  formData.maxAge = book.maxAge;
  
  // Fill pages data
  formData.pages = book.pages.map(page => ({
    imageUrl: page.imageUrl,
    audioUrl: page.audioUrl,
    textContent: page.textContent || ''
  }));
  
  // Ensure we have exactly 4 pages
  while (formData.pages.length < 4) {
    formData.pages.push(createEmptyPage());
  }
  
  showEditModal.value = true;
};

const saveBook = async () => {
  if (formData.minAge > formData.maxAge) {
    error.value = '최소 나이는 최대 나이보다 작거나 같아야 합니다.';
    return;
  }

  // Validate all pages have required fields
  for (let i = 0; i < formData.pages.length; i++) {
    const page = formData.pages[i];
    if (!page.imageUrl || !page.audioUrl) {
      error.value = `${i + 1}장의 이미지와 음성은 필수입니다.`;
      return;
    }
  }

  isLoading.value = true;
  error.value = '';

  try {
    const pages: BookPage[] = formData.pages.map((page, index) => ({
      id: `${Date.now()}-${index}`,
      bookId: '', // Will be set by the store
      pageNumber: index + 1,
      imageUrl: page.imageUrl,
      audioUrl: page.audioUrl,
      textContent: page.textContent || undefined
    }));

    if (showAddModal.value) {
      await store.addBook({
        title: formData.title,
        coverImage: formData.coverImage,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        ownerType: 'global',
        ownerId: undefined,
        pages
      });
      console.log('✅ Book added successfully');
    } else if (showEditModal.value && editingBook.value) {
      await store.updateBook(editingBook.value.id, {
        title: formData.title,
        coverImage: formData.coverImage,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        pages
      });
      console.log('✅ Book updated successfully');
    }
    
    closeModals();
  } catch (err: any) {
    console.error('❌ Error saving book:', err);
    error.value = err.message || '저장 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const deleteBookConfirm = (book: Book) => {
  bookToDelete.value = book;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!bookToDelete.value) return;

  isLoading.value = true;
  
  try {
    await store.deleteBook(bookToDelete.value.id);
    console.log('✅ Book deleted successfully');
    showDeleteModal.value = false;
    bookToDelete.value = null;
  } catch (err: any) {
    console.error('❌ Error deleting book:', err);
    error.value = err.message || '삭제 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  // 페이지 로드 시 최신 데이터 가져오기
  console.log('🔄 Loading books data...');
  await store.loadBooks();
});
</script>

<style scoped>
.admin-books {
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.book-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-light);
}

.book-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  padding: var(--spacing-lg);
}

.book-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.book-meta {
  margin-bottom: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-sm);
}

.page-count {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.age-range {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.book-actions {
  display: flex;
  gap: var(--spacing-sm);
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

.large-modal {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-bg-card);
  z-index: 10;
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

.basic-info-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.age-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.age-separator {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.pages-section {
  margin-bottom: var(--spacing-2xl);
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.page-form-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.page-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.page-title::before {
  content: '📄';
  font-size: 1.2rem;
}

.page-form-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.textarea {
  resize: vertical;
  min-height: 80px;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  position: sticky;
  bottom: 0;
  background: var(--color-bg-card);
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
  
  .books-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .pages-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .modal-content {
    margin: var(--spacing-md);
    max-width: none;
  }
  
  .large-modal {
    max-width: none;
  }
  
  .modal-header {
    padding: var(--spacing-lg);
  }
  
  .modal-form {
    padding: var(--spacing-lg);
  }
  
  .page-form-card {
    padding: var(--spacing-md);
  }
}
</style>