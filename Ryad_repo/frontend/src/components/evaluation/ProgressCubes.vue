<template>
  <div class="progress-cubes">
    <div 
      v-for="(section, index) in sections" 
      :key="section.id"
      class="cube"
      :class="getStatusClass(section, index)"
      :title="`${section.title}: ${section.completed ? section.score + '%' : 'Non complété'}`"
    >
      {{ index + 1 }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Section } from '@/types/evaluation';

const props = defineProps<{
  sections: Section[];
  currentSectionIndex: number;
}>();

const getStatusClass = (section: Section, index: number) => ({
  'completed': section.completed,
  'current': index === props.currentSectionIndex,
  'low': section.completed && section.score < 50,
  'medium': section.completed && section.score >= 50 && section.score < 80,
  'high': section.completed && section.score >= 80
});
</script>

<style scoped>
.progress-cubes {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cube {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-weight: 600;
  color: var(--text);
  transition: all 0.3s ease;
}

.cube.completed { border-color: var(--primary); }
.cube.current {
  background: var(--primary-focus);
  border-color: var(--primary);
  color: var(--primary);
}
.cube.low {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}
.cube.medium {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #f59e0b;
}
.cube.high {
  background: #dcfce7;
  border-color: #22c55e;
  color: #22c55e;
}
</style>