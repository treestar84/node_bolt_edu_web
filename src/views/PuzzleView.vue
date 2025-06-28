<template>
  <div class="puzzle-view">
    <Navigation />
    
    <main class="main-content">
      <div class="container">
        <!-- Puzzle Selection Screen -->
        <div v-if="gameState === 'selection'" class="puzzle-selection">
          <div class="page-header">
            <h1 class="page-title">퍼즐 맞추기</h1>
            <p class="page-description">
              재미있는 퍼즐을 선택해서 맞춰보세요!
            </p>
          </div>

          <div class="puzzle-options">
            <div 
              v-for="option in puzzleOptions" 
              :key="option.id"
              @click="selectPuzzle(option)"
              class="puzzle-option-card"
            >
              <div class="option-image">
                <img :src="getImageUrl(option.imageUrl)" :alt="option.name" />
                <div class="play-overlay">
                  <span class="play-icon">🧩</span>
                  <span class="play-text">퍼즐 시작</span>
                </div>
              </div>
              <div class="option-info">
                <h3 class="option-name">{{ getCurrentName(option) }}</h3>
                <div class="difficulty-badge">{{ puzzleDifficulty }}조각</div>
              </div>
            </div>
          </div>

          <div class="difficulty-selector">
            <h3>난이도 선택</h3>
            <div class="difficulty-buttons">
              <button 
                @click="puzzleDifficulty = '3x2'"
                class="btn"
                :class="puzzleDifficulty === '3x2' ? 'btn-primary' : 'btn-secondary'"
              >
                🟢 쉬움 (6조각)
              </button>
              <button 
                @click="puzzleDifficulty = '3x3'"
                class="btn"
                :class="puzzleDifficulty === '3x3' ? 'btn-primary' : 'btn-secondary'"
              >
                🟡 보통 (9조각)
              </button>
            </div>
          </div>
        </div>

        <!-- Puzzle Game Screen -->
        <div v-else-if="gameState === 'playing'" class="puzzle-game">
          <div class="game-header">
            <button @click="goHome" class="btn btn-secondary home-btn">
              🏠 홈으로
            </button>
            <h2 class="puzzle-title">{{ getCurrentName(selectedPuzzle!) }} 퍼즐</h2>
            <button @click="resetPuzzle" class="btn btn-secondary reset-btn">
              🔄 다시하기
            </button>
          </div>

          <div class="game-container">
            <!-- Puzzle Board - 고정된 크기로 일관성 유지 -->
            <div class="puzzle-board-container">
              <div 
                class="puzzle-board" 
                ref="puzzleBoard"
                :class="{ 'grid-3x3': puzzleDifficulty === '3x3' }"
              >
                <div 
                  v-for="(slot, index) in puzzleSlots" 
                  :key="`slot-${index}`"
                  class="puzzle-slot"
                  :class="{ filled: slot.filled }"
                  @drop="handleDrop($event, index)"
                  @dragover.prevent
                  @dragenter.prevent
                >
                  <div v-if="slot.filled && slot.piecePosition !== undefined" class="placed-piece">
                    <div class="placed-piece-image-container">
                      <img 
                        :src="getImageUrl(selectedPuzzle!.imageUrl)" 
                        :alt="`조각 ${slot.piecePosition + 1}`"
                        :style="getPieceImageStyle(slot.piecePosition)"
                        class="placed-piece-image"
                      />
                    </div>
                  </div>
                  <div v-else class="empty-slot">
                    {{ index + 1 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Puzzle Pieces - 실제로 잘린 이미지 조각들 -->
            <div class="puzzle-pieces-container">
              <h3 class="pieces-title">퍼즐 조각</h3>
              <div class="puzzle-pieces">
                <div 
                  v-for="piece in shuffledPieces" 
                  :key="piece.id"
                  v-show="!piece.placed"
                  class="puzzle-piece"
                  :draggable="true"
                  @dragstart="handleDragStart($event, piece)"
                  @touchstart="handleTouchStart($event, piece)"
                  @touchmove="handleTouchMove"
                  @touchend="handleTouchEnd"
                >
                  <div class="piece-image-container">
                    <img 
                      :src="getImageUrl(selectedPuzzle!.imageUrl)" 
                      :alt="`조각 ${piece.correctPosition + 1}`"
                      :style="getPieceImageStyle(piece.correctPosition)"
                      class="piece-image"
                    />
                  </div>
                  <div class="piece-number">{{ piece.correctPosition + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completion Screen -->
        <div v-else-if="gameState === 'completed'" class="puzzle-completed">
          <div class="completion-animation">
            <div class="celebration-container">
              <div class="celebration-icon">🎉</div>
              <div class="confetti" v-for="i in 30" :key="i" :style="getConfettiStyle(i)"></div>
            </div>
            <h2 class="completion-title">잘했어요!</h2>
            <h3 class="completion-subtitle">{{ getCurrentName(selectedPuzzle!) }} 완성!</h3>
            
            <div class="completed-puzzle">
              <img :src="getImageUrl(selectedPuzzle!.imageUrl)" :alt="getCurrentName(selectedPuzzle!)" />
            </div>

            <div v-if="newBadgeUnlocked" class="new-badge-notification">
              <div class="badge-unlock-icon">🏆</div>
              <div class="badge-unlock-text">새로운 퍼즐 뱃지 획득!</div>
              <div class="unlocked-badge">
                <span class="unlocked-badge-icon">{{ newBadgeUnlocked.icon }}</span>
                <span class="unlocked-badge-name">{{ newBadgeUnlocked.name }}</span>
              </div>
            </div>

            <div class="completion-actions">
              <button @click="playAgain" class="btn btn-primary btn-lg">
                🧩 다시 퍼즐하기
              </button>
              <button @click="goHome" class="btn btn-secondary btn-lg">
                🏠 홈으로 가기
              </button>
            </div>
          </div>
        </div>

        <div v-if="store.currentWords.length === 0" class="empty-state">
          <div class="empty-icon">🧩</div>
          <h3>퍼즐할 이미지가 없습니다</h3>
          <p>단어 학습에 이미지를 추가해주세요</p>
          <router-link to="/admin/words" class="btn btn-primary">
            단어 추가하러 가기
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Navigation from '@/components/Navigation.vue';
import { useAppStore } from '@/stores/app';
import { useFileUpload } from '@/composables/useFileUpload';
import type { WordItem, Badge } from '@/types';

interface PuzzlePiece {
  id: string;
  image: string;
  correctPosition: number;
  placed: boolean;
}

interface PuzzleSlot {
  filled: boolean;
  piecePosition?: number; // 어떤 조각이 놓였는지 저장
}

const store = useAppStore();
const { getUploadedFileUrl } = useFileUpload();

const gameState = ref<'selection' | 'playing' | 'completed'>('selection');
const puzzleDifficulty = ref<'3x2' | '3x3'>('3x2');
const selectedPuzzle = ref<WordItem | null>(null);
const puzzleSlots = ref<PuzzleSlot[]>([]);
const puzzlePieces = ref<PuzzlePiece[]>([]);
const shuffledPieces = ref<PuzzlePiece[]>([]);
const completedPieces = ref(0);
const newBadgeUnlocked = ref<Badge | null>(null);
const puzzleBoard = ref<HTMLElement>();

// Touch handling
const draggedPiece = ref<PuzzlePiece | null>(null);
const touchOffset = ref({ x: 0, y: 0 });

const puzzleOptions = computed(() => {
  const words = store.currentWords.filter(w => w.imageUrl);
  return words.sort(() => Math.random() - 0.5).slice(0, 3);
});

const totalPieces = computed(() => {
  return puzzleDifficulty.value === '3x2' ? 6 : 9;
});

const gridCols = computed(() => {
  return puzzleDifficulty.value === '3x2' ? 3 : 3;
});

const gridRows = computed(() => {
  return puzzleDifficulty.value === '3x2' ? 2 : 3;
});

const getImageUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return getUploadedFileUrl(url.replace('/uploads/', '')) || url;
  }
  return url;
};

const getCurrentName = (word: WordItem): string => {
  return store.currentLanguage === 'ko' ? word.name : word.nameEn;
};

// 퍼즐 조각의 이미지 스타일을 계산하여 실제로 이미지를 자르는 효과
const getPieceImageStyle = (pieceIndex: number) => {
  const cols = gridCols.value;
  const rows = gridRows.value;
  
  const col = pieceIndex % cols;
  const row = Math.floor(pieceIndex / cols);
  
  return {
    width: `${cols * 100}%`,
    height: `${rows * 100}%`,
    objectFit: 'cover' as const,
    objectPosition: `-${col * 100}% -${row * 100}%`,
    transform: `translate(-${col * (100 / cols)}%, -${row * (100 / rows)}%)`,
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    WebkitUserDrag: 'none' as const,
    display: 'block'
  };
};

const selectPuzzle = (puzzle: WordItem) => {
  selectedPuzzle.value = puzzle;
  initializePuzzle();
  gameState.value = 'playing';
};

const initializePuzzle = () => {
  if (!selectedPuzzle.value) return;

  const pieces: PuzzlePiece[] = [];
  const slots: PuzzleSlot[] = [];

  // Create puzzle pieces and slots
  for (let i = 0; i < totalPieces.value; i++) {
    pieces.push({
      id: `piece-${i}`,
      image: getImageUrl(selectedPuzzle.value.imageUrl),
      correctPosition: i,
      placed: false
    });

    slots.push({
      filled: false
    });
  }

  puzzlePieces.value = pieces;
  puzzleSlots.value = slots;
  shuffledPieces.value = [...pieces].sort(() => Math.random() - 0.5);
  completedPieces.value = 0;
  newBadgeUnlocked.value = null;
};

const handleDragStart = (event: DragEvent, piece: PuzzlePiece) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', piece.id);
    // 드래그 이미지를 투명하게 설정하여 원본 조각이 보이도록
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  }
  draggedPiece.value = piece;
};

