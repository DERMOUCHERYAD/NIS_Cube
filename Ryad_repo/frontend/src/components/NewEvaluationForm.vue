<template>
  <div class="new-evaluation-form">
    <h2>Nouvelle évaluation</h2>
    <!-- Formulaire de création d'une évaluation.
         L'événement @submit.prevent empêche le rechargement de la page et appelle startEvaluation(). -->
    <form @submit.prevent="startEvaluation">
      <!-- Champ: Nom de l'évaluation -->
      <div class="form-group">
        <label for="evaluationName">Nom de l'évaluation</label>
        <input 
          type="text" 
          id="evaluationName" 
          v-model="evaluationName" 
          required
          placeholder="Exemple : Contrôle conformité 2025"
        />
      </div>

      <!-- Choix du type d'entité -->
      <div class="form-group">
        <label>Type d'entité</label>
        <div class="entity-options">
          <!-- Option: Entité essentielle -->
          <label class="entity-option" :class="{ selected: entityType === 'essential' }">
            <input 
              type="radio" 
              name="entityType" 
              value="essential" 
              v-model="entityType" 
              required
            />
            <div class="option-content">
              <Shield class="entity-icon" />
              <div>
                <strong>Entité essentielle (EE)</strong>
                <p>Organisations critiques pour l'économie et la société</p>
              </div>
            </div>
          </label>
          <!-- Option: Entité importante -->
          <label class="entity-option" :class="{ selected: entityType === 'important' }">
            <input 
              type="radio" 
              name="entityType" 
              value="important" 
              v-model="entityType" 
              required
            />
            <div class="option-content">
              <ShieldCheck class="entity-icon" />
              <div>
                <strong>Entité importante (EI)</strong>
                <p>Organisations avec un impact significatif</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Nouveau champ: Nombre de système d'information -->
      <div class="form-group">
        <label for="nombreSi">Nombre de système d'information</label>
        <input 
          type="number" 
          id="nombreSi" 
          v-model.number="nombreSi" 
          required 
          min="0"
          placeholder="Exemple : 5"
        />
      </div>

      <!-- Boutons d'action -->
      <div class="form-actions">
        <!-- Bouton Annuler qui émet l'événement "cancel" -->
        <button type="button" class="cancel-btn" @click="$emit('cancel')">
          <XCircle class="icon" />
          Annuler
        </button>
        <!-- Bouton de validation : désactivé tant que le formulaire n'est pas valide -->
        <button type="submit" class="start-btn" :disabled="!isFormValid">
          <Play class="icon" />
          Créer l'évaluation
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview Composant NewEvaluationForm
 * Ce composant gère le formulaire de création d'une nouvelle évaluation.
 * L'utilisateur saisit un nom d'évaluation, choisit un type d'entité ("essential" ou "important")
 * et indique le nombre de système d'information.
 * Lors de la soumission, l'événement "start" est émis avec les données saisies.
 *
 * @module components/NewEvaluationForm
 */

import { ref, computed } from 'vue';
import { Shield, ShieldCheck, XCircle, Play } from 'lucide-vue-next';

// Références pour les champs du formulaire
const evaluationName = ref('');
const entityType = ref('');
const nombreSi = ref(0); // Nouvelle variable pour le nombre de SI

// Vérifie que le formulaire est valide : nom non vide, type d'entité sélectionné et nombre de SI défini
const isFormValid = computed(() => {
  return evaluationName.value.trim() !== '' && entityType.value !== '' && nombreSi.value !== null;
});

// Définition des événements émis vers le parent (start et cancel)
const emit = defineEmits<{
  (e: 'start', data: { name: string; entityType: string; nombre_si: number }): void;
  (e: 'cancel'): void;
}>();

/**
 * startEvaluation()
 * Vérifie la validité du formulaire, puis émet l'événement "start" avec les données saisies.
 */
const startEvaluation = () => {
  console.log("[NewEvaluationForm] startEvaluation() déclenché.");
  if (!isFormValid.value) {
    console.warn("[NewEvaluationForm] Formulaire invalide. Événement 'start' non émis.");
    return;
  }
  console.log("[NewEvaluationForm] Émission de l'événement 'start' avec :", {
    name: evaluationName.value,
    entityType: entityType.value,
    nombre_si: nombreSi.value // Inclusion de la valeur du nombre de SI
  });
  emit('start', {
    name: evaluationName.value,
    entityType: entityType.value,
    nombre_si: nombreSi.value
  });
};
</script>

<style scoped>
/* Styles pour le formulaire NewEvaluationForm */

.new-evaluation-form {
  background: var(--white);
  border-radius: var(--radius);
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.new-evaluation-form h2 {
  margin: 0 0 2rem;
  color: var(--text);
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text);
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: var(--transition);
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-focus);
  outline: none;
}

.entity-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.entity-option {
  position: relative;
  cursor: pointer;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  transition: all 0.2s ease;
}

.entity-option:hover {
  border-color: var(--primary-focus);
}

.entity-option.selected {
  border-color: var(--primary);
  background-color: var(--primary-focus);
}

.entity-option input {
  position: absolute;
  opacity: 0;
}

.option-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.entity-icon {
  color: var(--primary);
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.option-content strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text);
}

.option-content p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-light);
  line-height: 1.4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.cancel-btn {
  background: var(--background);
  color: var(--text);
}

.cancel-btn:hover {
  background: var(--border);
}

.start-btn {
  background: var(--primary);
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .new-evaluation-form {
    padding: 1.5rem;
  }
  .entity-options {
    grid-template-columns: 1fr;
  }
  .form-actions {
    flex-direction: column-reverse;
  }
  .form-actions button {
    width: 100%;
  }
}
</style>