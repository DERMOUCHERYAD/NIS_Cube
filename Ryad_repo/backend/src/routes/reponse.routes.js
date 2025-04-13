/**
 * @fileoverview Routes pour la gestion des réponses.
 * Ce module définit les routes CRUD pour l'entité "Réponse".
 * Les contrôleurs associés ont été mis à jour pour gérer les nouvelles colonnes
 * donnee_textuelle et conformite.
 * @module routes/reponse.routes
 */

const express = require("express");
const {
  createReponse,
  getReponsesByEvaluation,
  getReponseById,
  updateReponse,
  deleteReponse
} = require("../controllers/reponse.controllers");

const router = express.Router();

/**
 * @desc Route pour créer une nouvelle réponse.
 * @route POST /reponses/
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction middleware suivante.
 */
router.post("/", (req, res, next) => {
  console.log("[reponse.routes] Requête POST reçue pour créer une nouvelle réponse.");
  createReponse(req, res, next);
});

/**
 * @desc Route pour récupérer toutes les réponses d'une évaluation.
 * @route GET /reponses/evaluation/:evaluation_id
 * @param {Object} req - L'objet requête Express (contenant req.params.evaluation_id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction middleware suivante.
 */
router.get("/evaluation/:evaluation_id", (req, res, next) => {
  console.log("[reponse.routes] Requête GET reçue pour récupérer les réponses de l'évaluation avec ID :", req.params.evaluation_id);
  getReponsesByEvaluation(req, res, next);
});

/**
 * @desc Route pour récupérer une réponse par son ID.
 * @route GET /reponses/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction middleware suivante.
 */
router.get("/:id", (req, res, next) => {
  console.log("[reponse.routes] Requête GET reçue pour récupérer la réponse avec ID :", req.params.id);
  getReponseById(req, res, next);
});

/**
 * @desc Route pour mettre à jour une réponse.
 * @route PUT /reponses/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id et req.body).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction middleware suivante.
 */
router.put("/:id", (req, res, next) => {
  console.log("[reponse.routes] Requête PUT reçue pour mettre à jour la réponse avec ID :", req.params.id);
  updateReponse(req, res, next);
});

/**
 * @desc Route pour supprimer une réponse.
 * @route DELETE /reponses/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction middleware suivante.
 */
router.delete("/:id", (req, res, next) => {
  console.log("[reponse.routes] Requête DELETE reçue pour supprimer la réponse avec ID :", req.params.id);
  deleteReponse(req, res, next);
});

module.exports = router;