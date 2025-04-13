<template>
  <div class="history-container">
    <header class="history-header">
      <h1><History class="header-icon" /> Mon Historique d'Évaluations</h1>
      <p>Consultez vos évaluations précédentes</p>
    </header>

    <div class="history-content">
      <!-- Évaluation complétée -->
      <article class="evaluation-card completed">
        <div class="evaluation-header">
          <div class="evaluation-info">
            <h2>Évaluation du 28/02/2025</h2>
            <div class="evaluation-meta">
              <span class="entity-type">
                <Shield class="meta-icon" />
                Entité importante
              </span>
            </div>
          </div>
          <div class="score-badge high">
            <span class="score-value">87%</span>
            <span class="score-label">Conforme</span>
          </div>
        </div>

        <div class="evaluation-actions">
          <button class="action-btn view-btn" @click="viewEvaluation">
            <Eye class="btn-icon" />
            Voir les détails
          </button>
          <div class="export-buttons">
            <button class="action-btn export-btn" @click="exportPDF(evaluations[0])">
              <FileText class="btn-icon" />
              PDF
            </button>
            <button class="action-btn export-btn" @click="exportCSV(evaluations[0])">
              <Table class="btn-icon" />
              CSV
            </button>
          </div>
        </div>
      </article>

      <!-- Évaluation complétée -->
      <article class="evaluation-card completed">
        <div class="evaluation-header">
          <div class="evaluation-info">
            <h2>Évaluation du 15/01/2025</h2>
            <div class="evaluation-meta">
              <span class="entity-type">
                <Shield class="meta-icon" />
                Entité importante
              </span>
            </div>
          </div>
          <div class="score-badge medium">
            <span class="score-value">72%</span>
            <span class="score-label">Partiellement conforme</span>
          </div>
        </div>

        <div class="evaluation-actions">
          <button class="action-btn view-btn" @click="viewEvaluation">
            <Eye class="btn-icon" />
            Voir les détails
          </button>
          <div class="export-buttons">
            <button class="action-btn export-btn" @click="exportPDF(evaluations[1])">
              <FileText class="btn-icon" />
              PDF
            </button>
            <button class="action-btn export-btn" @click="exportCSV(evaluations[1])">
              <Table class="btn-icon" />
              CSV
            </button>
          </div>
        </div>
      </article>

      <!-- Autres évaluations -->
      <div class="empty-history" v-if="otherEvaluations.length === 0 && evaluations.length === 0">
        <FileQuestion class="empty-icon" />
        <p>Aucune évaluation disponible</p>
        <p class="empty-subtext">Vos futures évaluations apparaîtront ici</p>
        <RouterLink to="/evaluation" class="start-new-btn">
          <PlusCircle class="btn-icon" />
          Commencer une nouvelle évaluation
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { 
  History, 
  Shield, 
  Eye, 
  Download, 
  FileQuestion,
  PlusCircle,
  FileText,
  Table
} from 'lucide-vue-next';
import { jsPDF } from 'jspdf';

// Type pour les évaluations
interface Evaluation {
  id: number;
  date: string;
  entityType: string;
  duration?: string;
  score: number;
  objectives?: {
    id: string;
    title: string;
    status: 'compliant' | 'partial' | 'non-compliant';
    recommendation: string;
  }[];
}

// État pour les évaluations (pour l'exemple, nous avons 2 évaluations hardcodées)
const evaluations = ref<Evaluation[]>([
  {
    id: 1,
    date: '28/02/2025',
    entityType: 'important',
    duration: '45 minutes',
    score: 87,
    objectives: [
      {
        id: '1.1',
        title: 'Politique de sécurité',
        status: 'compliant',
        recommendation: 'Votre politique de sécurité est bien définie et documentée.'
      },
      {
        id: '1.2',
        title: 'Responsabilités de sécurité',
        status: 'partial',
        recommendation: 'Les responsabilités de sécurité sont partiellement définies mais manquent de formalisation.'
      },
      {
        id: '2.1',
        title: 'Contrôle d\'accès',
        status: 'compliant',
        recommendation: 'Les contrôles d\'accès sont bien implémentés.'
      }
    ]
  },
  {
    id: 2,
    date: '15/01/2025',
    entityType: 'important',
    duration: '38 minutes',
    score: 72,
    objectives: [
      {
        id: '1.1',
        title: 'Politique de sécurité',
        status: 'partial',
        recommendation: 'La politique de sécurité existe mais n\'est pas complètement documentée.'
      },
      {
        id: '1.2',
        title: 'Responsabilités de sécurité',
        status: 'non-compliant',
        recommendation: 'Les responsabilités de sécurité ne sont pas clairement définies.'
      },
      {
        id: '2.1',
        title: 'Contrôle d\'accès',
        status: 'partial',
        recommendation: 'Les contrôles d\'accès sont partiellement implémentés.'
      }
    ]
  }
]);