const handleDrop = (event: DragEvent, slotIndex: number) => {
  event.preventDefault();
  const pieceId = event.dataTransfer?.getData('text/plain');
  const piece = puzzlePieces.value.find(p => p.id === pieceId);
  
  if (piece && !puzzleSlots.value[slotIndex].filled) {
    placePiece(piece, slotIndex);
  }
};

const handleTouchStart = (event: TouchEvent, piece: PuzzlePiece) => {
  event.preventDefault();
  draggedPiece.value = piece;
  
  const touch = event.touches[0];
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  touchOffset.value = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
};

const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  
  if (!draggedPiece.value || !puzzleBoard.value) return;
  
  const touch = event.changedTouches[0];
  const boardRect = puzzleBoard.value.getBoundingClientRect();
  
  // Calculate which slot the piece was dropped on
  const relativeX = touch.clientX - boardRect.left;
  const relativeY = touch.clientY - boardRect.top;
  
  const slotWidth = boardRect.width / gridCols.value;
  const slotHeight = boardRect.height / gridRows.value;
  
  const col = Math.floor(relativeX / slotWidth);
  const row = Math.floor(relativeY / slotHeight);
  const slotIndex = row * gridCols.value + col;
  
  if (slotIndex >= 0 && slotIndex < totalPieces.value && !puzzleSlots.value[slotIndex].filled) {
    placePiece(draggedPiece.value, slotIndex);
  }
  
  draggedPiece.value = null;
};

