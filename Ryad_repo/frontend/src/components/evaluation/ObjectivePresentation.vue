<template>
  <div class="objective-presentation">
    <div class="objective-header">
      <h2>{{ objective.title }}</h2>
      <div class="objective-id">Objectif {{ objective.id }}</div>
    </div>
    
    <div class="description-box">
      <h3>Description de l'objectif</h3>
      <p>{{ objective.description }}</p>
    </div>
    
    <div class="justification-box">
      <h3>Justification</h3>
      <p>{{ objective.justification }}</p>
    </div>
    
    <div class="risks-box">
      <AlertTriangle class="icon" />
      <div>
        <h3>Risques associés</h3>
        <p>{{ objective.risks }}</p>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="start-button" @click="$emit('start')">
        <PlayIcon class="icon" />
        Commencer l'évaluation de cet objectif
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Play as PlayIcon } from 'lucide-vue-next';

/**
 * Type local pour l'affichage d'un objectif, distinct
 * de l'interface Objectif de la base si vous le souhaitez.
 */
interface DisplayObjective {
  id: string;
  title: string;
  description: string;
  justification: string;
  risks: string;
}

/**
 * Le composant reçoit un "objective" contenant
 * les informations à afficher (titre, justification, etc.).
 */
const props = defineProps<{
  objective: DisplayObjective;
}>();

/**
 * Emission d'un événement "start" quand l'utilisateur
 * clique sur le bouton pour démarrer l'évaluation.
 */
defineEmits<{
  (e: 'start'): void;
}>();
</script>

<style scoped>
.objective-presentation {
  background: var(--white);
  border-radius: var(--radius);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.objective-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.objective-header h2 {
  margin: 0;
  color: var(--text);
  font-size: 1.5rem;
}

.objective-id {
  background: var(--primary-focus);
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.description-box,
.justification-box {
  background: var(--background);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.description-box h3,
.justification-box h3,
.risks-box h3 {
  color: var(--primary);
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
}

.description-box p,
.justification-box p,
.risks-box p {
  margin: 0;
  color: var(--text);
  line-height: 1.6;
}

.risks-box {
  background: #fee2e2;
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.risks-box .icon {
  color: #ef4444;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.start-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .objective-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
