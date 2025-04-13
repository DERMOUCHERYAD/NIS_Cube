<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">À propos de NIS2 Évaluation</h1>
      
      <div class="prose prose-indigo max-w-none">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Qu'est-ce que NIS2 ?</h2>
        <p class="mb-6">
          La directive NIS2 (Network and Information Systems) est la nouvelle réglementation européenne 
          sur la cybersécurité. Elle vise à renforcer la sécurité des réseaux et des systèmes d'information 
          dans l'Union européenne, en imposant des obligations aux entreprises et organisations considérées 
          comme essentielles ou importantes.
        </p>

        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Notre outil d'évaluation</h2>
        <p class="mb-4">
          Cet outil d'auto-évaluation vous permet de :
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li>Évaluer votre niveau de conformité actuel avec NIS2</li>
          <li>Identifier les domaines nécessitant des améliorations</li>
          <li>Obtenir des recommandations pratiques</li>
          <li>Générer un rapport détaillé de votre évaluation</li>
        </ul>

        <div class="bg-indigo-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-indigo-900 mb-3">Comment utiliser l'outil ?</h3>
          <ol class="list-decimal pl-6 space-y-2 text-indigo-900">
            <li>Répondez aux questions d'évaluation</li>
            <li>Consultez vos résultats et recommandations</li>
            <li>Téléchargez votre certificat d'évaluation</li>
            <li>Mettez en œuvre les améliorations suggérées</li>
          </ol>
        </div>

        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Confidentialité</h2>
        <p class="mb-6">
          Vos réponses et résultats sont strictement confidentiels. Aucune donnée n'est partagée 
          avec des tiers. L'évaluation est réalisée localement dans votre navigateur.
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <InfoIcon class="h-5 w-5 text-blue-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                Cette auto-évaluation est un outil d'aide à la conformité. Pour une évaluation 
                officielle, nous vous recommandons de faire appel à un auditeur certifié.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info as InfoIcon } from 'lucide-vue-next';
</script>