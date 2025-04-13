/**
 * @fileoverview Contrôleurs pour la gestion des réponses.
 * Ce module gère la création, la récupération, la mise à jour et la suppression des réponses.
 * Il a été mis à jour pour prendre en compte les nouvelles colonnes : donnee_textuelle, conformite, answer_type,
 * is_dynamic et expires_at.
 * @module controllers/reponse.controllers
 */

const Reponse = require("../models/reponse.model");

/**
 * @desc Créer une nouvelle réponse.
 * Extrait les données du body, y compris les nouvelles colonnes donnee_textuelle, conformite, answer_type,
 * is_dynamic et expires_at, effectue des validations et appelle le modèle pour insérer la réponse dans la base.
 *
 * @route POST /reponses
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.body - Données de la réponse.
 * @param {number|string} req.body.evaluation_id - ID de l'évaluation associée.
 * @param {number|string} req.body.user_id - ID de l'utilisateur.
 * @param {number|string} req.body.question_id - ID de la question.
 * @param {number} req.body.score - Score attribué à la réponse (entre 0 et 10).
 * @param {boolean} [req.body.donnee_boolean] - Valeur booléenne (optionnel).
 * @param {number} [req.body.donnee_entiere] - Valeur entière (optionnel, entre 0 et 10).
 * @param {string} [req.body.donnee_textuelle] - Donnée textuelle associée (optionnel).
 * @param {string} [req.body.conformite] - Niveau de conformité ("CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME") (optionnel).
 * @param {string} [req.body.answer_type] - Type de réponse (BINAIRE, ENTIER, TEXTUEL) (optionnel).
 * @param {boolean} [req.body.is_dynamic] - Indique si la réponse est dynamique (optionnel).
 * @param {string} [req.body.expires_at] - Date ISO8601 à laquelle la réponse devient invalide (optionnel).
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.createReponse = async (req, res) => {
  console.log("[createReponse] Début de la création d'une nouvelle réponse.");
  try {
    const {
      evaluation_id,
      user_id,
      question_id,
      score,
      donnee_boolean,
      donnee_entiere,
      donnee_textuelle,
      conformite,
      answer_type,
      is_dynamic,
      expires_at
    } = req.body;
    
    console.log("[createReponse] Données reçues :", {
      evaluation_id,
      user_id,
      question_id,
      score,
      donnee_boolean,
      donnee_entiere,
      donnee_textuelle,
      conformite,
      answer_type,
      is_dynamic,
      expires_at
    });
    
    // Vérifier la présence des champs obligatoires
    if (!evaluation_id || !user_id || !question_id || score === undefined) {
      console.error("[createReponse] Champs obligatoires manquants : evaluation_id, user_id, question_id ou score.");
      return res.status(400).json({ message: "Les champs evaluation_id, user_id, question_id et score sont obligatoires." });
    }
    
    // Validation optionnelle pour 'conformite' si fourni
    const allowedConformite = ["CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME"];
    if (conformite && !allowedConformite.includes(conformite)) {
      console.error("[createReponse] Valeur de 'conformite' invalide :", conformite);
      return res.status(400).json({ message: "La valeur de 'conformite' doit être 'CONFORME', 'PARTIELLEMENT_CONFORME' ou 'NON_CONFORME'." });
    }
    
    // Validation optionnelle pour 'answer_type' si fourni
    const allowedAnswerTypes = ["BINAIRE", "ENTIER", "TEXTUEL"];
    if (answer_type && !allowedAnswerTypes.includes(answer_type)) {
      console.error("[createReponse] Valeur de 'answer_type' invalide :", answer_type);
      return res.status(400).json({ message: "La valeur de 'answer_type' doit être 'BINAIRE', 'ENTIER' ou 'TEXTUEL'." });
    }

    // (Optionnel) Vérifier si 'is_dynamic' est bien un booléen si fourni
    if (is_dynamic !== undefined && typeof is_dynamic !== "boolean") {
      console.error("[createReponse] is_dynamic doit être un booléen :", is_dynamic);
      return res.status(400).json({ message: "La valeur de 'is_dynamic' doit être un booléen (true/false)." });
    }

    // (Optionnel) Vérifier si 'expires_at' est une date valide si fourni
    if (expires_at !== undefined) {
      const isValidDate = !isNaN(Date.parse(expires_at));
      if (!isValidDate) {
        console.error("[createReponse] expires_at n'est pas une date valide :", expires_at);
        return res.status(400).json({ message: "La valeur de 'expires_at' doit être une date valide (ISO8601)." });
      }
    }
    
    console.log("[createReponse] Appel du modèle pour créer la réponse.");
    const newReponse = await Reponse.create(
      evaluation_id,
      user_id,
      question_id,
      score,
      donnee_boolean,
      donnee_entiere,
      donnee_textuelle,
      conformite,
      answer_type,
      is_dynamic,
      expires_at
    );
    console.log("[createReponse] Réponse créée avec succès :", newReponse);
    res.status(201).json(newReponse);
  } catch (error) {
    console.error("[createReponse] Erreur lors de la création de la réponse :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer toutes les réponses d'une évaluation.
 * Utilise l'ID de l'évaluation passé en paramètre pour récupérer l'ensemble des réponses associées.
 *
 * @route GET /reponses/evaluation/:evaluation_id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Paramètres de l'URL.
 * @param {number|string} req.params.evaluation_id - ID de l'évaluation.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getReponsesByEvaluation = async (req, res) => {
  console.log("[getReponsesByEvaluation] Début de la récupération des réponses pour l'évaluation ID :", req.params.evaluation_id);
  try {
    console.log("[getReponsesByEvaluation] Appel du modèle pour récupérer les réponses.");
    const reponses = await Reponse.getByEvaluation(req.params.evaluation_id);
    console.log("[getReponsesByEvaluation] Nombre de réponses récupérées :", reponses.length);
    res.status(200).json(reponses);
  } catch (error) {
    console.error("[getReponsesByEvaluation] Erreur lors de la récupération des réponses :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer une réponse par son ID.
 *
 * @route GET /reponses/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient l'ID de la réponse.
 * @param {number|string} req.params.id - ID de la réponse.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getReponseById = async (req, res) => {
  console.log("[getReponseById] Début de la récupération de la réponse avec ID :", req.params.id);
  try {
    console.log("[getReponseById] Appel du modèle pour récupérer la réponse par ID.");
    const reponse = await Reponse.getById(req.params.id);
    if (!reponse) {
      console.error("[getReponseById] Aucune réponse trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Réponse non trouvée." });
    }
    console.log("[getReponseById] Réponse récupérée avec succès :", reponse);
    res.status(200).json(reponse);
  } catch (error) {
    console.error("[getReponseById] Erreur lors de la récupération de la réponse :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Mettre à jour une réponse.
 * Vérifie qu'au moins un des champs (score, donnee_boolean, donnee_entiere, donnee_textuelle, conformite, answer_type,
 * is_dynamic ou expires_at) est fourni, puis met à jour la réponse identifiée par l'ID.
 *
 * @route PUT /reponses/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Paramètres de l'URL.
 * @param {number|string} req.params.id - ID de la réponse.
 * @param {Object} req.body - Données à mettre à jour.
 * @param {number} [req.body.score] - Nouveau score.
 * @param {boolean} [req.body.donnee_boolean] - Nouvelle valeur booléenne.
 * @param {number} [req.body.donnee_entiere] - Nouvelle valeur entière.
 * @param {string} [req.body.donnee_textuelle] - Nouvelle donnée textuelle.
 * @param {string} [req.body.conformite] - Nouveau niveau de conformité ("CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME").
 * @param {string} [req.body.answer_type] - Nouveau type de réponse (BINAIRE, ENTIER ou TEXTUEL).
 * @param {boolean} [req.body.is_dynamic] - Indique si la réponse est dynamique.
 * @param {string} [req.body.expires_at] - Date ISO8601 à laquelle la réponse devient invalide.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.updateReponse = async (req, res) => {
  console.log("[updateReponse] Début de la mise à jour de la réponse avec ID :", req.params.id);
  try {
    const { 
      score, 
      donnee_boolean, 
      donnee_entiere, 
      donnee_textuelle, 
      conformite, 
      answer_type,
      is_dynamic,
      expires_at
    } = req.body;

    console.log("[updateReponse] Données reçues pour la mise à jour :", {
      score,
      donnee_boolean,
      donnee_entiere,
      donnee_textuelle,
      conformite,
      answer_type,
      is_dynamic,
      expires_at
    });
    
    // Vérification qu'au moins un champ est fourni pour la mise à jour
    if (
      score === undefined &&
      donnee_boolean === undefined &&
      donnee_entiere === undefined &&
      donnee_textuelle === undefined &&
      conformite === undefined &&
      answer_type === undefined &&
      is_dynamic === undefined &&
      expires_at === undefined
    ) {
      console.error("[updateReponse] Aucun champ fourni pour la mise à jour.");
      return res.status(400).json({ message: "Au moins un champ doit être mis à jour." });
    }
    
    // Validation du score et de la valeur entière (déjà présente)
    if (score !== undefined && (score < 0 || score > 10)) {
      console.error("[updateReponse] Score invalide :", score);
      throw new Error("Le score doit être entre 0 et 10.");
    }
    if (
      donnee_entiere !== null &&
      donnee_entiere !== undefined &&
      (donnee_entiere < 0 || donnee_entiere > 10)
    ) {
      console.error("[updateReponse] Valeur entière invalide :", donnee_entiere);
      throw new Error("La valeur entière doit être entre 0 et 10.");
    }
    
    // Validation de 'conformite' si fourni
    const allowedConformite = ["CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME"];
    if (conformite && !allowedConformite.includes(conformite)) {
      console.error("[updateReponse] Valeur de 'conformite' invalide :", conformite);
      return res.status(400).json({
        message: "La valeur de 'conformite' doit être 'CONFORME', 'PARTIELLEMENT_CONFORME' ou 'NON_CONFORME'.",
      });
    }
    
    // Validation de 'answer_type' si fourni
    const allowedAnswerTypes = ["BINAIRE", "ENTIER", "TEXTUEL"];
    if (answer_type && !allowedAnswerTypes.includes(answer_type)) {
      console.error("[updateReponse] Valeur de 'answer_type' invalide :", answer_type);
      return res.status(400).json({ message: "La valeur de 'answer_type' doit être 'BINAIRE', 'ENTIER' ou 'TEXTUEL'." });
    }

    // Vérifier si 'is_dynamic' est un booléen si fourni
    if (is_dynamic !== undefined && typeof is_dynamic !== "boolean") {
      console.error("[updateReponse] is_dynamic doit être un booléen :", is_dynamic);
      return res.status(400).json({ message: "La valeur de 'is_dynamic' doit être un booléen (true/false)." });
    }

    // Vérifier si 'expires_at' est une date valide si fourni
    if (expires_at !== undefined) {
      const isValidDate = !isNaN(Date.parse(expires_at));
      if (!isValidDate) {
        console.error("[updateReponse] expires_at n'est pas une date valide :", expires_at);
        return res.status(400).json({ message: "La valeur de 'expires_at' doit être une date valide (ISO8601)." });
      }
    }
    
    console.log("[updateReponse] Appel du modèle pour mettre à jour la réponse.");
    const updatedReponse = await Reponse.update(
      req.params.id,
      score,
      donnee_boolean,
      donnee_entiere,
      donnee_textuelle,
      conformite,
      answer_type,
      is_dynamic,
      expires_at
    );
    if (!updatedReponse) {
      console.error("[updateReponse] Aucune réponse trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Réponse non trouvée." });
    }
    console.log("[updateReponse] Réponse mise à jour avec succès :", updatedReponse);
    res.status(200).json(updatedReponse);
  } catch (error) {
    console.error("[updateReponse] Erreur lors de la mise à jour de la réponse :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Supprimer une réponse.
 * Supprime la réponse identifiée par l'ID et renvoie l'objet supprimé.
 *
 * @route DELETE /reponses/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient l'ID de la réponse.
 * @param {number|string} req.params.id - ID de la réponse.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.deleteReponse = async (req, res) => {
  console.log("[deleteReponse] Début de la suppression de la réponse avec ID :", req.params.id);
  try {
    console.log("[deleteReponse] Appel du modèle pour supprimer la réponse.");
    const deletedReponse = await Reponse.delete(req.params.id);
    if (!deletedReponse) {
      console.error("[deleteReponse] Aucune réponse trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Réponse non trouvée." });
    }
    console.log("[deleteReponse] Réponse supprimée avec succès :", deletedReponse);
    res.status(200).json({ message: "Réponse supprimée avec succès", reponse: deletedReponse });
  } catch (error) {
    console.error("[deleteReponse] Erreur lors de la suppression de la réponse :", error.message);
    res.status(500).json({ message: error.message });
  }
};