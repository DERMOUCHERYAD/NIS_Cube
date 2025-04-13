<template>
  <div class="dashboard">
    <!-- En-tête du tableau de bord -->
    <header class="dashboard-header">
      <div class="welcome-section">
        <!-- Affichage du nom d'utilisateur récupéré via l'API -->
        <h1>
          Bonjour<span v-if="username">, {{ username }}</span> 👋
        </h1>
        <p>Bienvenue sur votre tableau de bord NIS CUBE</p>
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Affichage conditionnel : si des évaluations existent -->
      <template v-if="hasEvaluations">
        <div class="evaluations-overview">
          <h2>Vos évaluations</h2>

          <!-- Boucle pour afficher TOUTES les évaluations dans le même style -->
          <article v-for="(evaluation, idx) in evaluationDisplays" :key="evaluation.id || idx"
            class="evaluation-card latest">
            <div class="card-header">
              <div class="evaluation-info">
                <h3>{{ evaluation.name }}</h3>
                <div class="meta-info">
                  <span class="date">
                    <Calendar class="icon" />
                    {{ evaluation.date }}
                  </span>
                  <span class="entity-type">
                    <Shield v-if="evaluation.entityType === 'essential'" class="icon" />
                    <ShieldCheck v-else class="icon" />
                    {{ evaluation.entityType === 'essential'
                      ? 'Entité essentielle'
                      : 'Entité importante'
                    }}
                  </span>
                </div>
              </div>
              <div class="score-badge" :class="getScoreClass(evaluation.score)">
                {{ evaluation.score }}%
              </div>
            </div>

            <div class="card-content">
              <!-- Affichage des trois barres de progression pour la conformité -->
              <div class="progress-summary">
                <div class="progress-item" v-for="(status, sIndex) in evaluation.statusSummary" :key="sIndex">
                  <span class="status-label">{{ status.label }}</span>
                  <div class="progress-bar">
                    <div class="progress" :class="status.class" :style="{ width: status.percentage + '%' }"></div>
                  </div>
                  <span class="status-count">{{ status.count }}</span>
                </div>
              </div>

              <div class="card-actions">
                <!-- 
                  1) "Voir les détails" et "Exporter en PDF" 
                     => visibles uniquement si l'évaluation est terminée (score=100).
                -->
                <template v-if="evaluation.score === 100">
                  <RouterLink :to="`/evaluations/${evaluation.id}`" class="view-details">
                    <Eye class="icon" />
                    Voir les détails
                  </RouterLink>
                  <button class="export-btn" @click="exportPDF(evaluation)">
                    <FileText class="icon" />
                    Exporter en PDF
                  </button>
                </template>

                <!--
                  2) Bouton unique (Commencer / Continuer / Modifier),
                     affiché en toutes circonstances, 
                     mais avec un label qui dépend du score.
                -->
                <button class="eval-action-btn" @click="handleEvalAction(evaluation)">
                  <template v-if="evaluation.score === 0">
                    <Play class="icon" />
                  </template>
                  <template v-else-if="evaluation.score > 0 && evaluation.score < 100">
                    <RefreshCw class="icon" />
                  </template>
                  <template v-else>
                    <Edit class="icon" />
                  </template>
                  {{ getEvalActionLabel(evaluation.score) }}
                </button>
              </div>
            </div>
          </article>

          <!-- Résumé global des évaluations -->
          <div class="evaluations-summary">
            <article class="summary-card">
              <div class="summary-icon high">
                <TrendingUp class="icon" />
              </div>
              <div class="summary-content">
                <h4>Score moyen</h4>
                <p class="summary-value">{{ averageScore }}%</p>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon medium">
                <Activity class="icon" />
              </div>
              <div class="summary-content">
                <h4>Évaluations complétées</h4>
                <p class="summary-value">{{ completedEvaluations }}</p>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon low">
                <Clock class="icon" />
              </div>
              <div class="summary-content">
                <h4>Dernière évaluation</h4>
                <p class="summary-value">{{ daysSinceLastEvaluation }} jours</p>
              </div>
            </article>
          </div>

          <!-- Actions rapides -->
          <div class="quick-actions">
            <button class="action-btn primary" @click="showModal = true">
              <PlusCircle class="icon" />
              Nouvelle évaluation
            </button>
            <RouterLink to="/historique" class="action-btn secondary">
              <History class="icon" />
              Voir l'historique
            </RouterLink>
          </div>
        </div>
      </template>

      <!-- Affichage si aucune évaluation n'existe -->
      <template v-else>
        <article class="evaluation-card noeval">
          <div class="card-content invite-centered">
            <div class="card-icon">
              <ClipboardCheck class="icon" />
            </div>
            <h2>Commencer une évaluation NIS2</h2>
            <p>
              Évaluez votre niveau de conformité avec la directive NIS2
              et obtenez des recommandations personnalisées pour améliorer votre cybersécurité.
            </p>
            <div class="no-evaluations-message">
              <AlertCircle class="alert-icon" />
              <p>
                Vous n'avez pas encore effectué d'évaluation. Commencez dès maintenant pour mesurer votre niveau de
                conformité.
              </p>
            </div>
            <ul class="feature-list">
              <li>
                <CheckCircle class="check-icon" />
                <span>Questionnaire adapté à votre type d'entité</span>
              </li>
              <li>
                <CheckCircle class="check-icon" />
                <span>Rapport détaillé avec score de conformité</span>
              </li>
              <li>
                <CheckCircle class="check-icon" />
                <span>Recommandations d'amélioration ciblées</span>
              </li>
              <li>
                <CheckCircle class="check-icon" />
                <span>Certificat d'évaluation téléchargeable</span>
              </li>
            </ul>
            <button class="start-btn centered" @click="showModal = true">
              <Play class="btn-icon" />
              Commencer l'évaluation
            </button>
          </div>
        </article>
      </template>
    </div>

    <footer class="container">
      <small>© 2025 NIS CUBE. Tous droits réservés.</small>
    </footer>

    <!-- Modal pour créer une évaluation -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <NewEvaluationForm @start="handleCreateEvaluation" @cancel="showModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview Composant HomeView
 * Ce composant affiche le tableau de bord de l'utilisateur, avec la liste de ses évaluations.
 * - Chaque évaluation a un pourcentage de progression (score).
 * - Les boutons "Voir les détails" et "Exporter en PDF" ne sont visibles que si score=100%.
 * - Un bouton unique (Commencer / Continuer / Modifier) est affiché à droite, son label dépend de score :
 *    - 0% => "Commencer"
 *    - 1-99% => "Continuer"
 *    - 100% => "Modifier"
 * Le code ci-dessous se concentre sur l'affichage et la logique de base (logs).
 */

