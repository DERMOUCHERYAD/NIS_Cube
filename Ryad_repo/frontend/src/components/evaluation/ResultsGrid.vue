<template>
  <div class="results-container">
    <header class="results-header">
      <h2>Résultats de l'évaluation</h2>
      <div class="score-display">
        <div class="score-circle" :class="scoreClass">
          {{ score }}%
        </div>
        <p class="score-label">{{ getScoreLabel(score) }}</p>
      </div>
    </header>

    <div class="results-content">
      <!-- Grille d'objectifs -->
      <section class="objectives-grid-section">
        <h3>
          <Target class="section-icon" />
          Objectifs de conformité
        </h3>
        <div class="objectives-grid">
          <div 
            v-for="objective in objectives" 
            :key="objective.id"
            class="objective-square"
            :class="getObjectiveClass(objective.status)"
            @click="selectObjective(objective)"
          >
            <div class="objective-content">
              <span class="objective-id">{{ objective.id }}</span>
              <CheckCircle2 v-if="objective.status === 'compliant'" class="status-icon" />
              <AlertTriangle v-else-if="objective.status === 'partial'" class="status-icon" />
              <XCircle v-else class="status-icon" />
            </div>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color compliant"></div>
            <span>Conforme</span>
          </div>
          <div class="legend-item">
            <div class="legend-color partial"></div>
            <span>Partiellement conforme</span>
          </div>
          <div class="legend-item">
            <div class="legend-color non-compliant"></div>
            <span>Non conforme</span>
          </div>
        </div>
      </section>

      <!-- Détails de l'objectif sélectionné -->
      <section class="objective-details-section">
        <h3>
          <ClipboardList class="section-icon" />
          Détails de l'objectif
        </h3>
        
        <div v-if="selectedObjective" class="selected-objective">
          <div class="objective-header">
            <div class="objective-badge" :class="getObjectiveClass(selectedObjective.status)">
              Objectif {{ selectedObjective.id }}
            </div>
            <button class="close-btn" @click="selectedObjective = null">
              <X class="icon" />
            </button>
          </div>
          <h4>{{ selectedObjective.title }}</h4>
          <p class="objective-description">{{ selectedObjective.description }}</p>
          
          <div class="questions-list">
            <h5>Questions associées</h5>
            <div 
              v-for="question in selectedObjective.questions" 
              :key="question.id"
              class="question-item"
              :class="getAnswerClass(question.answer)"
            >
              <div class="question-header">
                <span class="question-id">{{ question.id }}</span>
                <span class="question-status">{{ getAnswerLabel(question.answer) }}</span>
              </div>
              <p class="question-text">{{ question.text }}</p>
              <div v-if="question.answer !== 'yes'" class="question-recommendation">
                <AlertCircle class="recommendation-icon" />
                <p>{{ question.recommendation }}</p>
              </div>
            </div>
          </div>
          
          <div class="recommendation-card" v-if="selectedObjective.status !== 'compliant'">
            <AlertCircle class="recommendation-icon" />
            <div class="recommendation-content">
              <strong>Recommandation générale :</strong>
              <p>{{ selectedObjective.recommendation }}</p>
              <div class="action-steps">
                <h5>Actions à entreprendre :</h5>
                <ul>
                  <li v-for="(action, index) in selectedObjective.actions" :key="index">
                    {{ action }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <ClipboardList class="empty-icon" />
          <p>Sélectionnez un objectif dans la grille pour voir les détails</p>
        </div>
      </section>
    </div>

    <footer class="results-actions">
      <div class="export-buttons">
        <button class="export-btn" @click="exportPDF">
          <FileText class="icon" />
          PDF
        </button>
        <button class="export-btn" @click="exportCSV">
          <Table class="icon" />
          CSV
        </button>
      </div>
      <div class="action-buttons">
        <button class="restart-btn" @click="$emit('restart')">
          <RefreshCw class="icon" />
          Recommencer l'évaluation
        </button>
        <button class="primary-btn" @click="$emit('finish')">
          <CheckCircle2 class="icon" />
          Terminer
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Target, 
  AlertCircle,
  X,
  FileText,
  Table,
  RefreshCw,
  ClipboardList
} from 'lucide-vue-next';
import { jsPDF } from 'jspdf';

const props = defineProps<{
  score: number;
  sections?: any[];
}>();

defineEmits<{
  (e: 'finish'): void;
  (e: 'restart'): void;
}>();

// Type pour les objectifs
interface Question {
  id: string;
  text: string;
  answer: 'yes' | 'no' | 'partial';
  recommendation?: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  recommendation: string;
  actions: string[];
  questions: Question[];
}

// Objectif sélectionné
const selectedObjective = ref<Objective | null>(null);

