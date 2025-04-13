/**
 * @fileoverview Contrôleurs pour la gestion des axes.
 * Ce module gère la création, la récupération, la mise à jour et la suppression des axes.
 * @module controllers/axe.controllers
 */

const Axe = require("../models/axe.model");

/**
 * @desc Créer un nouvel axe.
 * Vérifie que le nom est présent dans le body, crée l'axe et renvoie l'objet créé.
 * Ajoute des logs détaillés pour le suivi du processus.
 * @route POST /axes
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.createAxe = async (req, res) => {
  console.log("[createAxe] Début de la création d'un nouvel axe.");
  try {
    const { nom } = req.body;
    console.log("[createAxe] Données reçues dans le body :", { nom });
    if (!nom) {
      console.error("[createAxe] Nom de l'axe manquant dans le body.");
      return res.status(400).json({ message: "Le nom de l'axe est obligatoire." });
    }
    console.log("[createAxe] Appel du modèle pour créer l'axe.");
    const newAxe = await Axe.create(nom);
    console.log("[createAxe] Axe créé avec succès :", newAxe);
    res.status(201).json(newAxe);
  } catch (error) {
    console.error("[createAxe] Erreur lors de la création de l'axe :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer tous les axes.
 * Appelle le modèle pour récupérer la liste de tous les axes et renvoie cette liste.
 * Ajoute des logs détaillés pour le suivi du processus.
 * @route GET /axes
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getAllAxes = async (req, res) => {
  console.log("[getAllAxes] Début de la récupération de tous les axes.");
  try {
    console.log("[getAllAxes] Appel du modèle pour obtenir tous les axes.");
    const axes = await Axe.getAll();
    console.log("[getAllAxes] Nombre d'axes récupérés :", axes.length);
    res.status(200).json(axes);
  } catch (error) {
    console.error("[getAllAxes] Erreur lors de la récupération des axes :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer un axe par son ID.
 * Utilise l'ID passé en paramètre pour récupérer l'axe correspondant.
 * Ajoute des logs détaillés pour le suivi du processus.
 * @route GET /axes/:id
 * @param {Object} req - L'objet requête Express contenant req.params.id.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getAxeById = async (req, res) => {
  console.log("[getAxeById] Début de la récupération de l'axe avec ID :", req.params.id);
  try {
    console.log("[getAxeById] Appel du modèle pour récupérer l'axe par ID.");
    const axe = await Axe.getById(req.params.id);
    if (!axe) {
      console.error("[getAxeById] Aucun axe trouvé pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Axe non trouvé." });
    }
    console.log("[getAxeById] Axe trouvé :", axe);
    res.status(200).json(axe);
  } catch (error) {
    console.error("[getAxeById] Erreur lors de la récupération de l'axe :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Mettre à jour un axe.
 * Vérifie que le nouveau nom est fourni dans le body, met à jour l'axe identifié par req.params.id et renvoie l'axe mis à jour.
 * Ajoute des logs détaillés pour le suivi du processus.
 * @route PUT /axes/:id
 * @param {Object} req - L'objet requête Express contenant req.params.id et req.body.nom.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.updateAxe = async (req, res) => {
  console.log("[updateAxe] Début de la mise à jour de l'axe avec ID :", req.params.id);
  try {
    const { nom } = req.body;
    console.log("[updateAxe] Données reçues pour la mise à jour :", { nom });
    if (!nom) {
      console.error("[updateAxe] Nom manquant dans le body pour la mise à jour.");
      return res.status(400).json({ message: "Le nom est requis pour la mise à jour." });
    }
    console.log("[updateAxe] Appel du modèle pour mettre à jour l'axe.");
    const updatedAxe = await Axe.update(req.params.id, nom);
    if (!updatedAxe) {
      console.error("[updateAxe] Aucun axe trouvé pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Axe non trouvé." });
    }
    console.log("[updateAxe] Axe mis à jour avec succès :", updatedAxe);
    res.status(200).json(updatedAxe);
  } catch (error) {
    console.error("[updateAxe] Erreur lors de la mise à jour de l'axe :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Supprimer un axe.
 * Supprime l'axe identifié par req.params.id et renvoie une confirmation.
 * Ajoute des logs détaillés pour le suivi du processus.
 * @route DELETE /axes/:id
 * @param {Object} req - L'objet requête Express contenant req.params.id.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.deleteAxe = async (req, res) => {
  console.log("[deleteAxe] Début de la suppression de l'axe avec ID :", req.params.id);
  try {
    console.log("[deleteAxe] Appel du modèle pour supprimer l'axe.");
    const deletedAxe = await Axe.delete(req.params.id);
    if (!deletedAxe) {
      console.error("[deleteAxe] Aucun axe trouvé pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Axe non trouvé." });
    }
    console.log("[deleteAxe] Axe supprimé avec succès :", deletedAxe);
    res.status(200).json({ message: "Axe supprimé avec succès", axe: deletedAxe });
  } catch (error) {
    console.error("[deleteAxe] Erreur lors de la suppression de l'axe :", error.message);
    res.status(500).json({ message: error.message });
  }
};