import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import axios from '@/axios-config';

// Import du store Pinia pour gérer l'ID de l'évaluation
import { useEvaluationStore } from '@/store/evaluationStore';

// Composant enfant => formulaire création d'évaluation
import NewEvaluationForm from '../components/NewEvaluationForm.vue';

// Icônes lucide-vue-next
import {
  ClipboardCheck,
  CheckCircle,
  Play,
  AlertCircle,
  Calendar,
  Shield,
  ShieldCheck,
  Eye,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  PlusCircle,
  History,
  RefreshCw,
  Edit
} from 'lucide-vue-next';

import { jsPDF } from 'jspdf';

/**
 * userId et token => localStorage
 */
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token') || '';

/**
 * username => récupéré via GET /utilisateurs/:id
 */
const username = ref('');

/**
 * dashboardData => tableau d'évaluations (GET /evaluations/dashboard/user/:userId)
 */
const dashboardData = ref<any[]>([]);

// État => modal "Nouvelle évaluation"
const showModal = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// Instanciation du router et du store
const router = useRouter();
const evaluationStore = useEvaluationStore();

/**
 * Au montage => récupérer userName + dashboard
 */
onMounted(async () => {
  if (!userId) {
    console.error("[HomeView] userId absent => impossible de fetch");
    return;
  }
  await fetchUserName(userId);
  await fetchDashboard(userId);
});