const placePiece = (piece: PuzzlePiece, slotIndex: number) => {
  const isCorrect = piece.correctPosition === slotIndex;
  
  if (isCorrect) {
    // Correct placement - 올바른 위치에 놓인 조각을 슬롯에 표시
    puzzleSlots.value[slotIndex].filled = true;
    puzzleSlots.value[slotIndex].piecePosition = piece.correctPosition; // 조각 위치 저장
    piece.placed = true;
    completedPieces.value++;
    
    // Play success sound
    playSuccessSound();
    
    // Check if puzzle is completed
    if (completedPieces.value === totalPieces.value) {
      setTimeout(() => {
        completePuzzle();
      }, 500);
    }
  } else {
    // Wrong placement - play error sound
    playErrorSound();
    
    // Visual feedback for wrong placement
    const slotElement = puzzleBoard.value?.children[slotIndex] as HTMLElement;
    if (slotElement) {
      slotElement.classList.add('wrong-placement');
      setTimeout(() => {
        slotElement.classList.remove('wrong-placement');
      }, 600);
    }
  }
};

const completePuzzle = () => {
  gameState.value = 'completed';
  
  // Update puzzle completion count and check for badges
  store.incrementPuzzleCompletions();
  
  // Check for newly unlocked puzzle badge
  const unlockedBadge = store.currentBadges.find(badge => 
    badge.category === 'puzzle' && 
    badge.requiredScore === store.puzzleCompletions && 
    badge.unlocked
  );
  
  if (unlockedBadge) {
    newBadgeUnlocked.value = unlockedBadge;
  }
  
  // Play completion sound
  playCompletionSound();
};

