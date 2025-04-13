/**
 * @fileoverview Routes pour la gestion des objectifs.
 * Ce module définit les routes pour créer, récupérer, mettre à jour et supprimer des objectifs.
 * Les logs permettent de suivre l'exécution des requêtes sur ces routes.
 * @module routes/objectif.routes
 */

const express = require("express");
const { createObjectif, getObjectifsByAxe, getObjectifById, updateObjectif, deleteObjectif } = require("../controllers/objectif.controllers");

const router = express.Router();

/**
 * @desc Route pour créer un nouvel objectif.
 * @route POST /objectifs/
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.post("/", (req, res, next) => {
  console.log("[objectif.routes] Requête POST reçue pour créer un objectif.");
  createObjectif(req, res, next);
});

/**
 * @desc Route pour récupérer tous les objectifs associés à un axe.
 * @route GET /objectifs/axe/:axe_id
 * @param {Object} req - L'objet requête Express (contenant req.params.axe_id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.get("/axe/:axe_id", (req, res, next) => {
  console.log("[objectif.routes] Requête GET reçue pour récupérer les objectifs de l'axe avec ID :", req.params.axe_id);
  getObjectifsByAxe(req, res, next);
});

/**
 * @desc Route pour récupérer un objectif par son ID.
 * @route GET /objectifs/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.get("/:id", (req, res, next) => {
  console.log("[objectif.routes] Requête GET reçue pour récupérer l'objectif avec ID :", req.params.id);
  getObjectifById(req, res, next);
});

/**
 * @desc Route pour mettre à jour un objectif.
 * @route PUT /objectifs/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id et req.body).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.put("/:id", (req, res, next) => {
  console.log("[objectif.routes] Requête PUT reçue pour mettre à jour l'objectif avec ID :", req.params.id);
  updateObjectif(req, res, next);
});

/**
 * @desc Route pour supprimer un objectif.
 * @route DELETE /objectifs/:id
 * @param {Object} req - L'objet requête Express (contenant req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.delete("/:id", (req, res, next) => {
  console.log("[objectif.routes] Requête DELETE reçue pour supprimer l'objectif avec ID :", req.params.id);
  deleteObjectif(req, res, next);
});

module.exports = router;