/**
 * @function fetchUserName
 * @description Récupère le nom d'utilisateur via GET /utilisateurs/:id
 * @param {string} userId - L'ID de l'utilisateur
 */
async function fetchUserName(userId: string) {
  try {
    console.log("[HomeView] GET /utilisateurs/" + userId);
    const { data } = await axios.get(`/utilisateurs/${userId}`);
    username.value = data.username || '';
    console.log("[HomeView] username =", username.value);
  } catch (err) {
    console.error("[HomeView] Erreur fetchUserName:", err);
  }
}

/**
 * @function fetchDashboard
 * @description Récupère la liste d'évaluations via GET /evaluations/dashboard/user/:userId
 * @param {string} userId - L'ID de l'utilisateur
 */
async function fetchDashboard(userId: string) {
  try {
    loading.value = true;
    console.log("[HomeView] GET /evaluations/dashboard/user/" + userId);
    const { data } = await axios.get(`/evaluations/dashboard/user/${userId}`);
    dashboardData.value = Array.isArray(data) ? data : [];
    console.log("[HomeView] dashboardData =", dashboardData.value);
  } catch (err: any) {
    error.value = err.message;
    console.error("[HomeView] Erreur fetchDashboard:", err);
  } finally {
    loading.value = false;
  }
}

/**
 * @function handleCreateEvaluation
 * @description Crée une évaluation via POST /evaluations en incluant le nombre de systèmes d'information.
 * @param {{ name: string, entityType: string, nombre_si: number }} payload - Données saisies (nom, type d'entité et nombre de SI)
 */
async function handleCreateEvaluation({ name, entityType, nombre_si }: { name: string, entityType: string, nombre_si: number }) {
  console.log("[HomeView] handleCreateEvaluation déclenché avec les données :", { name, entityType, nombre_si });

  // Vérifier que l'ID de l'utilisateur est présent avant de continuer
  if (!userId) {
    console.error("[HomeView] userId absent => impossible de créer l'évaluation");
    return;
  }

  try {
    // Préparation du corps de la requête en incluant le nouveau champ nombre_si
    const body = {
      user_id: userId,
      nom: name,
      entityType,    // "essential" ou "important"
      nombre_si      // Nombre de systèmes d'information saisi par l'utilisateur
    };
    console.log("[HomeView] POST /evaluations - Corps de la requête :", body);

    // Envoi de la requête POST pour créer l'évaluation
    await axios.post('/evaluations', body);
    console.log("[HomeView] Évaluation créée avec succès");

    // Fermeture du modal et rafraîchissement du tableau de bord
    showModal.value = false;
    await fetchDashboard(userId);
  } catch (err) {
    console.error("[HomeView] Erreur lors de la création de l'évaluation :", err);
  }
}

/**
 * @constant hasEvaluations
 * @type {import('vue').ComputedRef<boolean>}
 * @description Vrai/faux => y a-t-il au moins une évaluation ?
 */
const hasEvaluations = computed(() => Array.isArray(dashboardData.value) && dashboardData.value.length > 0);

/**
 * @constant evaluationDisplays
 * @type {import('vue').ComputedRef<Array<Object>>}
 * @description Transforme chaque évaluation en objet { id, name, date, score, entityType, statusSummary }
 */
