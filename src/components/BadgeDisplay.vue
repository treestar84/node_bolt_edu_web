<template>
  <div class="badge-display">
    <h3 class="badge-title">🏆 획득한 뱃지</h3>
    
    <div v-if="store.availableBadges.length > 0" class="badges-grid">
      <div 
        v-for="badge in store.availableBadges" 
        :key="badge.id"
        class="badge-item"
        :class="{ 'newly-unlocked': isNewlyUnlocked(badge.id) }"
      >
        <div class="badge-icon">{{ badge.icon }}</div>
        <div class="badge-info">
          <div class="badge-name">{{ badge.name }}</div>
          <div class="badge-description">{{ badge.description }}</div>
        </div>
      </div>
    </div>

    <div v-else class="no-badges">
      <div class="no-badges-icon">🎯</div>
      <p>아직 획득한 뱃지가 없습니다</p>
      <p class="hint">퀴즈를 풀어서 첫 번째 뱃지를 획득해보세요!</p>
    </div>

    <div v-if="store.nextBadge" class="next-badge">
      <h4>다음 목표</h4>
      <div class="next-badge-item">
        <div class="next-badge-icon">{{ store.nextBadge.icon }}</div>
        <div class="next-badge-info">
          <div class="next-badge-name">{{ store.nextBadge.name }}</div>
          <div class="next-badge-progress">
            {{ store.quizScore }} / {{ store.nextBadge.requiredScore }} 점
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${Math.min((store.quizScore / store.nextBadge.requiredScore) * 100, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const recentlyUnlocked = ref<string[]>([]);

const isNewlyUnlocked = (badgeId: string) => {
  return recentlyUnlocked.value.includes(badgeId);
};

onMounted(() => {
  // Check for newly unlocked badges
  const newBadges = store.unlockedBadges.filter(id => !recentlyUnlocked.value.includes(id));
  if (newBadges.length > 0) {
    recentlyUnlocked.value = [...newBadges];
    
    // Clear the "newly unlocked" status after animation
    setTimeout(() => {
      recentlyUnlocked.value = [];
    }, 3000);
  }
});
</script>

<style scoped>
.badge-display {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.badge-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.badge-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: all 0.3s ease;
}

.badge-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.badge-item.newly-unlocked {
  animation: badgeUnlock 2s ease;
  border-color: var(--color-success);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.badge-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.badge-info {
  flex: 1;
}

.badge-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xs);
}

.badge-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.no-badges {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
}

.no-badges-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-sm);
}

.next-badge {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-lg);
}

.next-badge h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.next-badge-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.next-badge-icon {
  font-size: 2rem;
  opacity: 0.5;
  flex-shrink: 0;
}

.next-badge-info {
  flex: 1;
}

.next-badge-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xs);
}

.next-badge-progress {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-bg-primary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
}

@keyframes badgeUnlock {
  0% { 
    transform: scale(1); 
    box-shadow: 0 0 0 rgba(16, 185, 129, 0);
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
  }
  100% { 
    transform: scale(1); 
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
}

@media (max-width: 768px) {
  .badges-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .badge-item {
    padding: var(--spacing-sm);
  }
  
  .badge-icon,
  .next-badge-icon {
    font-size: 1.5rem;
  }
  
  .badge-name,
  .next-badge-name {
    font-size: 0.8rem;
  }
  
  .badge-description,
  .next-badge-progress {
    font-size: 0.7rem;
  }
}
</style>