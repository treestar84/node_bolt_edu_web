<template>
  <div class="quiz-view">
    <Navigation />
    
    <main class="main-content">
      <div class="container">
        <div class="quiz-header">
          <h1 class="page-title">퀴즈 게임</h1>
          <div class="quiz-stats">
            <div class="stat">
              <span class="stat-label">점수</span>
              <span class="stat-value">{{ store.quizScore }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">연속 정답</span>
              <span class="stat-value">{{ store.quizStreak }}</span>
            </div>
          </div>
        </div>

        <!-- Badge Display -->
        <BadgeDisplay />

        <div v-if="!gameStarted" class="game-start">
          <div class="start-card">
            <div class="start-icon">🧩</div>
            <h2>퀴즈 게임을 시작해볼까요?</h2>
            <p>음성을 듣고 정답 이미지를 찾아보세요!</p>
            <button @click="startGame" class="btn btn-primary btn-lg">
              게임 시작하기
            </button>
          </div>
        </div>

        <div v-else-if="currentQuiz" class="quiz-game">
          <div class="quiz-question">
            <h2>음성을 듣고 정답을 찾아보세요</h2>
            <button @click="playQuizAudio" class="audio-button" :class="{ playing: isPlaying }">
              <span class="audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</span>
              <span>다시 듣기</span>
            </button>
          </div>

          <div class="quiz-options">
            <div 
              v-for="option in currentQuiz.options" 
              :key="option.id"
              @click="selectAnswer(option.id)"
              class="quiz-option"
              :class="{ 
                selected: selectedAnswer === option.id,
                correct: showResult && option.id === currentQuiz.correctAnswerId,
                incorrect: showResult && selectedAnswer === option.id && option.id !== currentQuiz.correctAnswerId
              }"
            >
              <img :src="option.imageUrl" :alt="option.name" />
              <div class="option-name">
                {{ store.currentLanguage === 'ko' ? option.name : option.nameEn }}
              </div>
            </div>
          </div>

          <div v-if="showResult" class="quiz-result">
            <div v-if="isCorrect" class="result-correct">
              <div class="celebration-container">
                <div class="celebration-icon">🎉</div>
                <div class="confetti" v-for="i in 20" :key="i" :style="getConfettiStyle(i)"></div>
              </div>
              <h3>정답입니다!</h3>
              <div class="reward-stickers">
                <span v-for="sticker in rewardStickers" :key="sticker" class="sticker">{{ sticker }}</span>
              </div>
              <div v-if="newBadgeUnlocked" class="new-badge-notification">
                <div class="badge-unlock-icon">🏆</div>
                <div class="badge-unlock-text">새로운 뱃지 획득!</div>
                <div class="unlocked-badge">
                  <span class="unlocked-badge-icon">{{ newBadgeUnlocked.icon }}</span>
                  <span class="unlocked-badge-name">{{ newBadgeUnlocked.name }}</span>
                </div>
              </div>
            </div>
            <div v-else class="result-incorrect">
              <div class="result-icon">😅</div>
              <h3>다시 한번 도전해보세요!</h3>
            </div>
          </div>
        </div>

        <div v-else class="no-words">
          <div class="empty-icon">📚</div>
          <h3>퀴즈할 단어가 부족합니다</h3>
          <p>최소 3개 이상의 단어가 필요합니다</p>
          <router-link to="/words" class="btn btn-primary">
            단어 학습하러 가기
          </router-link>
        </div>
      </div>
    </main>

    <!-- Sound Effect Audio Elements -->
    <audio ref="successAudio" preload="auto">
      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav">
    </audio>
    <audio ref="failureAudio1" preload="auto">
      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav">
    </audio>
    <audio ref="failureAudio2" preload="auto">
      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav">
    </audio>
    <audio ref="failureAudio3" preload="auto">
      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Navigation from '@/components/Navigation.vue';
import BadgeDisplay from '@/components/BadgeDisplay.vue';
import { useAppStore } from '@/stores/app';
import { useAudio } from '@/composables/useAudio';
import type { Quiz, Badge } from '@/types';

const store = useAppStore();
const { isPlaying, playAudio } = useAudio();

const gameStarted = ref(false);
const currentQuiz = ref<Quiz | null>(null);
const selectedAnswer = ref<string>('');
const showResult = ref(false);
const isCorrect = ref(false);
const newBadgeUnlocked = ref<Badge | null>(null);

const rewardStickers = ref<string[]>([]);
const vehicleStickers = ['🚗', '🚒', '🚀', '🚁', '🚂', '🚢', '✈️', '🚌', '🏎️', '🚜'];

// Audio refs for sound effects
const successAudio = ref<HTMLAudioElement>();
const failureAudio1 = ref<HTMLAudioElement>();
const failureAudio2 = ref<HTMLAudioElement>();
const failureAudio3 = ref<HTMLAudioElement>();

const canStartGame = computed(() => store.currentWords.length >= 3);

const startGame = () => {
  if (!canStartGame.value) return;
  gameStarted.value = true;
  generateNewQuiz();
};