const evaluationDisplays = computed(() => {
  if (!hasEvaluations.value) return [];
  return dashboardData.value.map((e: any) => {
    const typeMap: Record<string, string> = { EE: 'essential', EI: 'important' };
    const entityType = typeMap[e.type_entite] || 'important';
    const score = e.progress_pct || 0;

    // Calcul des pourcentages de réponses conformes, partiellement conformes et non conformes
    const answered = e.answered_questions || 0;
    const pct_conforme = answered > 0 ? Math.round((e.nb_conforme / answered) * 100) : 0;
    const pct_partiel = answered > 0 ? Math.round((e.nb_partiellement / answered) * 100) : 0;
    const pct_nonconf = answered > 0 ? Math.round((e.nb_nonconforme / answered) * 100) : 0;

    // statusSummary => barres de progression
    const statusSummary = [
      { label: 'Conforme', count: e.nb_conforme || 0, percentage: pct_conforme, class: 'high' },
      { label: 'Partiellement conforme', count: e.nb_partiellement || 0, percentage: pct_partiel, class: 'medium' },
      { label: 'Non conforme', count: e.nb_nonconforme || 0, percentage: pct_nonconf, class: 'low' }
    ];

    return {
      id: e.evaluation_id,
      name: e.nom,
      date: new Date(e.date_derniere_modification).toLocaleDateString('fr-FR'),
      score, // % progression
      entityType,
      statusSummary
    };
  });
});

/**
 * @constant averageScore
 * @type {import('vue').ComputedRef<number>}
 * @description Score moyen => moyenne des progress_pct
 */
const averageScore = computed(() => {
  if (!hasEvaluations.value) return 0;
  const total = dashboardData.value.reduce((acc: number, ev: any) => acc + (ev.progress_pct || 0), 0);
  return Math.round(total / dashboardData.value.length);
});

/**
 * @constant completedEvaluations
 * @type {import('vue').ComputedRef<number>}
 * @description Nombre d'évaluations terminées (score=100)
 */
const completedEvaluations = computed(() => {
  if (!hasEvaluations.value) return 0;
  return dashboardData.value.filter((ev: any) => ev.progress_pct === 100).length;
});

/**
 * @constant daysSinceLastEvaluation
 * @type {import('vue').ComputedRef<number>}
 * @description Nombre de jours écoulés depuis la plus récente évaluation
 */
const daysSinceLastEvaluation = computed(() => {
  if (!hasEvaluations.value) return 0;
  const lastDate = new Date(dashboardData.value[0].date_derniere_modification).getTime();
  return Math.floor((Date.now() - lastDate) / (1000 * 60 * 60 * 24));
});

/**
 * @function getScoreClass
 * @description Renvoie une classe CSS ("high", "medium", "low") en fonction du score
 * @param {number} score - Le score de progression
 * @returns {string} - La classe CSS correspondante
 */
function getScoreClass(score: number) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

/**
 * @function exportPDF
 * @description Génère et télécharge un PDF contenant les informations de l'évaluation
 * @param {Object} evaluation - L'objet évaluation à exporter
 */
function exportPDF(evaluation: any) {
  console.log("[HomeView] exportPDF =>", evaluation);
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Rapport d'évaluation NIS2", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Nom: ${evaluation.name}`, 20, 40);
  doc.text(`Date: ${evaluation.date}`, 20, 50);
  doc.text(`Score global: ${evaluation.score}%`, 20, 60);

  doc.setFont("helvetica", "bold");
  doc.text("Résumé des objectifs", 20, 80);

  evaluation.statusSummary.forEach((st: any, i: number) => {
    doc.setFont("helvetica", "normal");
    doc.text(
      `${st.label}: ${st.count} réponses (${Math.round(st.percentage)}%)`,
      25,
      95 + i * 10
    );
  });

  doc.save("evaluation-nis2.pdf");
}

/**
 * @function getEvalActionLabel
 * @description Retourne le label du bouton unique selon le score
 * @param {number} score - Pourcentage d'avancement (progress_pct)
 * @returns {string} "Commencer", "Continuer" ou "Modifier"
 */
function getEvalActionLabel(score: number): string {
  if (score === 0) return "Commencer";
  if (score < 100) return "Continuer";
  return "Modifier";
}

/**
 * @function handleEvalAction
 * @description Gère l'action déclenchée par le bouton Commencer / Continuer / Modifier.
 * Utilise le store pour enregistrer l'ID de l'évaluation et redirige l'utilisateur vers la page d'évaluation.
 * @param {Object} evaluation - L'évaluation concernée
 */
