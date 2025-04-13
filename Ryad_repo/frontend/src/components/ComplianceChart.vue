<template>
  <article>
    <header>
      <progress :value="score" max="100"></progress>
      <div class="grid">
        <div>
          <h3>{{ score }}%</h3>
          <p>{{ getMessage(score) }}</p>
        </div>
      </div>
    </header>

    <div class="grid">
      <div class="button-group">
        <button 
          v-for="(label, type) in chartTypes" 
          :key="type"
          :class="{ 'secondary': chartType === type }"
          @click="chartType = type"
        >
          <component :is="chartIcons[type]" class="icon" />
          {{ label }}
        </button>
      </div>
    </div>

    <div class="chart-container">
      <component :is="currentChart" :data="chartData" :options="options" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BarChart3, LineChart, PieChart, Radio } from 'lucide-vue-next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  score: number;
}>();

const chartType = ref<'bar' | 'line' | 'doughnut' | 'radar'>('bar');

const chartTypes = {
  bar: 'Barres',
  line: 'Ligne',
  doughnut: 'Anneau',
  radar: 'Radar'
};

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  doughnut: PieChart,
  radar: Radio
};

const getMessage = (score: number) => {
  if (score >= 80) return 'Excellent niveau de conformité';
  if (score >= 60) return 'Niveau de conformité acceptable';
  return 'Des améliorations sont nécessaires';
};

const getChartColor = (score: number) => {
  if (score >= 80) return 'var(--primary)';
  if (score >= 60) return 'var(--secondary)';
  return 'var(--contrast)';
};

const chartData = computed(() => ({
  labels: ['Gouvernance', 'Gestion des actifs', 'Gestion des incidents', 'Sécurité'],
  datasets: [
    {
      label: 'Niveau de conformité',
      data: [props.score, props.score * 0.9, props.score * 1.1, props.score].map(v => 
        Math.min(100, Math.max(0, v))
      ),
      backgroundColor: getChartColor(props.score),
      borderColor: getChartColor(props.score),
      borderWidth: 2,
    },
  ],
}));

const options = computed(() => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Analyse détaillée de la conformité',
    },
  },
  scales: chartType.value !== 'doughnut' ? {
    r: {
      min: 0,
      max: 100,
      beginAtZero: true,
    },
    y: {
      min: 0,
      max: 100,
      beginAtZero: true,
    },
  } : undefined,
}));

const currentChart = computed(() => {
  switch (chartType.value) {
    case 'bar':
      return Bar;
    case 'line':
      return Line;
    case 'doughnut':
      return Doughnut;
    case 'radar':
      return Radar;
    default:
      return Bar;
  }
});
</script>