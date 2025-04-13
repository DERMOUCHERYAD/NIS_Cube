/**
 * @fileoverview Contrôleurs pour la gestion des objectifs.
 * Ce module gère la création, la récupération, la mise à jour et la suppression des objectifs.
 * @module controllers/objectif.controllers
 */

const Objectif = require("../models/objectif.model");

/**
 * @desc Créer un nouvel objectif.
 * Vérifie que les champs obligatoires (axe_id, description, justification_risques) sont présents dans le body,
 * puis crée un nouvel objectif en appelant le modèle.
 * Ajoute de nombreux logs pour suivre le processus et faciliter le débogage.
 * @route POST /objectifs
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.body - Contient les données de l'objectif.
 * @param {number|string} req.body.axe_id - Identifiant de l'axe associé à l'objectif.
 * @param {string} req.body.description - Description de l'objectif.
 * @param {string} req.body.justification_risques - Justification des risques associés.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.createObjectif = async (req, res) => {
  console.log("[createObjectif] Début de la création d'un nouvel objectif.");
  try {
    const { axe_id, description, justification_risques } = req.body;
    console.log("[createObjectif] Données reçues :", { axe_id, description, justification_risques });
    if (!axe_id || !description || !justification_risques) {
      console.error("[createObjectif] Champs obligatoires manquants : axe_id, description ou justification_risques.");
      return res.status(400).json({ message: "L'ID de l'axe, la description et la justification des risques sont obligatoires." });
    }
    console.log("[createObjectif] Appel du modèle pour créer l'objectif.");
    const newObjectif = await Objectif.create(axe_id, description, justification_risques);
    console.log("[createObjectif] Objectif créé avec succès :", newObjectif);
    res.status(201).json(newObjectif);
  } catch (error) {
    console.error("[createObjectif] Erreur lors de la création de l'objectif :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer tous les objectifs d'un axe.
 * Utilise l'ID de l'axe passé en paramètre de l'URL pour récupérer les objectifs associés.
 * Ajoute des logs détaillés pour suivre le processus.
 * @route GET /objectifs/axe/:axe_id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.axe_id - Identifiant de l'axe.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getObjectifsByAxe = async (req, res) => {
  console.log("[getObjectifsByAxe] Début de la récupération des objectifs pour l'axe ID :", req.params.axe_id);
  try {
    console.log("[getObjectifsByAxe] Appel du modèle pour récupérer les objectifs par axe.");
    const objectifs = await Objectif.getByAxe(req.params.axe_id);
    console.log("[getObjectifsByAxe] Nombre d'objectifs récupérés :", objectifs.length);
    res.status(200).json(objectifs);
  } catch (error) {
    console.error("[getObjectifsByAxe] Erreur lors de la récupération des objectifs :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer un objectif par son ID.
 * Utilise l'ID passé en paramètre de l'URL pour récupérer l'objectif correspondant.
 * Ajoute des logs détaillés pour suivre le processus.
 * @route GET /objectifs/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.id - Identifiant de l'objectif.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getObjectifById = async (req, res) => {
  console.log("[getObjectifById] Début de la récupération de l'objectif avec ID :", req.params.id);
  try {
    console.log("[getObjectifById] Appel du modèle pour récupérer l'objectif par ID.");
    const objectif = await Objectif.getById(req.params.id);
    if (!objectif) {
      console.error("[getObjectifById] Aucun objectif trouvé pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Objectif non trouvé." });
    }
    console.log("[getObjectifById] Objectif récupéré avec succès :", objectif);
    res.status(200).json(objectif);
  } catch (error) {
    console.error("[getObjectifById] Erreur lors de la récupération de l'objectif :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Mettre à jour un objectif.
 * Vérifie que les champs obligatoires (description, justification_risques) sont présents dans le body,
 * puis met à jour l'objectif identifié par l'ID passé en paramètre.
 * Ajoute de nombreux logs pour suivre le processus de mise à jour.
 * @route PUT /objectifs/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.id - Identifiant de l'objectif.
 * @param {Object} req.body - Contient les données pour la mise à jour.
 * @param {string} req.body.description - Nouvelle description de l'objectif.
 * @param {string} req.body.justification_risques - Nouvelle justification des risques.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.updateObjectif = async (req, res) => {
  console.log("[updateObjectif] Début de la mise à jour de l'objectif avec ID :", req.params.id);
  try {
    const { description, justification_risques } = req.body;
    console.log("[updateObjectif] Données reçues pour la mise à jour :", { description, justification_risques });
    if (!description || !justification_risques) {
      console.error("[updateObjectif] Champs obligatoires manquants : description ou justification_risques.");
      return res.status(400).json({ message: "Description et justification des risques sont obligatoires." });
    }
    console.log("[updateObjectif] Appel du modèle pour mettre à jour l'objectif.");
    const updatedObjectif = await Objectif.update(req.params.id, description, justification_risques);
    if (!updatedObjectif) {
      console.error("[updateObjectif] Aucun objectif trouvé pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Objectif non trouvé." });
    }
    console.log("[updateObjectif] Objectif mis à jour avec succès :", updatedObjectif);
    res.status(200).json(updatedObjectif);
  } catch (error) {
    console.error("[updateObjectif] Erreur lors de la mise à jour de l'objectif :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Supprimer un objectif.
 * Supprime l'objectif identifié par l'ID passé en paramètre et renvoie une confirmation.
 * Ajoute des logs détaillés pour suivre le processus de suppression.
 * @route DELETE /objectifs/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.id - Identifiant de l'objectif.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.deleteObjectif = async (req, res) => {
  console.log("[deleteObjectif] Début de la suppression de l'objectif avec ID :", req.params.id);
  try {
    console.log("[deleteObjectif] Appel du modèle pour supprimer l'objectif.");
    const deletedObjectif = await Objectif.delete(req.params.id);
    if (!deletedObjectif) {
      console.error("[deleteObjectif] Aucun objectif trouvé pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Objectif non trouvé." });
    }
    console.log("[deleteObjectif] Objectif supprimé avec succès :", deletedObjectif);
    res.status(200).json({ message: "Objectif supprimé avec succès", objectif: deletedObjectif });
  } catch (error) {
    console.error("[deleteObjectif] Erreur lors de la suppression de l'objectif :", error.message);
    res.status(500).json({ message: error.message });
  }
};