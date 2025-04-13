/**
 * @fileoverview evaluationFlow.routes.js
 * Ce fichier définit l'ensemble des routes pour gérer le déroulement de l'évaluation (flow).
 * Il regroupe les fonctionnalités suivantes :
 *   - GET /evaluations/:evaluation_id/next-question
 *       -> Récupère la prochaine question non répondue qui satisfait les conditions d'affichage.
 *   - GET /evaluations/:evaluation_id/current-info
 *       -> Retourne les informations courantes de l'évaluation (objectif en cours et axe associé).
 *   - POST /evaluations/:evaluation_id/finalize-objective
 *       -> Finalise l'objectif courant et passe à l'objectif suivant.
 *   - POST /reponses
 *       -> Enregistre la réponse de l'utilisateur à une question en appliquant la logique de calcul du score et de conformité.
 *   - GET /evaluations/:evaluation_id/verify-next-objective
 *       -> Vérifie si la prochaine question appartient à un nouvel objectif et, le cas échéant, finalise l'objectif.
 *
 * Chaque route est documentée via JSDoc et intègre des logs détaillés pour faciliter le suivi et le débogage.
 */

const express = require("express");
const router = express.Router();

// Importation des fonctions du contrôleur regroupé dans evaluationFlow.controller.js
const {
  getNextQuestion,
  getCurrentInfo,
  finalizeObjective,
  postAnswer,
  verifyNextObjective,
  getEvaluationAnsweredDetails
} = require("../controllers/evaluationFlow.controllers");

/**
 * @route GET /evaluations/:evaluation_id/next-question
 * @desc Récupère la prochaine question non répondue qui satisfait les conditions d'affichage pour une évaluation donnée.
 * Exemple d'appel: GET /evaluations/12/next-question?user_id=1
 */
router.get("/evaluations/:evaluation_id/next-question", (req, res, next) => {
  console.log(
    "[Routes] GET /evaluations/:evaluation_id/next-question déclenché avec evaluation_id =",
    req.params.evaluation_id
  );
  getNextQuestion(req, res, next);
});

/**
 * @route GET /evaluations/:evaluation_id/current-info
 * @desc Récupère les informations courantes de l'évaluation, c'est-à-dire l'objectif en cours et l'axe associé.
 * Si aucune réponse n'a encore été fournie, l'objectif par défaut est considéré comme étant l'objectif 1 (axe 1).
 * Exemple d'appel: GET /evaluations/12/current-info?user_id=1
 */
router.get("/evaluations/:evaluation_id/current-info", (req, res, next) => {
  console.log(
    "[Routes] GET /evaluations/:evaluation_id/current-info déclenché avec evaluation_id =",
    req.params.evaluation_id
  );
  getCurrentInfo(req, res, next);
});

/**
 * @route POST /evaluations/:evaluation_id/finalize-objective
 * @desc Finalise l'objectif courant pour une évaluation en passant à l'objectif suivant.
 * Met à jour le champ id_dernier_objectif de l'évaluation et renvoie les informations du nouvel objectif et de son axe.
 * Exemple d'appel: POST /evaluations/12/finalize-objective?user_id=1
 */
router.post("/evaluations/:evaluation_id/finalize-objective", (req, res, next) => {
  console.log(
    "[Routes] POST /evaluations/:evaluation_id/finalize-objective déclenché avec evaluation_id =",
    req.params.evaluation_id
  );
  finalizeObjective(req, res, next);
});

/**
 * @route POST /reponses
 * @desc Enregistre la réponse de l'utilisateur à une question.
 * Selon le type de réponse attendu (BINAIRE, ENTIER, TEXTUEL ou DATE), 
 * le contrôleur calcule le score, détermine la conformité, et pour DATE, calcule is_dynamic et expires_at.
 * Exemple d'appel (body):
 * {
 *   evaluation_id: 12,
 *   user_id: 1,
 *   question_id: 25,
 *   donnee_boolean: true         // ou donnee_entiere, ou donnee_textuelle, ou donnee_date
 * }
 */
router.post("/reponses", (req, res, next) => {
  console.log("[Routes] POST /reponses déclenché.");
  postAnswer(req, res, next);
});

/**
 * @route GET /evaluations/:evaluation_id/verify-next-objective
 * @desc Vérifie si la prochaine question à traiter appartient à un nouvel objectif.
 * Si c'est le cas, l'objectif courant est finalisé et la route renvoie { new_objective_finalized: true }.
 * Sinon, elle renvoie { new_objective_finalized: false }.
 * Exemple d'appel: GET /evaluations/12/verify-next-objective?user_id=1
 */
router.get("/evaluations/:evaluation_id/verify-next-objective", (req, res, next) => {
  console.log(
    "[Routes] GET /evaluations/:evaluation_id/verify-next-objective déclenché avec evaluation_id =",
    req.params.evaluation_id
  );
  verifyNextObjective(req, res, next);
});

/**
 * @route GET /evaluation-flow/evaluation-details/:evaluation_id
 * @desc Récupère, pour un utilisateur et une évaluation donnés, un objet JSON regroupant pour chaque objectif
 *       toutes les questions répondues et, pour chaque question, la réponse de l'utilisateur (toutes les colonnes).
 * Exemple d'appel : GET /evaluation-flow/evaluation-details/14?user_id=1
 */
router.get("/evaluation-details/:evaluation_id", (req, res, next) => {
  console.log("[Routes] GET /evaluation-flow/evaluation-details déclenché avec evaluation_id =", req.params.evaluation_id);
  getEvaluationAnsweredDetails(req, res, next);
});

module.exports = router;