const playSuccessSound = () => {
  // Create "딩동댕" sound
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 딩동댕 melody
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};

const playErrorSound = () => {
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // 3가지 재미있는 실패 효과음 중 랜덤 선택
    const errorSounds = [
      // 삐~ 소리
      () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      },
      
      // 뿡~~ 소리 (만화 같은)
      () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(120, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      },
      
      // 삐리리~ 소리 (경고음 같은)
      () => {
        for (let i = 0; i < 3; i++) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + i * 0.15);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + i * 0.15 + 0.1);
          
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.1);
          
          oscillator.start(audioContext.currentTime + i * 0.15);
          oscillator.stop(audioContext.currentTime + i * 0.15 + 0.1);
        }
      }
    ];
    
    // 랜덤하게 하나의 효과음 선택
    const randomSound = errorSounds[Math.floor(Math.random() * errorSounds.length)];
    randomSound();
  }
};

const playCompletionSound = () => {
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Play a triumphant melody
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.3);
      
      oscillator.start(audioContext.currentTime + index * 0.2);
      oscillator.stop(audioContext.currentTime + index * 0.2 + 0.3);
    });
  }
};

const resetPuzzle = () => {
  initializePuzzle();
};

const playAgain = () => {
  gameState.value = 'selection';
  selectedPuzzle.value = null;
};

const goHome = () => {
  gameState.value = 'selection';
  selectedPuzzle.value = null;
};

const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
  const randomColor = colors[index % colors.length];
  const randomDelay = Math.random() * 3;
  const randomDuration = 2 + Math.random() * 3;
  const randomX = Math.random() * 100;
  
  return {
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
    left: `${randomX}%`
  };
};

onMounted(() => {
  // Initialize puzzle options
});
</script>

<style scoped>
.puzzle-view {
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
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
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

.puzzle-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.puzzle-option-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.puzzle-option-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary);
}

.option-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.option-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.puzzle-option-card:hover .option-image img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.puzzle-option-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 2rem;
}

.play-text {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.option-info {
  padding: var(--spacing-lg);
  text-align: center;
}

.option-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.difficulty-badge {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

.difficulty-selector {
  text-align: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.difficulty-selector h3 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.difficulty-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.puzzle-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  flex: 1;
  margin: 0 var(--spacing-lg);
}

.home-btn, .reset-btn {
  min-width: 120px;
}

.game-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--spacing-2xl);
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
}

