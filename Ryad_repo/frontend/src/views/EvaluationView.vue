<template>
  <div class="evaluation-view">
    <!-- Affichage pendant le chargement -->
    <div v-if="loading" class="loading">
      Chargement des informations de l'évaluation...
    </div>

    <!-- Affichage du message d'erreur le cas échéant -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Affichage des informations de l'évaluation si disponibles -->
    <div v-else-if="currentInfo" class="content">
      <!-- En-tête affichant l'axe actuel -->
      <header class="evaluation-header">
        <h1>Votre Axe Actuel : {{ currentInfo.current_axis.nom }}</h1>
      </header>

      <!-- Section de l'objectif courant -->
      <section class="objective-section">
        <h2>Objectif {{ currentInfo.current_objective.objectif_id }}</h2>
        <div class="objective-details">
          <h3>Description de l'objectif de sécurité</h3>
          <p>{{ currentInfo.current_objective.description }}</p>
        </div>
        <div class="objective-justification">
          <h3>Justifications et Risques Associés</h3>
          <p>{{ currentInfo.current_objective.justification_risques }}</p>
        </div>
      </section>
    </div>
  </div>
  <div class="evaluation-actions">
    <!-- Bouton pour passer à la page de question -->
    <button class="start-question-btn" @click="goToQuestion">
      Suivant
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview EvaluationView.vue
 * Ce composant affiche les informations courantes de l'évaluation en cours.
 * Il récupère l'ID de l'évaluation via le store Pinia et appelle l'API pour obtenir :
 *  - L'axe actuel (current_axis.nom)
 *  - L'objectif courant, incluant son numéro, sa description (description) et ses justifications/risques associés (justification_risques)
 *
 * @remarks
 * Le composant affiche un message de chargement pendant l'appel API et gère les erreurs éventuelles.
 */

import { ref, onMounted } from 'vue';
import axios from '@/axios-config';
import { useRouter } from 'vue-router';
import { useEvaluationStore } from '@/store/evaluationStore';

// Interface pour typer la réponse de l'API
interface CurrentInfo {
  evaluation_id: number;
  current_objective: {
    objectif_id: number;
    description: string;
    justification_risques: string;
    // Vous pouvez ajouter d'autres propriétés si nécessaire
  };
  current_axis: {
    axe_id: number;
    nom: string;
  };
}

// Références réactives pour stocker les données, l'état de chargement et les erreurs
const currentInfo = ref<CurrentInfo | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const router = useRouter();
// Récupération de l'ID de l'évaluation depuis le store Pinia
const evaluationStore = useEvaluationStore();
const currentEvaluationId = evaluationStore.currentEvaluationId;

// Récupération de l'ID de l'utilisateur depuis le localStorage
const userId = localStorage.getItem('userId');

console.log("[EvaluationView] Initialisation du composant EvaluationView.");

/**
 * Fonction pour récupérer les informations courantes de l'évaluation via l'API.
 *
 * @async
 * @function fetchCurrentInfo
 * @returns {Promise<void>} Rien (les données sont stockées dans `currentInfo`)
 */
async function fetchCurrentInfo(): Promise<void> {
  if (!currentEvaluationId) {
    error.value = "ID de l'évaluation introuvable dans le store.";
    console.error("[EvaluationView] Erreur : ID de l'évaluation introuvable dans le store.");
    return;
  }
  if (!userId) {
    error.value = "ID de l'utilisateur introuvable.";
    console.error("[EvaluationView] Erreur : ID de l'utilisateur introuvable dans le localStorage.");
    return;
  }

  loading.value = true;
  try {
    console.log("[EvaluationView] Appel GET /evaluation-flow/evaluations/" + currentEvaluationId + "/current-info avec user_id =", userId);
    const response = await axios.get(`/evaluation-flow/evaluations/${currentEvaluationId}/current-info`, {
      params: { user_id: userId }
    });
    currentInfo.value = response.data;
    console.log("[EvaluationView] Données récupérées :", response.data);
  } catch (err: any) {
    error.value = err.message || "Erreur lors de la récupération des informations.";
    console.error("[EvaluationView] Erreur lors de l'appel API :", err);
  } finally {
    loading.value = false;
  }
}

// Appel de fetchCurrentInfo lors du montage du composant
onMounted(() => {
  console.log("[EvaluationView] Composant monté, lancement de fetchCurrentInfo.");
  fetchCurrentInfo();
});

/**
 * @function goToQuestion
 * @description Redirige l'utilisateur vers la page EvaluationQuestionView.
 */
function goToQuestion() {
  console.log("[EvaluationView] Bouton pour lancer l'évaluation cliqué.");
  router.push({ name: 'evaluationQuestion' });
}
</script>

<style scoped>
.evaluation-view {
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

.evaluation-header {
  text-align: center;
  margin-bottom: 2rem;
}

.evaluation-header h1 {
  font-size: 2rem;
  color: #2c3e50;
}

.objective-section {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.objective-section h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.objective-details,
.objective-justification {
  margin-bottom: 1.5rem;
}

.objective-details h3,
.objective-justification h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2980b9;
}

.objective-details p,
.objective-justification p {
  font-size: 1rem;
  line-height: 1.6;
  color: #34495e;
}

.evaluation-actions {
  text-align: center;
  margin-top: 2rem;
}

.start-question-btn {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.start-question-btn:hover {
  background-color: #34495e;
}
</style>