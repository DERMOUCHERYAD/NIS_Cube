<template>
    <!-- Overlay du modal, visible si prop visible est true -->
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <h2>Supprimer le compte ?</h2>
        <p>
          Êtes-vous sûr de vouloir supprimer votre compte ?
          <br />
          <strong>Action irréversible.</strong>
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="onCancel">
            Annuler
          </button>
          <button class="danger-btn" @click="onConfirm">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  
  /**
   * Props :
   * - visible (boolean) : indique si le modal est affiché ou non
   */
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  });
  
  /**
   * Émissions d’événements :
   * - "confirm" : l’utilisateur confirme la suppression
   * - "cancel" : l’utilisateur annule la suppression
   */
  const emits = defineEmits(['confirm', 'cancel']);
  
  function onCancel() {
    emits('cancel');
  }
  
  function onConfirm() {
    emits('confirm');
  }
  </script>
  
  <style scoped>
  /* Overlay plein écran */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000; /* au-dessus des autres éléments */
  }
  
  /* Contenu de la fenêtre modale */
  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }
  
  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .cancel-btn,
  .danger-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: 0.2s;
  }
  
  /* Bouton annuler */
  .cancel-btn {
    background-color: #e2e8f0; /* un gris clair */
    color: #1f2937; /* un gris foncé */
  }
  .cancel-btn:hover {
    background-color: #cbd5e1;
  }
  
  /* Bouton confirmer (danger) */
  .danger-btn {
    background-color: #ef4444; /* rouge */
    color: white;
  }
  .danger-btn:hover {
    background-color: #dc2626;
  }
  </style>  