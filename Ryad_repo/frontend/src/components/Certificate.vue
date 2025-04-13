<template>
  <dialog :open="true" class="modal">
    <article>
      <header>
        <button 
          aria-label="Close" 
          class="close"
          @click="onClose"
        ></button>
        <Award class="icon" />
        <h3>Certificat de Conformité NIS2</h3>
        <p>Ce certificat atteste du niveau de conformité atteint</p>
      </header>

      <div class="grid">
        <div class="text-center">
          <h1>{{ score }}%</h1>
          <p>Niveau {{ getLevel(score) }}</p>
        </div>
      </div>

      <footer class="grid">
        <div>
          <small>Date d'évaluation : {{ today }}</small>
          <p>
            Ce certificat est généré automatiquement suite à l'auto-évaluation.
            Il ne constitue pas une certification officielle.
          </p>
        </div>
        <button @click="downloadPDF" class="secondary">
          <Download class="icon" /> Télécharger le PDF
        </button>
      </footer>
    </article>
  </dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Award, Download } from 'lucide-vue-next';
import { jsPDF } from 'jspdf';

const props = defineProps<{
  score: number;
  onClose: () => void;
}>();

const today = computed(() => new Date().toLocaleDateString('fr-FR'));

const getLevel = (score: number) => {
  if (score >= 80) return 'Avancé';
  if (score >= 60) return 'Intermédiaire';
  return 'Initial';
};

const downloadPDF = () => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Certificat de Conformité NIS2", 105, 30, { align: "center" });
  
  doc.setLineWidth(0.5);
  doc.circle(105, 60, 15);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Score de conformité", 105, 90, { align: "center" });
  
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text(`${props.score}%`, 105, 110, { align: "center" });
  
  doc.setFontSize(20);
  doc.text(`Niveau ${getLevel(props.score)}`, 105, 130, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date d'évaluation : ${today.value}`, 105, 160, { align: "center" });
  doc.text("Ce certificat est généré automatiquement suite à l'auto-évaluation.", 105, 170, { align: "center" });
  doc.text("Il ne constitue pas une certification officielle.", 105, 180, { align: "center" });
  
  doc.setLineWidth(1);
  doc.rect(20, 20, 170, 170);
  
  doc.save('certificat-nis2.pdf');
};
</script>