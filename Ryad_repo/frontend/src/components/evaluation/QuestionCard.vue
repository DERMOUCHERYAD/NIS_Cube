<template>
  <div class="question-card">
    <div class="question-header">
      <span class="objective-tag">{{ question.objective }}</span>
      <h3>{{ question.text }}</h3>
    </div>

    <!-- Questions binaires (Oui/Non/Partiellement) -->
    <div v-if="question.type === 'binary'" class="answer-options">
      <label
        v-for="option in binaryOptions"
        :key="option.value"
        class="answer-option"
      >
        <input 
          type="radio" 
          :value="option.value"
          :name="'q_' + question.id"
          :checked="modelValue === option.value"
          @change="$emit('update:modelValue', option.value)"
        >
        <span>{{ option.label }}</span>
      </label>
    </div>

    <!-- Questions avec note de 0 à 10 -->
    <div v-else-if="question.type === 'score'" class="score-input">
      <div class="score-slider">
        <input 
          type="range" 
          min="0" 
          max="10" 
          step="1"
          :value="modelValue as number"
          @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        >
        <div class="score-labels">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
      <div class="score-value">
        <span>Note actuelle : {{ modelValue || 0 }}/10</span>
      </div>
      <div class="score-description">
        <small>
          0 = Non conforme
          <br>5 = Partiellement conforme
          <br>10 = Totalement conforme
        </small>
      </div>
    </div>

    <!-- Questions textuelles -->
    <div v-else-if="question.type === 'text'" class="text-input">
      <input 
        type="text"
        :value="modelValue as string"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        placeholder="Saisissez votre réponse..."
      >
    </div>

    <!-- Questions date -->
    <div v-else-if="question.type === 'date'" class="date-input">
      <input 
        type="date"
        :value="modelValue as string"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Questions numériques -->
    <div v-else-if="question.type === 'number'" class="number-input">
      <input 
        type="number"
        :value="modelValue as number"
        @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        placeholder="Entrez un nombre..."
        min="0"
      >
    </div>

    <!-- Aide contextuelle -->
    <div v-if="question.help" class="help-text">
      <Info class="icon" />
      <p>{{ question.help }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next';

/**
 * Petit type local correspondant à la structure
 * d'une question simplifiée pour l'affichage du front-end.
 */
interface DisplayQuestion {
  id: number;
  objective: string;
  text: string;
  type: 'binary' | 'score' | 'text' | 'date' | 'number';
  help?: string;
}

/**
 * Props
 * - question : l'objet question à afficher
 * - modelValue : la valeur actuelle de la réponse
 */
const props = defineProps<{
  question: DisplayQuestion;
  modelValue?: string | boolean | number | Date | 'partial';
}>();

/**
 * On émet l'événement "update:modelValue" pour informer le parent d'un changement de valeur.
 */
defineEmits<{
  (e: 'update:modelValue', value: string | boolean | number | Date | 'partial'): void;
}>();

// Options pour les questions binaires (Oui, Partiellement, Non)
const binaryOptions = [
  { value: true, label: 'Oui' },
  { value: 'partial', label: 'Partiellement' },
  { value: false, label: 'Non' }
];
</script>

<style scoped>
.question-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.question-header {
  margin-bottom: 1.5rem;
}

.objective-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-focus);
  color: var(--primary);
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.question-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.25rem;
  line-height: 1.4;
}

.answer-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.answer-option {
  position: relative;
  cursor: pointer;
}

.answer-option input {
  position: absolute;
  opacity: 0;
}

.answer-option span {
  display: block;
  padding: 0.75rem;
  text-align: center;
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.answer-option input:checked + span {
  border-color: var(--primary);
  font-weight: 500;
}

/* Styles spécifiques pour chaque type de réponse binaire */
.answer-option input[value="true"]:checked + span {
  background: #dcfce7;
  border-color: #22c55e;
  color: #166534;
}

.answer-option input[value="partial"]:checked + span {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.answer-option input[value="false"]:checked + span {
  background: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
}

.answer-option:hover span {
  border-color: var(--primary);
}

/* Slider pour le score */
.score-input {
  padding: 1rem 0;
}

.score-slider {
  margin-bottom: 1rem;
}

.score-slider input[type="range"] {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  background: var(--primary-focus);
  border-radius: 4px;
  outline: none;
  margin: 1rem 0;
}

.score-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.score-slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.score-labels {
  display: flex;
  justify-content: space-between;
  color: var(--text-light);
  font-size: 0.875rem;
}

.score-value {
  text-align: center;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--primary);
  margin: 1rem 0;
}

.score-description {
  text-align: center;
  color: var(--text-light);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Inputs texte, date, number */
.text-input input,
.date-input input,
.number-input input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--background);
}

.text-input input:focus,
.date-input input:focus,
.number-input input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-focus);
  background: white;
}

/* Aide contextuelle */
.help-text {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--primary-focus);
  border-radius: var(--radius);
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.help-text .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary);
  flex-shrink: 0;
}

.help-text p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .answer-options {
    grid-template-columns: 1fr;
  }

  .question-card {
    padding: 1rem;
  }

  .question-header h3 {
    font-size: 1.125rem;
  }
}
</style>
