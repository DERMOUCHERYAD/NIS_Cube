import { defineStore } from 'pinia';

/**
 * Store pour la gestion de l'évaluation en cours.
 *
 * Ce store centralise l'identifiant (ID) de l'évaluation actuellement sélectionnée par l'utilisateur.
 * Il permet de partager cet ID entre différents composants de l'application sans devoir le passer
 * explicitement dans l'URL ou via des props.
 *
 * @remarks
 * Utilisation recommandée dans les applications complexes pour centraliser et sécuriser l'état
 * critique, tel que l'ID de l'évaluation en cours.
 *
 * @example
 * ```ts
 * import { useEvaluationStore } from '@/store/evaluationStore';
 * 
 * const evaluationStore = useEvaluationStore();
 * evaluationStore.setCurrentEvaluationId(12);
 * console.log(evaluationStore.currentEvaluationId); // Affiche: 12
 * ```
 */
export const useEvaluationStore = defineStore('evaluation', {
  /**
   * État initial du store.
   */
  state: () => ({
    /**
     * L'ID de l'évaluation courante.
     *
     * @type {number | null}
     */
    currentEvaluationId: null as number | null,
  }),
  actions: {
    /**
     * Définit l'ID de l'évaluation courante.
     *
     * Cette action met à jour l'état du store avec l'ID de l'évaluation qui sera utilisé
     * par les composants de l'application pour accéder aux données correspondantes.
     *
     * @param {number} id - L'identifiant de l'évaluation à définir.
     * @returns {void}
     */
    setCurrentEvaluationId(id: number): void {
      this.currentEvaluationId = id;
    },
  },
});