const generateNewQuiz = () => {
  const words = store.currentWords;
  if (words.length < 3) return;

  // Select random correct answer
  const correctAnswer = words[Math.floor(Math.random() * words.length)];
  
  // Select 2 random wrong answers
  const wrongAnswers = words
    .filter(w => w.id !== correctAnswer.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  
  // Shuffle all options
  const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
  
  const audioUrl = store.currentLanguage === 'ko' ? correctAnswer.audioKo : correctAnswer.audioEn;
  
  currentQuiz.value = {
    id: Date.now().toString(),
    audioUrl,
    correctAnswerId: correctAnswer.id,
    options,
    language: store.currentLanguage
  };
  
  selectedAnswer.value = '';
  showResult.value = false;
  isCorrect.value = false;
  newBadgeUnlocked.value = null;
  
  // Auto play audio
  setTimeout(() => {
    playQuizAudio();
  }, 500);
};

const playQuizAudio = () => {
  if (currentQuiz.value) {
    playAudio(currentQuiz.value.audioUrl);
  }
};

const selectAnswer = (answerId: string) => {
  if (showResult.value) return;
  
  selectedAnswer.value = answerId;
  isCorrect.value = answerId === currentQuiz.value?.correctAnswerId;
  showResult.value = true;
  
  if (isCorrect.value) {
    store.incrementQuizScore();
    
    // Check for newly unlocked badge
    const unlockedBadge = store.currentBadges.find(badge => 
      badge.requiredScore === store.quizScore && badge.unlocked
    );
    
    if (unlockedBadge) {
      newBadgeUnlocked.value = unlockedBadge;
    }
    
    // Generate reward stickers
    rewardStickers.value = vehicleStickers
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, store.quizStreak));
    
    // Play success sound effect
    playSuccessSound();
    
    // Auto advance after celebration
    setTimeout(() => {
      generateNewQuiz();
    }, 3000);
    
  } else {
    store.resetQuizStreak();
    rewardStickers.value = [];
    
    // Play failure sound effect
    playFailureSound();
    
    // Auto advance after showing result
    setTimeout(() => {
      generateNewQuiz();
    }, 2000);
  }
};

const playSuccessSound = () => {
  // Create success sound using Web Audio API
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Create a celebratory sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};

const playFailureSound = () => {
  // Create failure sound using Web Audio API
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    const sounds = [
      // Sound 1: Descending notes
      () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      },
      // Sound 2: Wobble effect
      () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      },
      // Sound 3: Cartoon-like boing
      () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    ];
    
    // Play random failure sound
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    randomSound();
  }
};

const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
  const randomColor = colors[index % colors.length];
  const randomDelay = Math.random() * 2;
  const randomDuration = 2 + Math.random() * 2;
  const randomX = Math.random() * 100;
  
  return {
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
    left: `${randomX}%`
  };
};

onMounted(() => {
  if (!canStartGame.value) {
    gameStarted.value = false;
  }
});
</script>

<style scoped>
.quiz-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.main-content {
  padding: var(--spacing-2xl) 0;
}

.quiz-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.quiz-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
}

.stat {
  text-align: center;
  background: var(--color-bg-card);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.game-start {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.start-card {
  text-align: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  max-width: 500px;
}

.start-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.start-card h2 {
  font-size: 1.75rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.start-card p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: 1.125rem;
}

.quiz-game {
  max-width: 800px;
  margin: 0 auto;
}

.quiz-question {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  background: var(--color-bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.quiz-question h2 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.audio-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.audio-button.playing {
  animation: pulse 1s infinite;
}

.audio-icon {
  font-size: 1.5rem;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.quiz-option {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.quiz-option:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.quiz-option.selected {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.quiz-option.correct {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
  animation: correctAnswer 0.6s ease;
}

.quiz-option.incorrect {
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  animation: incorrectAnswer 0.6s ease;
}

.quiz-option img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.option-name {
  padding: var(--spacing-md);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 1.125rem;
}

.quiz-result {
  text-align: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
}

.celebration-container {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.celebration-icon {
  font-size: 4rem;
  animation: celebration 1s ease;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  animation: confettiFall 3s linear infinite;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.result-correct h3 {
  color: var(--color-success);
  font-size: 1.75rem;
  margin-bottom: var(--spacing-lg);
}

.result-incorrect h3 {
  color: var(--color-text-primary);
  font-size: 1.75rem;
  margin-bottom: var(--spacing-lg);
}

.reward-stickers {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.sticker {
  font-size: 2rem;
  animation: bounce 0.6s ease;
}

.sticker:nth-child(2) { animation-delay: 0.1s; }
.sticker:nth-child(3) { animation-delay: 0.2s; }

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

.unlocked-badge-name {
  font-weight: 500;
}

.no-words {
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

.no-words h3 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.no-words p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

@keyframes correctAnswer {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes incorrectAnswer {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
  100% { transform: translateX(0); }
}

@keyframes celebration {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-5deg); }
  50% { transform: scale(1.3) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); }
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

@media (max-width: 768px) {
  .quiz-stats {
    gap: var(--spacing-md);
  }
  
  .stat {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .quiz-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .quiz-option img {
    height: 120px;
  }
  
  .start-card {
    padding: var(--spacing-xl);
    margin: 0 var(--spacing-md);
  }
  
  .quiz-question {
    padding: var(--spacing-md);
  }
  
  .quiz-question h2 {
    font-size: 1.25rem;
  }
  
  .audio-button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 1rem;
  }
}
</style>