<template>
  <div class="file-upload-input">
    <div class="input-tabs">
      <button 
        type="button"
        @click="inputMode = 'url'"
        class="tab-button"
        :class="{ active: inputMode === 'url' }"
      >
        🔗 URL 입력
      </button>
      <button 
        type="button"
        @click="inputMode = 'upload'"
        class="tab-button"
        :class="{ active: inputMode === 'upload' }"
      >
        📁 파일 업로드
      </button>
    </div>

    <!-- URL Input Mode -->
    <div v-if="inputMode === 'url'" class="url-input-section">
      <input 
        :type="fileType === 'audio' ? 'text' : 'url'"
        :value="modelValue" 
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        class="form-input"
        :required="required"
      />
      <div v-if="modelValue && fileType === 'image'" class="preview-section">
        <img :src="modelValue" :alt="label" class="image-preview" />
      </div>
    </div>

    <!-- File Upload Mode -->
    <div v-if="inputMode === 'upload'" class="upload-input-section">
      <div class="upload-area" :class="{ 'drag-over': isDragOver }" @click="triggerFileInput">
        <input 
          ref="fileInput"
          type="file" 
          :accept="acceptedTypes"
          @change="handleFileSelect"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleFileDrop"
          class="file-input"
        />
        
        <div v-if="!isUploading && !uploadedFile" class="upload-placeholder">
          <div class="upload-icon">{{ fileType === 'image' ? '🖼️' : '🎵' }}</div>
          <div class="upload-text">
            <p>클릭하거나 파일을 드래그해서 업로드</p>
            <p class="upload-hint">{{ fileType === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP3, WAV, OGG' }} (최대 10MB)</p>
          </div>
        </div>

        <div v-if="isUploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
          <p>업로드 중... {{ uploadProgress }}%</p>
        </div>

        <div v-if="uploadedFile && !isUploading" class="upload-success">
          <div class="success-icon">✅</div>
          <p>{{ uploadedFile.name }}</p>
          <button type="button" @click.stop="removeFile" class="remove-button">삭제</button>
        </div>
      </div>

      <div v-if="uploadedFileUrl && fileType === 'image'" class="preview-section">
        <img :src="uploadedFileUrl" :alt="label" class="image-preview" />
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useFileUpload } from '@/composables/useFileUpload';

interface Props {
  modelValue: string;
  label: string;
  placeholder: string;
  fileType: 'image' | 'audio';
  required?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isUploading, uploadProgress, uploadFile, getUploadedFileUrl, validateFile } = useFileUpload();

const inputMode = ref<'url' | 'upload'>('url');
const fileInput = ref<HTMLInputElement>();
const uploadedFile = ref<File | null>(null);
const uploadedFileUrl = ref<string>('');
const isDragOver = ref(false);
const error = ref<string>('');

const acceptedTypes = computed(() => {
  return props.fileType === 'image' 
    ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
    : 'audio/mpeg,audio/mp3,audio/wav,audio/ogg';
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
};

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
};

const processFile = async (file: File) => {
  error.value = '';
  
  // Validate file
  const validation = validateFile(file, props.fileType);
  if (!validation.valid) {
    error.value = validation.error || '유효하지 않은 파일입니다.';
    return;
  }

  try {
    uploadedFile.value = file;
    const fileUrl = await uploadFile(file, props.fileType);
    
    // Get the actual data URL for preview
    uploadedFileUrl.value = getUploadedFileUrl(fileUrl.replace('/uploads/', '')) || '';
    
    // Emit the file URL to parent
    emit('update:modelValue', fileUrl);
    
  } catch (err) {
    error.value = '파일 업로드에 실패했습니다.';
    console.error('Upload error:', err);
  }
};

const removeFile = () => {
  uploadedFile.value = null;
  uploadedFileUrl.value = '';
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    uploadedFile.value = null;
    uploadedFileUrl.value = '';
  } else if (newValue.startsWith('/uploads/')) {
    // This is an uploaded file, get the data URL for preview
    uploadedFileUrl.value = getUploadedFileUrl(newValue.replace('/uploads/', '')) || '';
  }
});
</script>

<style scoped>
.file-upload-input {
  width: 100%;
}

.input-tabs {
  display: flex;
  margin-bottom: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 2px;
}

.tab-button {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.tab-button.active {
  background: var(--color-primary);
  color: white;
}

.tab-button:hover:not(.active) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.url-input-section,
.upload-input-section {
  margin-bottom: var(--spacing-md);
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-bg-secondary);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.05);
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-icon {
  font-size: 3rem;
}

.upload-text p {
  margin: 0;
  color: var(--color-text-primary);
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: var(--color-bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.upload-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.success-icon {
  font-size: 2rem;
}

.remove-button {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background: #dc2626;
}

.preview-section {
  margin-top: var(--spacing-md);
  text-align: center;
}

.image-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  object-fit: cover;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
  .upload-area {
    padding: var(--spacing-lg);
  }
  
  .upload-icon {
    font-size: 2rem;
  }
  
  .upload-text p {
    font-size: 0.875rem;
  }
  
  .progress-bar {
    width: 150px;
  }
}
</style>