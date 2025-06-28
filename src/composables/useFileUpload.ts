import { ref } from 'vue';

// In-memory storage for uploaded files (won't persist across page refreshes)
const uploadedFiles = new Map<string, string>();

export function useFileUpload() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);

  const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        isUploading.value = true;
        uploadProgress.value = 0;

        // Create a unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${type}_${timestamp}.${extension}`;
        
        // Create FileReader to convert file to data URL
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const result = e.target?.result as string;
          
          // Store in memory instead of localStorage to avoid quota issues
          const storageKey = `uploaded_${filename}`;
          uploadedFiles.set(storageKey, result);
          
          // Return a local URL that we can use
          const localUrl = `/uploads/${filename}`;
          
          // Simulate upload progress
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            uploadProgress.value = progress;
            
            if (progress >= 100) {
              clearInterval(progressInterval);
              isUploading.value = false;
              uploadProgress.value = 0;
              resolve(localUrl);
            }
          }, 100);
        };
        
        reader.onerror = () => {
          isUploading.value = false;
          uploadProgress.value = 0;
          reject(new Error('파일 읽기에 실패했습니다.'));
        };
        
        reader.readAsDataURL(file);
        
      } catch (error) {
        isUploading.value = false;
        uploadProgress.value = 0;
        reject(error);
      }
    });
  };

  const getUploadedFileUrl = (filename: string): string | null => {
    const storageKey = `uploaded_${filename.replace('/uploads/', '')}`;
    return uploadedFiles.get(storageKey) || null;
  };

  const validateFile = (file: File, type: 'image' | 'audio'): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      return { valid: false, error: '파일 크기는 10MB 이하여야 합니다.' };
    }
    
    if (type === 'image') {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return { valid: false, error: '지원되는 이미지 형식: JPG, PNG, GIF, WebP' };
      }
    } else if (type === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        return { valid: false, error: '지원되는 오디오 형식: MP3, WAV, OGG' };
      }
    }
    
    return { valid: true };
  };

  return {
    isUploading,
    uploadProgress,
    uploadFile,
    getUploadedFileUrl,
    validateFile
  };
}