// État pour les autres évaluations (vide pour l'exemple)
const otherEvaluations = ref([]);

// Fonctions d'action
const viewEvaluation = () => {
  alert('Affichage des détails de l\'évaluation');
};

const downloadReport = () => {
  alert('Le rapport a été téléchargé.');
};

// Exporter en PDF
const exportPDF = (evaluation: Evaluation) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Rapport d'évaluation NIS2", 105, 20, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Date d'évaluation: ${evaluation.date}`, 20, 30);
  doc.text(`Score global: ${evaluation.score}%`, 20, 40);
  doc.text(`Niveau: ${getScoreLabel(evaluation.score)}`, 20, 50);
  
  // Résumé des objectifs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Résumé des objectifs", 20, 70);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  if (evaluation.objectives) {
    const compliantCount = evaluation.objectives.filter(o => o.status === 'compliant').length;
    const partialCount = evaluation.objectives.filter(o => o.status === 'partial').length;
    const nonCompliantCount = evaluation.objectives.filter(o => o.status === 'non-compliant').length;
    
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
    evaluation.objectives.forEach((obj, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. Objectif ${obj.id}: ${obj.title}`, 20, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      const status = obj.status === 'compliant' ? 'Conforme' : 
                    obj.status === 'partial' ? 'Partiellement conforme' : 'Non conforme';
      doc.text(`Statut: ${status}`, 25, yPos);
      yPos += 10;
      
      const recommendationLines = doc.splitTextToSize(obj.recommendation, 170);
      doc.text(recommendationLines, 25, yPos);
      yPos += recommendationLines.length * 7 + 5;
    });
  }
  
  doc.save(`evaluation-nis2-${evaluation.date.replace(/\//g, '-')}.pdf`);
  alert('Le rapport PDF a été généré et téléchargé.');
};

// Exporter en CSV
const exportCSV = (evaluation: Evaluation) => {
  if (!evaluation.objectives) {
    alert('Aucune donnée d\'objectif disponible pour cette évaluation.');
    return;
  }
  
  // En-tête du CSV
  let csvContent = "ID;Titre;Statut;Recommandation\n";
  
  // Ajouter chaque objectif
  evaluation.objectives.forEach(obj => {
    const status = obj.status === 'compliant' ? 'Conforme' : 
                  obj.status === 'partial' ? 'Partiellement conforme' : 'Non conforme';
    
    // Échapper les guillemets dans les chaînes de texte
    const title = obj.title.replace(/"/g, '""');
    const recommendation = obj.recommendation.replace(/"/g, '""');
    
    csvContent += `${obj.id};"${title}";"${status}";"${recommendation}"\n`;
  });
  
  // Créer un objet Blob et un lien de téléchargement
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `evaluation-nis2-${evaluation.date.replace(/\//g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('Le rapport CSV a été généré et téléchargé.');
};

// Obtenir le libellé en fonction du score
const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Conforme';
  if (score >= 60) return 'Partiellement conforme';
  return 'Non conforme';
};
</script>

<style scoped>
.history-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.history-header {
  background: var(--primary-focus);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.history-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--primary);
  margin: 0 0 0.5rem;
}

.history-header p {
  color: var(--text-light);
  margin: 0;
}

.header-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Carte d'évaluation */
.evaluation-card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.evaluation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.evaluation-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--text);
}

.evaluation-meta {
  display: flex;
  gap: 1.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.entity-type,
.completion-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  padding: 3em;
  border-radius: 50%;
  color: white;
}

.score-badge.high {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.score-badge.medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.score-badge.low {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.score-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.score-label {
  font-size: 0.75rem;
  opacity: 0.9;
  text-align: center;
}

.evaluation-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background: var(--primary-focus);
  color: var(--primary);
}

.view-btn:hover {
  background: var(--primary);
  color: white;
}

.export-btn {
  background: var(--background);
  color: var(--text);
  min-width: 90px;
}

.export-btn:hover {
  background: var(--border);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* État vide */
.empty-history {
  background: var(--white);
  border-radius: var(--radius);
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: var(--text-light);
  opacity: 0.5;
}

.empty-history p {
  margin: 0;
  color: var(--text);
  font-weight: 500;
}

.empty-history .empty-subtext {
  color: var(--text-light);
  font-weight: normal;
}

.start-new-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  margin-top: 1rem;
}

.start-new-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

@media (max-width: 992px) {
  .evaluation-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .export-buttons {
    justify-content: space-between;
    margin-top: 0.5rem;
  }
  
  .export-btn {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .evaluation-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .evaluation-meta {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .history-header {
    padding: 1.5rem;
  }

  .evaluation-card {
    padding: 1rem;
  }
  
  .export-buttons {
    flex-direction: column;
  }
}
</style>