// Générer les objectifs à partir des sections si disponibles
const objectives = computed(() => {
  if (props.sections && props.sections.length > 0) {
    return props.sections.map(section => {
      // Calculer le statut de l'objectif en fonction des réponses aux questions
      const answeredQuestions = section.questions.filter((q: any) => q.answer);
      const yesCount = answeredQuestions.filter((q: any) => q.answer === 'yes').length;
      const partialCount = answeredQuestions.filter((q: any) => q.answer === 'partial').length;
      
      let status: 'compliant' | 'partial' | 'non-compliant';
      if (yesCount === section.questions.length) {
        status = 'compliant';
      } else if (yesCount + partialCount > 0) {
        status = 'partial';
      } else {
        status = 'non-compliant';
      }
      
      // Mapper les questions pour le format attendu
      const questions = section.questions.map((q: any) => ({
        id: q.objective,
        text: q.text,
        answer: q.answer || 'no',
        recommendation: q.recommendation
      }));
      
      return {
        id: section.objective?.id || String(section.id),
        title: section.objective?.title || section.title,
        description: section.objective?.description || section.description,
        status,
        recommendation: "Améliorez votre conformité en mettant en œuvre les recommandations spécifiques pour chaque question.",
        actions: [
          "Examiner les questions non conformes en priorité",
          "Établir un plan d'action avec des échéances",
          "Désigner des responsables pour chaque action",
          "Effectuer un suivi régulier des progrès"
        ],
        questions
      };
    });
  }
  
  // Objectifs simulés si aucune section n'est fournie
  return [
    {
      id: '1',
      title: 'Gouvernance de la sécurité',
      description: 'Établir une structure organisationnelle claire pour la gestion de la sécurité des systèmes d\'information.',
      status: 'compliant',
      recommendation: 'Votre gouvernance de sécurité est bien définie et documentée.',
      actions: [
        'Continuer à mettre à jour la politique annuellement',
        'Communiquer régulièrement sur la politique auprès des employés'
      ],
      questions: [
        {
          id: '1.1',
          text: 'Avez-vous défini une politique de sécurité des systèmes d\'information ?',
          answer: 'yes',
          recommendation: 'Établissez une politique de sécurité documentée et validée par la direction.'
        },
        {
          id: '1.2',
          text: 'Existe-t-il un responsable de la sécurité des systèmes d\'information (RSSI) ?',
          answer: 'yes',
          recommendation: 'Désignez un RSSI ou attribuez cette responsabilité à un membre de l\'équipe.'
        }
      ]
    },
    {
      id: '2',
      title: 'Protection externe',
      description: 'Protéger les frontières de votre réseau contre les intrusions et les accès non autorisés.',
      status: 'partial',
      recommendation: 'Votre protection externe présente des lacunes qui pourraient être exploitées par des attaquants.',
      actions: [
        'Renforcer la configuration du pare-feu',
        'Mettre en place une surveillance du trafic réseau',
        'Effectuer des tests de pénétration réguliers'
      ],
      questions: [
        {
          id: '2.1',
          text: 'Disposez-vous d\'un pare-feu pour protéger votre réseau ?',
          answer: 'partial',
          recommendation: 'Installez et configurez un pare-feu professionnel.'
        }
      ]
    },
    {
      id: '3',
      title: 'Protection interne',
      description: 'Mettre en place des mécanismes robustes pour contrôler l\'accès aux systèmes et protéger les données sensibles.',
      status: 'non-compliant',
      recommendation: 'Votre protection interne présente des faiblesses critiques qui doivent être corrigées rapidement.',
      actions: [
        'Mettre en place une authentification forte',
        'Revoir les droits d\'accès aux systèmes critiques',
        'Chiffrer les données sensibles'
      ],
      questions: [
        {
          id: '3.1',
          text: 'Les accès aux systèmes sont-ils protégés par authentification forte ?',
          answer: 'no',
          recommendation: 'Mettez en place une authentification à deux facteurs.'
        }
      ]
    },
    {
      id: '4',
      title: 'Détection et gestion des incidents',
      description: 'Mettre en place des capacités de détection des incidents de sécurité et des procédures de réponse efficaces.',
      status: 'non-compliant',
      recommendation: 'Votre capacité à détecter et répondre aux incidents est insuffisante.',
      actions: [
        'Déployer un système de détection d\'intrusion',
        'Établir une procédure de réponse aux incidents',
        'Former le personnel à la détection des incidents'
      ],
      questions: [
        {
          id: '4.1',
          text: 'Avez-vous un système de détection des incidents de sécurité ?',
          answer: 'no',
          recommendation: 'Déployez un système de détection d\'intrusion (IDS).'
        }
      ]
    },
    {
      id: '5',
      title: 'Continuité d\'activité et résilience',
      description: 'Assurer la continuité des opérations critiques en cas d\'incident de sécurité majeur.',
      status: 'non-compliant',
      recommendation: 'Votre capacité à maintenir les activités en cas d\'incident majeur est insuffisante.',
      actions: [
        'Élaborer un plan de continuité d\'activité',
        'Tester régulièrement le plan',
        'Former le personnel aux procédures d\'urgence'
      ],
      questions: [
        {
          id: '5.1',
          text: 'Disposez-vous d\'un plan de continuité d\'activité ?',
          answer: 'no',
          recommendation: 'Élaborez un PCA documenté et testez-le régulièrement.'
        }
      ]
    },
    {
      id: '6',
      title: 'Formation et sensibilisation',
      description: 'Développer une culture de sécurité par la formation et la sensibilisation de tous les collaborateurs.',
      status: 'partial',
      recommendation: 'Votre programme de formation et de sensibilisation nécessite des améliorations.',
      actions: [
        'Mettre en place des formations régulières',
        'Organiser des exercices de simulation d\'attaques',
        'Créer des supports de sensibilisation adaptés'
      ],
      questions: [
        {
          id: '6.1',
          text: 'Organisez-vous régulièrement des formations à la sécurité pour vos collaborateurs ?',
          answer: 'partial',
          recommendation: 'Mettez en place un programme de formation annuel et des rappels réguliers.'
        }
      ]
    }
  ];
});

