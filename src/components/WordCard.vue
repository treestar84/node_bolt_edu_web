<template>
  <div class="word-card" @click="playWordAudio">
    <div class="card-image">
      <img :src="getImageUrl(word.imageUrl)" :alt="currentName" />
      <div class="play-overlay" :class="{ playing: isPlaying }">
        <span class="play-icon">{{ isPlaying ? '🔊' : '🔈' }}</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="word-name">{{ currentName }}</h3>
      <span class="word-category">{{ word.category }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WordItem } from '@/types';
import { useAppStore } from '@/stores/app';
import { useAudio } from '@/composables/useAudio';
import { useFileUpload } from '@/composables/useFileUpload';

interface Props {
  word: WordItem;
}

interface Emits {
  (e: 'audio-played'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const store = useAppStore();
const { isPlaying, playAudio } = useAudio();
const { getUploadedFileUrl } = useFileUpload();

const currentName = computed(() => {
  return store.currentLanguage === 'ko' ? props.word.name : props.word.nameEn;
});

const currentAudioUrl = computed(() => {
  const audioUrl = store.currentLanguage === 'ko' ? props.word.audioKo : props.word.audioEn;
  return getAudioUrl(audioUrl);
});

const getImageUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const getAudioUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const playWordAudio = async () => {
  try {
    await playAudio(currentAudioUrl.value);
    emit('audio-played');
  } catch (error) {
    console.warn('Audio playback failed:', error);
    emit('audio-played'); // Still emit for auto-advance
  }
};
</script>

<style scoped>
.word-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.word-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary);
}

.word-card:active {
  transform: translateY(-4px) scale(0.98);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.word-card:hover .card-image img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.word-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay.playing {
  opacity: 1;
  background: rgba(59, 130, 246, 0.8);
  animation: pulse 1s infinite;
}

.card-content {
  padding: var(--spacing-lg);
  text-align: center;
}

.word-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.word-category {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-transform: capitalize;
  background: var(--color-bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 768px) {
  .card-image {
    height: 160px;
  }
  
  .word-name {
    font-size: 1.25rem;
  }
  
  .play-overlay {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
    opacity: 1;
  }
}
</style>