function handleEvalAction(evaluation: any) {
  console.log("[HomeView] handleEvalAction déclenché pour evaluation ID =", evaluation.id);
  
  // Enregistrer l'ID de l'évaluation dans le store Pinia
  evaluationStore.setCurrentEvaluationId(evaluation.id);
  
  // Rediriger vers la page d'évaluation (la route 'evaluation' est définie sans paramètre)
  router.push({ name: 'evaluation' });
}
</script>

<style scoped>
/* Styles repris de la version statique, inchangés */

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.welcome-section h1 {
  font-size: 1.875rem;
  color: var(--text);
  margin: 0;
}

.welcome-section p {
  color: var(--text-light);
  margin: 0.5rem 0 0;
}

.evaluations-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.evaluations-overview h2 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0;
}

.evaluation-card.latest {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.evaluation-info h3 {
  margin: 0 0 0.75rem;
  color: var(--text);
  font-size: 1.25rem;
}

.meta-info {
  display: flex;
  gap: 2rem;
  color: var(--text-light);
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  color: white;
}

.score-badge.high {
  background: #22c55e;
}

.score-badge.medium {
  background: #f59e0b;
}

.score-badge.low {
  background: #ef4444;
}

.progress-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-item {
  display: grid;
  grid-template-columns: 200px 1fr 50px;
  align-items: center;
  gap: 1rem;
}

.status-label {
  color: var(--text);
  font-size: 0.875rem;
}

.progress-bar {
  height: 0.5rem;
  background: var(--primary-focus);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  transition: width 0.3s ease;
}

.progress.high {
  background: #22c55e;
}

.progress.medium {
  background: #f59e0b;
}

.progress.low {
  background: #ef4444;
}

.status-count {
  color: var(--text-light);
  font-size: 0.875rem;
  text-align: right;
}

.card-actions {
  display: flex;
  gap: 1rem;
}

.view-details,
.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.view-details {
  background: var(--primary);
  color: white;
}

.view-details:hover {
  background: var(--primary-hover);
}

.export-btn {
  background: var(--background);
  color: var(--text);
  border: none;
  cursor: pointer;
}

.export-btn:hover {
  background: var(--border);
}

.evaluations-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.summary-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon.high {
  background: #dcfce7;
  color: #22c55e;
}

.summary-icon.medium {
  background: #fef3c7;
  color: #f59e0b;
}

.summary-icon.low {
  background: #fee2e2;
  color: #ef4444;
}

.summary-content h4 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-light);
}

.summary-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
}

.action-btn.primary:hover {
  background: var(--primary-hover);
}

.action-btn.secondary {
  background: var(--background);
  color: var(--text);
}

.action-btn.secondary:hover {
  background: var(--border);
}

.evaluation-card.noeval {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.evaluation-card.noeval:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-content.invite-centered {
  text-align: center;
}

.card-icon {
  background: var(--primary-focus);
  width: 80px;
  height: 80px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.card-icon .icon {
  width: 40px;
  height: 40px;
  color: var(--primary);
}

.evaluation-card h2 {
  font-size: 1.75rem;
  color: var(--text);
  margin: 0 0 1rem;
}

.evaluation-card p {
  color: var(--text-light);
  margin: 0 auto 2rem;
  max-width: 600px;
  line-height: 1.6;
}

.no-evaluations-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #fee2e2;
  border-radius: var(--radius);
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: left;
}

.no-evaluations-message p {
  margin: 0;
  color: #991b1b;
  font-weight: 500;
}

.alert-icon {
  color: #dc2626;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 auto 2.5rem;
  max-width: 500px;
  text-align: left;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text);
}

.check-icon {
  color: var(--primary);
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.centered {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.start-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: var(--white);
  padding: 2rem;
  border-radius: var(--radius);
}

.eval-action-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.eval-action-btn:hover {
  background: var(--primary-hover);
}
</style>