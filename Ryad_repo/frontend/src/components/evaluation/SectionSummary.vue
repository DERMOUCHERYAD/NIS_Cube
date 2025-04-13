<template>
  <article class="section-summary">
    <header>
      <h2>{{ section.title }} - Résumé</h2>
      <div class="score-display">
        <div class="score-circle" :class="scoreClass">
          {{ score }}%
        </div>
        <p class="score-label">{{ getScoreLabel(score) }}</p>
      </div>
    </header>

    <div class="summary-content">
      <div class="recommendations" v-if="recommendations.length > 0">
        <h3>
          <AlertTriangle class="icon" />
          Points d'amélioration
        </h3>
        <ul class="recommendations-list">
          <li v-for="(rec, index) in recommendations" :key="index">
            <div class="recommendation-item">
              <div class="rec-header">
                <strong>Question {{ rec.objective }}</strong>
                <span class="status" :class="rec.answer">
                  {{ getStatusLabel(rec.answer) }}
                </span>
              </div>
              <p class="rec-text">{{ rec.recommendation }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div v-else class="success-message">
        <CheckCircle2 class="icon" />
        <p>Excellent ! Vous respectez toutes les exigences de cette section.</p>
      </div>

      <div class="actions">
        <button class="primary" @click="$emit('continue')">
          <ArrowRight class="icon" />
          Continuer l'évaluation
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-vue-next';
import type { Section, Question } from '@/types/evaluation';

const props = defineProps<{
  section: Section;
}>();

defineEmits<{
  (e: 'continue'): void;
}>();

const score = computed(() => {
  const answeredQuestions = props.section.questions.filter(q => q.answer);
  if (answeredQuestions.length === 0) return 0;

  const score = answeredQuestions.reduce((acc, q) => {
    if (q.answer === 'yes') return acc + 1;
    if (q.answer === 'partial') return acc + 0.5;
    return acc;
  }, 0);

  return Math.round((score / props.section.questions.length) * 100);
});

const scoreClass = computed(() => {
  if (score.value >= 80) return 'high';
  if (score.value >= 60) return 'medium';
  return 'low';
});

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Conforme';
  if (score >= 60) return 'Partiellement conforme';
  return 'Non conforme';
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'no': return 'Non conforme';
    case 'partial': return 'Partiellement conforme';
    default: return 'Conforme';
  }
};

const recommendations = computed(() => {
  return props.section.questions.filter(q => q.answer !== 'yes').map(q => ({
    objective: q.objective,
    answer: q.answer,
    recommendation: q.recommendation
  }));
});
</script>

<style scoped>
.section-summary {
  background: var(--white);
  border-radius: var(--radius);
  padding: 2rem;
  margin-bottom: 2rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

header h2 {
  margin: 0;
  color: var(--text);
}

.score-display {
  text-align: center;
}

.score-circle {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.score-circle.high {
  background: #22c55e;
}

.score-circle.medium {
  background: #f59e0b;
}

.score-circle.low {
  background: #ef4444;
}

.score-label {
  margin: 0;
  font-weight: 500;
}

.recommendations {
  margin-bottom: 2rem;
}

.recommendations h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.recommendations-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.recommendation-item {
  background: var(--background);
  border-radius: var(--radius);
  padding: 1rem;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status.no {
  background: #fee2e2;
  color: #ef4444;
}

.status.partial {
  background: #fef3c7;
  color: #f59e0b;
}

.rec-text {
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
  line-height: 1.5;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #dcfce7;
  border-radius: var(--radius);
  color: #22c55e;
  margin-bottom: 2rem;
}

.success-message p {
  margin: 0;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.actions button.primary {
  background: var(--primary);
  color: white;
}

.actions button.primary:hover {
  background: var(--primary-hover);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 640px) {
  .section-summary {
    padding: 1.5rem;
  }

  header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
}
</style>