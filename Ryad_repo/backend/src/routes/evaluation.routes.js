/**
 * @fileoverview Routes pour la gestion complète des évaluations.
 * Ce module définit toutes les routes CRUD et dashboard pour l'entité "Evaluation",
 * en s’appuyant sur les contrôleurs correspondants. Chaque route est documentée
 * avec JSDoc (params, réponses, exemples) et génère des logs pour tracer l’exécution.
 *
 * @module routes/evaluation.routes
 * @requires controllers/evaluation.controllers
 *
 */

const express = require("express");
const {
  createEvaluation,
  getEvaluationsByUser,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getDashboardByUser
} = require("../controllers/evaluation.controllers");

const router = express.Router();

/**
 * @route POST /evaluations
 * @desc Créer une nouvelle évaluation pour un utilisateur donné.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Corps de la requête contenant user_id, nom, entityType et optionnel id_dernier_objectif
 * @param {number|string} req.body.user_id - ID de l'utilisateur
 * @param {string} req.body.nom - Nom de l'évaluation
 * @param {string} req.body.entityType - “essential” ou “important”
 * @param {number|string} [req.body.id_dernier_objectif] - ID du dernier objectif (optionnel)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Renvoie la nouvelle évaluation en JSON (status 201) ou une erreur JSON (status 400/500)
 */
router.post("/", (req, res, next) => {
  console.log("[evaluation.routes] POST /evaluations déclenché");
  createEvaluation(req, res, next);
});

/**
 * @route GET /evaluations/user/:user_id
 * @desc Récupère toutes les évaluations associées à un utilisateur.
 * @param {Object} req.params - Contient user_id
 * @param {number|string} req.params.user_id - ID de l'utilisateur
 * @param {Object} res - Renvoie un tableau JSON d'évaluations (status 200) ou erreur (status 500)
 */
router.get("/user/:user_id", (req, res, next) => {
  console.log("[evaluation.routes] GET /evaluations/user/:user_id déclenché pour user_id =", req.params.user_id);
  getEvaluationsByUser(req, res, next);
});

/**
 * @route GET /evaluations/dashboard/user/:user_id
 * @desc Récupère le résumé dashboard de toutes les évaluations d’un utilisateur.
 * @param {Object} req.params - Contient user_id
 * @param {number|string} req.params.user_id - ID de l'utilisateur
 * @param {Object} res - Renvoie un tableau JSON de résumés dashboard (status 200) ou erreur (status 500)
 */
router.get("/dashboard/user/:user_id", (req, res, next) => {
  console.log("[evaluation.routes] GET /evaluations/dashboard/user/:user_id déclenché pour user_id =", req.params.user_id);
  getDashboardByUser(req, res, next);
});

/**
 * @route GET /evaluations/:id
 * @desc Récupère une évaluation par son ID unique.
 * @param {Object} req.params - Contient id
 * @param {number|string} req.params.id - ID de l'évaluation
 * @param {Object} res - Renvoie l’évaluation en JSON (status 200), 404 si non trouvée ou 500 si erreur
 */
router.get("/:id", (req, res, next) => {
  console.log("[evaluation.routes] GET /evaluations/:id déclenché pour id =", req.params.id);
  getEvaluationById(req, res, next);
});

/**
 * @route PUT /evaluations/:id
 * @desc Met à jour les champs d'une évaluation existante.
 * @param {Object} req.params - Contient id
 * @param {Object} req.body - Contient nom (obligatoire), type_entite (obligatoire), id_dernier_objectif (optionnel)
 * @param {Object} res - Renvoie l’évaluation mise à jour (status 200), 404 si non trouvée ou 500 si erreur
 */
router.put("/:id", (req, res, next) => {
  console.log("[evaluation.routes] PUT /evaluations/:id déclenché pour id =", req.params.id);
  updateEvaluation(req, res, next);
});

/**
 * @route DELETE /evaluations/:id
 * @desc Supprime une évaluation existante par son ID.
 * @param {Object} req.params - Contient id
 * @param {Object} res - Renvoie message de confirmation et objet supprimé (status 200), 404 si non trouvé ou 500 si erreur
 */
router.delete("/:id", (req, res, next) => {
  console.log("[evaluation.routes] DELETE /evaluations/:id déclenché pour id =", req.params.id);
  deleteEvaluation(req, res, next);
});

module.exports = router;