// Classe CSS en fonction du score
const scoreClass = computed(() => {
  if (props.score >= 80) return 'high';
  if (props.score >= 60) return 'medium';
  return 'low';
});

// Libellé en fonction du score
const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Conforme';
  if (score >= 60) return 'Partiellement conforme';
  return 'Non conforme';
};

// Classe CSS en fonction du statut de l'objectif
const getObjectiveClass = (status: string) => {
  switch (status) {
    case 'compliant': return 'compliant';
    case 'partial': return 'partial';
    case 'non-compliant': return 'non-compliant';
    default: return '';
  }
};

// Classe CSS en fonction de la réponse à la question
const getAnswerClass = (answer: string) => {
  switch (answer) {
    case 'yes': return 'answer-yes';
    case 'partial': return 'answer-partial';
    case 'no': return 'answer-no';
    default: return '';
  }
};

// Libellé en fonction de la réponse à la question
const getAnswerLabel = (answer: string) => {
  switch (answer) {
    case 'yes': return 'Conforme';
    case 'partial': return 'Partiellement conforme';
    case 'no': return 'Non conforme';
    default: return 'Non évalué';
  }
};

// Sélectionner un objectif
const selectObjective = (objective: Objective) => {
  selectedObjective.value = objective;
};

// Exporter en PDF
const exportPDF = () => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Rapport d'évaluation NIS2", 105, 20, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
  doc.text(`Score global: ${props.score}%`, 20, 40);
  doc.text(`Niveau: ${getScoreLabel(props.score)}`, 20, 50);
  
  // Résumé des objectifs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Résumé des objectifs", 20, 70);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const compliantCount = objectives.value.filter(o => o.status === 'compliant').length;
  const partialCount = objectives.value.filter(o => o.status === 'partial').length;
  const nonCompliantCount = objectives.value.filter(o => o.status === 'non-compliant').length;
  
  doc.text(`Objectifs conformes: ${compliantCount}`, 20, 80);
  doc.text(`Objectifs partiellement conformes: ${partialCount}`, 20, 90);
  doc.text(`Objectifs non conformes: ${nonCompliantCount}`, 20, 100);
  
  // Détail des objectifs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Détail des objectifs", 20, 120);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  let yPos = 130;
  objectives.value.forEach((obj, index) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. Objectif ${obj.id}: ${obj.title}`, 20, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    const status = obj.status === 'compliant' ? 'Conforme' : 
                  obj.status === 'partial' ? 'Partiellement conforme' : 'Non conforme';
    doc.text(`Statut: ${status}`, 25, yPos);
    yPos += 10;
    
    // Questions
    doc.text('Questions:', 25, yPos);
    yPos += 10;
    
    obj.questions.forEach(q => {
      const answer = q.answer === 'yes' ? 'Conforme' : 
                    q.answer === 'partial' ? 'Partiellement conforme' : 'Non conforme';
      doc.text(`- ${q.id}: ${q.text} (${answer})`, 30, yPos);
      yPos += 7;
      
      if (q.answer !== 'yes' && q.recommendation) {
        doc.text(`  Recommandation: ${q.recommendation}`, 35, yPos);
        yPos += 7;
      }
    });
    
    yPos += 10;
  });
  
  doc.save('rapport-nis2.pdf');
};

// Exporter en CSV
const exportCSV = () => {
  // En-tête du CSV
  let csvContent = "Objectif ID;Titre;Statut;Question ID;Question;Réponse;Recommandation\n";
  
  // Ajouter chaque objectif et ses questions
  objectives.value.forEach(obj => {
    const objStatus = obj.status === 'compliant' ? 'Conforme' : 
                     obj.status === 'partial' ? 'Partiellement conforme' : 'Non conforme';
    
    obj.questions.forEach(q => {
      const answer = q.answer === 'yes' ? 'Conforme' : 
                    q.answer === 'partial' ? 'Partiellement conforme' : 'Non conforme';
      
      // Échapper les guillemets dans les chaînes de texte
      const title = obj.title.replace(/"/g, '""');
      const questionText = q.text.replace(/"/g, '""');
      const recommendation = (q.recommendation || '').replace(/"/g, '""');
      
      csvContent += `${obj.id};"${title}";"${objStatus}";${q.id};"${questionText}";"${answer}";"${recommendation}"\n`;
    });
  });
  
  // Créer un objet Blob et un lien de téléchargement
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'evaluation-nis2.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.results-container {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  margin-bottom: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.results-header h2 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0;
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
  color: white;
  margin-bottom: 0.5rem;
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

.results-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary);
}

/* Grille d'objectifs */
.objectives-grid-section h3,
.objective-details-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  color: var(--text);
  margin: 0 0 1.5rem;
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.objective-square {
  aspect-ratio: 1;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.objective-square:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.objective-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  width: 100%;
  height: 100%;
}

.objective-id {
  font-size: 1.5rem;
}

.status-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.objective-square.compliant {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.objective-square.partial {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.objective-square.non-compliant {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 3px;
}

.legend-color.compliant {
  background: #22c55e;
}

.legend-color.partial {
  background: #f59e0b;
}

.legend-color.non-compliant {
  background: #ef4444;
}

/* Détails de l'objectif */
.objective-details-section {
  display: flex;
  flex-direction: column;
}

.selected-objective {
  background: var(--background);
  border-radius: var(--radius);
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.objective-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.objective-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.objective-badge.compliant {
  background: #22c55e;
}

.objective-badge.partial {
  background: #f59e0b;
}

.objective-badge.non-compliant {
  background: #ef4444;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--text);
}

.selected-objective h4 {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  color: var(--text);
}

.objective-description {
  margin: 0 0 1.5rem;
  color: var(--text-light);
  line-height: 1.5;
}

.questions-list {
  margin-bottom: 1.5rem;
}

.questions-list h5 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--text);
}

.question-item {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1rem;
  margin-bottom: 1rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.question-id {
  font-weight: 600;
  color: var(--text);
}

.question-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.answer-yes .question-status {
  background: #dcfce7;
  color: #22c55e;
}

.answer-partial .question-status {
  background: #fef3c7;
  color: #f59e0b;
}

.answer-no .question-status {
  background: #fee2e2;
  color: #ef4444;
}

.question-text {
  margin: 0 0 0.75rem;
  color: var(--text);
  line-height: 1.5;
}

.question-recommendation {
  display: flex;
  gap: 0.5rem;
  background: #fee2e2;
  border-radius: var(--radius);
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.question-recommendation .recommendation-icon {
  color: #ef4444;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.question-recommendation p {
  margin: 0;
  font-size: 0.875rem;
  color: #991b1b;
  line-height: 1.5;
}

.recommendation-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 1.5rem;
}

.recommendation-icon {
  color: #f59e0b;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.recommendation-content p {
  margin: 0 0 1rem;
  color: var(--text);
  line-height: 1.5;
}

.action-steps {
  background: var(--primary-focus);
  border-radius: var(--radius);
  padding: 1rem;
}

.action-steps h5 {
  margin: 0 0 0.75rem;
  color: var(--primary);
  font-size: 0.875rem;
}

.action-steps ul {
  margin: 0;
  padding-left: 1.25rem;
}

.action-steps li {
  color: var(--text);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.action-steps li:last-child {
  margin-bottom: 0;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 3rem 1rem;
  background: var(--background);
  border-radius: var(--radius);
  color: var(--text-light);
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-light);
  opacity: 0.5;
  margin-bottom: 1rem;
}

/* Actions */
.results-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.export-buttons {
  display: flex;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.export-btn,
.primary-btn,
.restart-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 90px;
}

.export-btn {
  background: var(--background);
  color: var(--text);
}

.export-btn:hover {
  background: var(--border);
}

.primary-btn {
  background: var(--primary);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-hover);
}

.restart-btn {
  background: var(--background);
  color: var(--text);
  border: 1px solid var(--border);
}

.restart-btn:hover {
  background: var(--border);
}

.icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 992px) {
  .results-content {
    grid-template-columns: 1fr;
  }
  
  .selected-objective {
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .objectives-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .export-buttons {
    width: 100%;
    margin-bottom: 1rem;
    justify-content: space-between;
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
  
  .export-btn, 
  .primary-btn,
  .restart-btn {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .objectives-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .legend {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .export-buttons {
    flex-direction: column;
  }
}
</style>