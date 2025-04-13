<template>
  <div class="space-y-4">
    <!-- Barre de progression -->
    <div class="progress-container">
      <div class="progress-header">
        <small>Question {{ currentQuestionIndex + 1 }} sur {{ questions.length }}</small>
        <small>{{ Math.round(((currentQuestionIndex + 1) / questions.length) * 100) }}% complété</small>
      </div>
      <progress :value="currentQuestionIndex + 1" :max="questions.length"></progress>
    </div>

    <!-- Question actuelle -->
    <article class="question-card">
      <header>
        <small class="category">{{ currentQuestion.category }}</small>
        <h3>{{ currentQuestion.text }}</h3>
      </header>

      <!-- Explication -->
      <div class="explanation">
        <p>{{ currentQuestion.explanation }}</p>
        <div class="info-box">
          <InfoIcon class="icon" />
          <p>{{ currentQuestion.help }}</p>
        </div>
      </div>

      <!-- Options de réponse -->
      <div class="response-options">
        <label class="option">
          <input
            type="radio"
            :name="`question-${currentQuestion.id}`"
            :value="true"
            v-model="answers[currentQuestion.id]"
          />
          <span class="option-text">Oui</span>
        </label>
        <label class="option">
          <input
            type="radio"
            :name="`question-${currentQuestion.id}`"
            :value="false"
            v-model="answers[currentQuestion.id]"
          />
          <span class="option-text">Non</span>
        </label>
      </div>

      <!-- Recommandation si "Non" -->
      <div v-if="answers[currentQuestion.id] === false" class="recommendation">
        <AlertCircleIcon class="icon" />
        <p>{{ currentQuestion.recommendation }}</p>
      </div>

      <!-- Navigation -->
      <footer class="navigation">
        <button
          v-if="currentQuestionIndex > 0"
          @click="previousQuestion"
          class="outline"
        >
          Question précédente
        </button>
        <button
          v-if="currentQuestionIndex < questions.length - 1"
          @click="nextQuestion"
          class="primary"
        >
          Question suivante
        </button>
        <button
          v-if="currentQuestionIndex === questions.length - 1"
          @click="submitAssessment"
          :disabled="!isAssessmentComplete"
          class="primary"
        >
          <ClipboardCheck class="icon" />
          Terminer l'évaluation
        </button>
      </footer>

      <!-- Avertissement si incomplet -->
      <div v-if="currentQuestionIndex === questions.length - 1 && !isAssessmentComplete" class="warning">
        <AlertCircleIcon class="icon" />
        <p>
          Veuillez répondre à toutes les questions avant de terminer l'évaluation.
          Questions sans réponse : {{ unansweredQuestions.join(', ') }}
        </p>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ClipboardCheck, AlertCircle as AlertCircleIcon, Info as InfoIcon } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'complete', score: number): void
}>();

interface Question {
  id: number;
  text: string;
  category: string;
  weight: number;
  explanation: string;
  help: string;
  recommendation: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Avez-vous mis en place une politique de sécurité des systèmes d'information ?",
    category: "Gouvernance",
    weight: 10,
    explanation: "Une politique de sécurité définit les règles et procédures pour protéger vos systèmes d'information.",
    help: "Cette politique doit inclure les règles d'accès, la gestion des mots de passe, la protection des données et les procédures de sécurité.",
    recommendation: "Commencez par rédiger un document simple définissant les règles de base de sécurité. Impliquez les parties prenantes et mettez à jour régulièrement."
  },
  {
    id: 2,
    text: "Disposez-vous d'un inventaire à jour de vos actifs informatiques ?",
    category: "Gestion des actifs",
    weight: 8,
    explanation: "L'inventaire permet de connaître et suivre tous vos équipements et logiciels.",
    help: "Un bon inventaire liste les ordinateurs, serveurs, logiciels, licences et leurs configurations.",
    recommendation: "Créez un tableur listant tous vos équipements. Incluez les informations importantes comme les versions, dates d'achat et responsables."
  },
  {
    id: 3,
    text: "Avez-vous mis en place un processus de gestion des incidents de sécurité ?",
    category: "Gestion des incidents",
    weight: 9,
    explanation: "Ce processus définit comment détecter, répondre et se remettre des incidents de sécurité.",
    help: "Il doit inclure la détection, le signalement, l'analyse et la résolution des incidents.",
    recommendation: "Établissez une procédure simple de signalement des incidents et désignez des responsables pour leur gestion."
  },
  {
    id: 4,
    text: "Effectuez-vous régulièrement des sauvegardes de vos données critiques ?",
    category: "Protection des données",
    weight: 10,
    explanation: "Les sauvegardes régulières protègent contre la perte de données en cas d'incident.",
    help: "Identifiez les données critiques et définissez la fréquence des sauvegardes selon leur importance.",
    recommendation: "Mettez en place des sauvegardes automatiques quotidiennes et testez régulièrement leur restauration."
  },
  {
    id: 5,
    text: "Avez-vous mis en place une authentification forte pour les accès critiques ?",
    category: "Contrôle d'accès",
    weight: 8,
    explanation: "L'authentification forte ajoute une couche de sécurité supplémentaire aux mots de passe.",
    help: "Utilisez la double authentification (2FA) pour les accès sensibles.",
    recommendation: "Activez la double authentification sur vos comptes critiques et formez les utilisateurs à son utilisation."
  }
];

const currentQuestionIndex = ref(0);
const answers = ref<Record<number, boolean>>({});

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

const isAssessmentComplete = computed(() => {
  return questions.every(q => typeof answers.value[q.id] === 'boolean');
});

const unansweredQuestions = computed(() => {
  return questions
    .filter(q => typeof answers.value[q.id] !== 'boolean')
    .map(q => q.id);
});

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++;
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const calculateScore = () => {
  const totalWeight = questions.reduce((acc, q) => acc + q.weight, 0);
  const score = questions.reduce((acc, q) => {
    return acc + (answers.value[q.id] ? q.weight : 0);
  }, 0);
  return Math.round((score / totalWeight) * 100);
};

const submitAssessment = () => {
  if (isAssessmentComplete.value) {
    const score = calculateScore();
    emit('complete', score);
  }
};
</script>

<style>
.progress-container {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-header small {
  color: var(--muted-color);
}

progress {
  width: 100%;
  height: 0.5rem;
  border-radius: 1rem;
  background-color: var(--primary-focus);
}

progress::-webkit-progress-bar {
  background-color: var(--primary-focus);
  border-radius: 1rem;
}

progress::-webkit-progress-value {
  background-color: var(--primary);
  border-radius: 1rem;
  transition: width 0.3s ease;
}

progress::-moz-progress-bar {
  background-color: var(--primary);
  border-radius: 1rem;
  transition: width 0.3s ease;
}

.question-card {
  background: var(--card-background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.category {
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.explanation {
  margin: 1rem 0;
}

.info-box {
  background: var(--primary-focus);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-top: 0.75rem;
  display: flex;
  gap: 0.75rem;
  color: var(--primary);
}

.response-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.option {
  position: relative;
  cursor: pointer;
}

.option input {
  position: absolute;
  opacity: 0;
}

.option-text {
  display: block;
  padding: 0.75rem;
  text-align: center;
  border: 2px solid var(--form-element-border-color);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.option input:checked + .option-text {
  background: var(--primary);
  color: var(--primary-inverse);
  border-color: var(--primary);
}

.recommendation {
  background: var(--card-border-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.warning {
  background: var(--card-border-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  color: var(--form-element-invalid-color);
}

.icon {
  flex-shrink: 0;
}
</style>