/* 퍼즐 보드를 고정된 크기로 만들어서 일관성 유지 */
.puzzle-board-container {
  display: flex;
  justify-content: center;
}

.puzzle-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 3px;
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 600px;
  height: 400px;
  box-shadow: var(--shadow-lg);
}

.puzzle-board.grid-3x3 {
  grid-template-rows: repeat(3, 1fr);
  height: 600px;
}

.puzzle-slot {
  background: var(--color-bg-secondary);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  /* 고정된 크기로 일관성 유지 */
  min-height: 0;
  min-width: 0;
}

.puzzle-slot:hover {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.1);
}

.puzzle-slot.filled {
  border-style: solid;
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
}

.puzzle-slot.wrong-placement {
  animation: wrongPlacement 0.6s ease;
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.2);
}

.placed-piece {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.placed-piece-image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.placed-piece-image {
  border-radius: var(--radius-sm);
  user-select: none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  pointer-events: none;
}

.empty-slot {
  color: var(--color-text-muted);
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 퍼즐 조각 영역 */
.puzzle-pieces-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  height: fit-content;
}

.pieces-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.puzzle-pieces {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.puzzle-piece {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  border: 3px solid var(--color-border);
  background: var(--color-bg-secondary);
  user-select: none;
}

.puzzle-piece:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.puzzle-piece:active {
  cursor: grabbing;
  transform: scale(0.95);
}

/* 퍼즐 조각 이미지를 실제로 자르는 효과 */
.piece-image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.piece-image {
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  pointer-events: none;
}

.piece-number {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  pointer-events: none;
}

.puzzle-completed {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.completion-animation {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
}

.celebration-container {
  position: relative;
  margin-bottom: var(--spacing-xl);
}

.celebration-icon {
  font-size: 4rem;
  animation: celebration 2s ease infinite;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  animation: confettiFall 4s linear infinite;
}

.completion-title {
  font-size: 2rem;
  color: var(--color-success);
  margin-bottom: var(--spacing-md);
  animation: bounce 1s ease;
}

.completion-subtitle {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
}

.completed-puzzle {
  width: 200px;
  height: 200px;
  margin: 0 auto var(--spacing-xl);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  border: 3px solid var(--color-success);
}

.completed-puzzle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-badge-notification {
  background: linear-gradient(135deg, var(--color-success), var(--color-secondary));
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin: var(--spacing-lg) 0;
  animation: badgeNotification 2s ease;
}

.badge-unlock-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.badge-unlock-text {
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.unlocked-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
}

.unlocked-badge-icon {
  font-size: 1.5rem;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
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
  margin-bottom: var(--spacing-xl);
}

@keyframes wrongPlacement {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes celebration {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-2deg); }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes badgeNotification {
  0% { 
    transform: scale(0.8) translateY(20px); 
    opacity: 0;
  }
  50% { 
    transform: scale(1.05) translateY(-5px); 
    opacity: 1;
  }
  100% { 
    transform: scale(1) translateY(0); 
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .game-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .puzzle-board {
    width: 500px;
    height: 333px;
  }
  
  .puzzle-board.grid-3x3 {
    height: 500px;
  }
  
  .puzzle-pieces-container {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .puzzle-pieces {
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
  }
}

@media (max-width: 768px) {
  .puzzle-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .difficulty-buttons {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .game-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .puzzle-title {
    margin: 0;
  }
  
  .puzzle-board {
    width: 350px;
    height: 233px;
    gap: 2px;
    padding: var(--spacing-md);
  }
  
  .puzzle-board.grid-3x3 {
    height: 350px;
  }
  
  .puzzle-slot {
    border-width: 1px;
  }
  
  .empty-slot {
    font-size: 1.5rem;
  }
  
  .puzzle-pieces {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .puzzle-piece {
    width: 100px;
    height: 100px;
  }
  
  .completion-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .completed-puzzle {
    width: 150px;
    height: 150px;
  }
}
</style>