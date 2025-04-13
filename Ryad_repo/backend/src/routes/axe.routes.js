/**
 * @fileoverview Routes pour la gestion des axes.
 * Ce module définit les routes pour créer, récupérer, mettre à jour et supprimer des axes.
 * Les logs permettent de suivre l'exécution des requêtes sur ces routes.
 * @module routes/axe.routes
 */

const express = require("express");
const { createAxe, getAllAxes, getAxeById, updateAxe, deleteAxe } = require("../controllers/axe.controllers");

const router = express.Router();

/**
 * @desc Route pour créer un nouvel axe.
 * @route POST /axes/
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.post("/", (req, res, next) => {
  console.log("[axe.routes] Requête POST reçue pour créer un axe.");
  createAxe(req, res, next);
});

/**
 * @desc Route pour récupérer tous les axes.
 * @route GET /axes/
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.get("/", (req, res, next) => {
  console.log("[axe.routes] Requête GET reçue pour récupérer tous les axes.");
  getAllAxes(req, res, next);
});

/**
 * @desc Route pour récupérer un axe par son ID.
 * @route GET /axes/:id
 * @param {Object} req - L'objet requête Express (contient req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.get("/:id", (req, res, next) => {
  console.log("[axe.routes] Requête GET reçue pour récupérer l'axe avec ID :", req.params.id);
  getAxeById(req, res, next);
});

/**
 * @desc Route pour mettre à jour un axe.
 * @route PUT /axes/:id
 * @param {Object} req - L'objet requête Express (contient req.params.id et req.body).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.put("/:id", (req, res, next) => {
  console.log("[axe.routes] Requête PUT reçue pour mettre à jour l'axe avec ID :", req.params.id);
  updateAxe(req, res, next);
});

/**
 * @desc Route pour supprimer un axe.
 * @route DELETE /axes/:id
 * @param {Object} req - L'objet requête Express (contient req.params.id).
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
router.delete("/:id", (req, res, next) => {
  console.log("[axe.routes] Requête DELETE reçue pour supprimer l'axe avec ID :", req.params.id);
  deleteAxe(req, res, next);
});

module.exports = router;