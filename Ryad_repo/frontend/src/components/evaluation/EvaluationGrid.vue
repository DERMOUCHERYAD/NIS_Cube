<template>
  <div class="evaluation-grid">
    <div 
      v-for="section in sections" 
      :key="section.id" 
      class="section-group"
    >
      <h3 class="section-title">{{ section.title }}</h3>
      <div class="objectives-grid">
        <div 
          v-for="question in section.questions" 
          :key="question.id" 
          class="grid-item"
          :class="getAnswerClass(question.answer)"
        >
          <div class="grid-content">
            <span class="objective-number">{{ question.objective }}</span>
            <p class="objective-text">{{ question.text }}</p>
            <span class="status">{{ getStatusLabel(question.answer) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Section } from '@/types/evaluation';

const props = defineProps<{
  sections: Section[];
}>();

const getAnswerClass = (answer?: 'yes' | 'no' | 'partial') => {
  if (!answer) return 'pending';
  switch (answer) {
    case 'yes': return 'high';
    case 'partial': return 'medium';
    case 'no': return 'low';
    default: return 'pending';
  }
};

const getStatusLabel = (answer?: 'yes' | 'no' | 'partial') => {
  if (!answer) return 'Non évalué';
  switch (answer) {
    case 'yes': return 'Conforme';
    case 'partial': return 'Partiellement conforme';
    case 'no': return 'Non conforme';
    default: return 'Non évalué';
  }
};
</script>

<style scoped>
.evaluation-grid {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  color: var(--text);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-focus);
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.grid-item {
  border-radius: var(--radius);
  padding: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 160px;
}

.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.grid-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
}

.objective-number {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.objective-text {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0 0 0.75rem;
}

.status {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grid-item.high {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.grid-item.medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.grid-item.low {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.grid-item.pending {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

@media (max-width: 640px) {
  .objectives-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-item {
    min-height: 140px;
  }

  .objective-text {
    font-size: 0.8125rem;
  }
}
</style>