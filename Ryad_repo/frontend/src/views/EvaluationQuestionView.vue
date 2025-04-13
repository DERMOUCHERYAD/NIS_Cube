<template>
    <div class="evaluation-question-view">
      <!-- Affichage de l'état de chargement -->
      <div v-if="loading" class="loading">
        Chargement de la question...
      </div>
  
      <!-- Affichage d'une erreur le cas échéant -->
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
  
      <!-- Affichage du contenu si une question est disponible -->
      <div v-else-if="question" class="content">
        <div class="question-container">
          <h2>Question {{ question.question_id }}</h2>
          <p class="question-text">{{ question.intitule }}</p>
        </div>
  
        <!-- Zone d'entrée de réponse selon le type de la question -->
        <div class="answer-input">
          <!-- Pour les questions de type BINAIRE -->
          <div v-if="question.answer_type === 'BINAIRE'">
            <p>Votre réponse :</p>
            <button @click="selectBinary(true)" :class="{selected: answerBinary === true}">Oui</button>
            <button @click="selectBinary(false)" :class="{selected: answerBinary === false}">Non</button>
          </div>
  
          <!-- Pour les questions de type TEXTUEL -->
          <div v-else-if="question.answer_type === 'TEXTUEL'">
            <p>Votre réponse :</p>
            <!-- Limitation de la saisie à 255 caractères pour éviter les injections SQL -->
            <input 
              type="text" 
              v-model="answerText" 
              maxlength="255" 
              placeholder="Entrez votre réponse" 
            />
          </div>
  
          <!-- Pour les questions de type ENTIER -->
          <div v-else-if="question.answer_type === 'ENTIER'">
            <p>Votre réponse (nombre) :</p>
            <input 
              type="number" 
              v-model.number="answerInteger" 
              placeholder="Entrez un nombre" 
            />
          </div>
  
          <!-- Pour les questions de type DATE -->
          <div v-else-if="question.answer_type === 'DATE'">
            <p>Votre réponse (date) :</p>
            <input 
              type="date" 
              v-model="answerDate" 
            />
          </div>
        </div>
      </div>
  
      <!-- Message affiché si aucune question n'est disponible -->
      <div v-else class="no-question">
        <p>Aucune question valide trouvée pour cette évaluation.</p>
      </div>
  
      <!-- Bouton d'action en bas à droite pour valider la réponse et passer à la question suivante -->
      <div class="action-button">
        <button @click="handleNextQuestion">
          Valider et Passer à la question suivante
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  /**
   * @fileoverview EvaluationQuestionView.vue
   * Ce composant affiche la prochaine question non répondue et permet à l'utilisateur d'y répondre.
   *
   * Il récupère l'ID de l'évaluation depuis le store Pinia et appelle l'API pour charger la question via
   * GET /evaluation-flow/evaluations/:evaluation_id/next-question. 
   * Selon le type de la question, une interface adaptée est affichée (binaire, entier, textuel, date).
   *
   * Après la soumission de la réponse via POST /evaluation-flow/reponses, la fonction vérifie
   * via GET /evaluation-flow/evaluations/:evaluation_id/verify-next-objective
   * si la prochaine question correspond à un nouvel objectif et redirige le cas échéant, 
   * sinon recharge la question suivante.
   */
  
  import { ref, onMounted } from 'vue';
  import axios from '@/axios-config';
  import { useEvaluationStore } from '@/store/evaluationStore';
  import { useRouter } from 'vue-router';
  
  /**
   * Interface décrivant la structure d'une question.
   */
  interface Question {
    question_id: number;
    intitule: string;
    answer_type: 'BINAIRE' | 'ENTIER' | 'TEXTUEL' | 'DATE';
    min_score?: number;
    // D'autres champs (pour_ei, is_dependent, etc.) peuvent être ajoutés si nécessaire
  }
  
  // Références réactives pour la question, l'état de chargement et les erreurs
  const question = ref<Question | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
  // Références pour stocker la réponse saisie par l'utilisateur
  const answerBinary = ref<boolean | null>(null);
  const answerText = ref<string>('');
  const answerInteger = ref<number | null>(null);
  const answerDate = ref<string>('');
  
  // Récupérer l'ID de l'évaluation depuis le store Pinia et l'ID de l'utilisateur depuis le localStorage
  const evaluationStore = useEvaluationStore();
  const currentEvaluationId = evaluationStore.currentEvaluationId;
  const userId = localStorage.getItem('userId');
  
  const router = useRouter();
  
  console.log("[EvaluationQuestionView] Initialisation du composant EvaluationQuestionView.");
  
  /**
   * Charge la prochaine question non répondue via l'API.
   * @async
   * @function loadNextQuestion
   */
  async function loadNextQuestion(): Promise<void> {
    if (!currentEvaluationId || !userId) {
      error.value = "ID d'évaluation ou d'utilisateur manquant.";
      console.error("[EvaluationQuestionView] Erreur: ID d'évaluation ou d'utilisateur manquant.");
      return;
    }
    loading.value = true;
    try {
      console.log("[EvaluationQuestionView] Appel GET /evaluation-flow/evaluations/" + currentEvaluationId + "/next-question avec user_id =", userId);
      const response = await axios.get(`/evaluation-flow/evaluations/${currentEvaluationId}/next-question`, {
        params: { user_id: userId }
      });
      question.value = response.data;
      console.log("[EvaluationQuestionView] Question récupérée:", response.data);
      // Réinitialiser les réponses précédentes
      answerBinary.value = null;
      answerText.value = '';
      answerInteger.value = null;
      answerDate.value = '';
    } catch (err: any) {
      error.value = err.message || "Erreur lors du chargement de la question.";
      console.error("[EvaluationQuestionView] Erreur lors du chargement de la question:", err);
      question.value = null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Gère la validation de la réponse et le passage à la question suivante.
   * Envoie les données nécessaires via POST /evaluation-flow/reponses (postAnswer).
   * @async
   * @function handleNextQuestion
   */
  async function handleNextQuestion(): Promise<void> {
    if (!question.value || !currentEvaluationId || !userId) {
      error.value = "Données manquantes pour soumettre la réponse.";
      console.error("[EvaluationQuestionView] Erreur: Données manquantes pour soumettre la réponse.");
      return;
    }
  
    // Construction du payload minimal requis par postAnswer
    const payload: any = {
      evaluation_id: currentEvaluationId,
      user_id: userId,
      question_id: question.value.question_id
    };
  
    // Ajout de la réponse en fonction du type de la question
    if (question.value.answer_type === 'BINAIRE') {
      if (answerBinary.value === null) {
        error.value = "Veuillez sélectionner une réponse (Oui ou Non).";
        console.error("[EvaluationQuestionView] Erreur: Réponse binaire non sélectionnée.");
        return;
      }
      payload.donnee_boolean = answerBinary.value;
    } else if (question.value.answer_type === 'TEXTUEL') {
      if (!answerText.value || answerText.value.trim() === '') {
        error.value = "Veuillez entrer une réponse textuelle.";
        console.error("[EvaluationQuestionView] Erreur: Réponse textuelle vide.");
        return;
      }
      payload.donnee_textuelle = answerText.value.trim().substring(0, 255);
    } else if (question.value.answer_type === 'ENTIER') {
      if (answerInteger.value === null || isNaN(answerInteger.value)) {
        error.value = "Veuillez entrer un nombre valide.";
        console.error("[EvaluationQuestionView] Erreur: Réponse entière invalide.");
        return;
      }
      payload.donnee_entiere = answerInteger.value;
    } else if (question.value.answer_type === 'DATE') {
      if (!answerDate.value) {
        error.value = "Veuillez sélectionner une date.";
        console.error("[EvaluationQuestionView] Erreur: Réponse de type date non fournie.");
        return;
      }
      payload.donnee_date = answerDate.value;
    } else {
      error.value = "Type de question inconnu.";
      console.error("[EvaluationQuestionView] Erreur: Type de question inconnu.", question.value.answer_type);
      return;
    }
  
    try {
      console.log("[EvaluationQuestionView] Envoi de la réponse via POST /evaluation-flow/reponses avec payload:", payload);
      const postResponse = await axios.post('/evaluation-flow/reponses', payload);
      console.log("[EvaluationQuestionView] Réponse enregistrée:", postResponse.data);
  
      // Vérification de l'objectif suivant via GET /evaluation-flow/evaluations/:evaluation_id/verify-next-objective
      console.log("[EvaluationQuestionView] Vérification de l'objectif suivant via GET /evaluation-flow/evaluations/" + currentEvaluationId + "/verify-next-objective?user_id=", userId);
      const verifyResponse = await axios.get(`/evaluation-flow/evaluations/${currentEvaluationId}/verify-next-objective`, {
        params: { user_id: userId }
      });
      console.log("[EvaluationQuestionView] Vérification de l'objectif:", verifyResponse.data);
      
      // Si l'objectif a été finalisé, rediriger vers la page d'évaluation
      if (verifyResponse.data.new_objective_finalized) {
        console.log("[EvaluationQuestionView] Nouvel objectif finalisé, redirection vers la page d'évaluation.");
        router.push({ name: 'evaluation' });
      } else {
        console.log("[EvaluationQuestionView] Chargement de la prochaine question.");
        await loadNextQuestion();
      }
    } catch (err: any) {
      error.value = err.message || "Erreur lors de l'enregistrement de la réponse.";
      console.error("[EvaluationQuestionView] Erreur lors de la soumission de la réponse:", err);
    }
  }
  
  /**
   * Définit la réponse pour un type de question binaire.
   * @function selectBinary
   * @param {boolean} value - La valeur sélectionnée (true pour Oui, false pour Non)
   */
  function selectBinary(value: boolean): void {
    console.log("[EvaluationQuestionView] Réponse binaire sélectionnée:", value);
    answerBinary.value = value;
  }
  
  // Charger la première question lors du montage du composant
  onMounted(() => {
    console.log("[EvaluationQuestionView] Composant monté, chargement de la première question.");
    loadNextQuestion();
  });
  </script>
  
  <style scoped>
  .evaluation-question-view {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: Arial, sans-serif;
  }
  
  .loading,
  .error {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 2rem;
    color: #555;
  }
  
  .question-container {
    margin-bottom: 1.5rem;
  }
  
  .question-container h2 {
    font-size: 1.75rem;
    color: #2c3e50;
  }
  
  .question-text {
    font-size: 1.25rem;
    color: #34495e;
  }
  
  .answer-input {
    margin-bottom: 2rem;
  }
  
  .answer-input p {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .answer-input button {
    margin-right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f0f0f0;
  }
  
  .answer-input button.selected {
    background-color: #2980b9;
    color: white;
    border-color: #2980b9;
  }
  
  .answer-input input[type="text"],
  .answer-input input[type="number"],
  .answer-input input[type="date"] {
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .action-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
  }
  
  .action-button button {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: background-color 0.3s ease;
  }
  
  .action-button button:hover {
    background-color: #34495e;
  }
  </style>  