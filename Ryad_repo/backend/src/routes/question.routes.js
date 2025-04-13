/**
 * @fileoverview Routes pour la gestion des questions.
 * Ce module définit les routes pour créer, récupérer, mettre à jour et supprimer des questions.
 * Les logs permettent de suivre l'exécution des requêtes sur ces routes.
 * @module routes/question.routes
 */

const express = require("express");
const { createQuestion, getQuestionsByObjectif, getQuestionById, updateQuestion, deleteQuestion } = require("../controllers/question.controllers");

const router = express.Router();

/**
 * @desc Route pour créer une nouvelle question.
 * @route POST /questions/
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.post("/", (req, res, next) => {
  console.log("[question.routes] Requête POST reçue pour créer une nouvelle question.");
  createQuestion(req, res, next);
});

/**
 * @desc Route pour récupérer toutes les questions associées à un objectif.
 * @route GET /questions/objectif/:objectif_id
 * @param {Object} req - L'objet requête Express (contenant req.params.objectif_id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.get("/objectif/:objectif_id", (req, res, next) => {
  console.log("[question.routes] Requête GET reçue pour récupérer les questions de l'objectif avec ID :", req.params.objectif_id);
  getQuestionsByObjectif(req, res, next);
});

/**
 * @desc Route pour récupérer une question par son ID.
 * @route GET /questions/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.get("/:id", (req, res, next) => {
  console.log("[question.routes] Requête GET reçue pour récupérer la question avec ID :", req.params.id);
  getQuestionById(req, res, next);
});

/**
 * @desc Route pour mettre à jour une question.
 * @route PUT /questions/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id et req.body).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.put("/:id", (req, res, next) => {
  console.log("[question.routes] Requête PUT reçue pour mettre à jour la question avec ID :", req.params.id);
  updateQuestion(req, res, next);
});

/**
 * @desc Route pour supprimer une question.
 * @route DELETE /questions/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.delete("/:id", (req, res, next) => {
  console.log("[question.routes] Requête DELETE reçue pour supprimer la question avec ID :", req.params.id);
  deleteQuestion(req, res, next);
});

module.exports = router;