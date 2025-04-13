/**
 * @fileoverview Contrôleurs pour la gestion des questions.
 * Ce module gère la création, la récupération, la mise à jour et la suppression des questions.
 * @module controllers/question.controllers
 */

const Question = require("../models/question.model");

/**
 * @desc Créer une nouvelle question.
 * Vérifie que les champs obligatoires (objectif_id, axe_id, intitule, type_question et pour_ei) sont présents dans le body,
 * puis crée une nouvelle question en appelant le modèle correspondant.
 * Ajoute de nombreux logs pour suivre le déroulement et faciliter le débogage.
 *
 * Les nouveaux champs optionnels permettent de définir si la question est dépendante d'une autre,
 * l'ID de la question parent, et le type de réponse attendu (BINAIRE, ENTIER, TEXTUEL).
 *
 * @route POST /questions
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.body - Contient les données de la question.
 * @param {number|string} req.body.objectif_id - Identifiant de l'objectif associé à la question.
 * @param {number|string} req.body.axe_id - Identifiant de l'axe associé à la question.
 * @param {string} req.body.intitule - Texte ou intitulé de la question.
 * @param {string} [req.body.nom_mesure] - Nom de la mesure associée (optionnel).
 * @param {string} req.body.type_question - Type de la question (ex. 'BINAIRE' ou 'NON_BINAIRE').
 * @param {boolean} req.body.pour_ei - Indique si la question concerne les entités importantes.
 * @param {string} [req.body.recommandation] - Recommandation liée à la question (optionnel).
 * @param {boolean} [req.body.is_dependent=false] - Indique si la question dépend d'une réponse antérieure (optionnel).
 * @param {number} [req.body.depends_on_question_id=null] - Identifiant de la question dont dépend l'affichage (optionnel, requis si is_dependent est true).
 * @param {string} [req.body.answer_type] - Type de réponse attendu pour la question (BINAIRE, ENTIER ou TEXTUEL) (optionnel).
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.createQuestion = async (req, res) => {
  console.log("[createQuestion] Début de la création d'une nouvelle question.");
  try {
    // Extraction des champs existants et des nouveaux paramètres optionnels
    const { 
      objectif_id, 
      axe_id, 
      intitule, 
      nom_mesure, 
      type_question, 
      pour_ei, 
      recommandation, 
      is_dependent, 
      depends_on_question_id, 
      answer_type 
    } = req.body;
    
    console.log("[createQuestion] Données reçues :", { 
      objectif_id, axe_id, intitule, nom_mesure, type_question, pour_ei, recommandation, is_dependent, depends_on_question_id, answer_type 
    });
    
    // Vérification des champs obligatoires
    if (!objectif_id || !axe_id || !intitule || !type_question || pour_ei === undefined) {
      console.error("[createQuestion] Champs obligatoires manquants dans le body.");
      return res.status(400).json({ message: "Les champs objectif_id, axe_id, intitule, type_question et pour_ei sont obligatoires." });
    }
    
    console.log("[createQuestion] Appel du modèle pour créer la question.");
    // Appel du modèle en passant tous les paramètres (les nouveaux paramètres resteront undefined si non fournis)
    const newQuestion = await Question.create(
      objectif_id, 
      axe_id, 
      intitule, 
      nom_mesure, 
      type_question, 
      pour_ei, 
      recommandation, 
      is_dependent, 
      depends_on_question_id, 
      answer_type
    );
    
    console.log("[createQuestion] Question créée avec succès :", newQuestion);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("[createQuestion] Erreur lors de la création de la question :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer toutes les questions d'un objectif.
 * Utilise l'ID de l'objectif passé en paramètre de l'URL pour récupérer l'ensemble des questions associées.
 * Ajoute des logs détaillés pour suivre le processus de récupération.
 *
 * @route GET /questions/objectif/:objectif_id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.objectif_id - Identifiant de l'objectif.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getQuestionsByObjectif = async (req, res) => {
  console.log("[getQuestionsByObjectif] Début de la récupération des questions pour l'objectif ID :", req.params.objectif_id);
  try {
    console.log("[getQuestionsByObjectif] Appel du modèle pour récupérer les questions par objectif.");
    const questions = await Question.getByObjectif(req.params.objectif_id);
    console.log("[getQuestionsByObjectif] Nombre de questions récupérées :", questions.length);
    res.status(200).json(questions);
  } catch (error) {
    console.error("[getQuestionsByObjectif] Erreur lors de la récupération des questions :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Récupérer une question par son ID.
 * Utilise l'ID passé en paramètre de l'URL pour récupérer la question correspondante.
 * Ajoute des logs détaillés pour le suivi du processus.
 *
 * @route GET /questions/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.id - Identifiant de la question.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.getQuestionById = async (req, res) => {
  console.log("[getQuestionById] Début de la récupération de la question avec ID :", req.params.id);
  try {
    console.log("[getQuestionById] Appel du modèle pour récupérer la question par ID.");
    const question = await Question.getById(req.params.id);
    if (!question) {
      console.error("[getQuestionById] Aucune question trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Question non trouvée." });
    }
    console.log("[getQuestionById] Question récupérée avec succès :", question);
    res.status(200).json(question);
  } catch (error) {
    console.error("[getQuestionById] Erreur lors de la récupération de la question :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Mettre à jour une question.
 * Vérifie que les champs obligatoires (intitule, type_question et pour_ei) sont présents dans le body,
 * puis met à jour la question identifiée par l'ID passé en paramètre.
 * Ajoute de nombreux logs pour suivre le processus de mise à jour.
 *
 * Les nouveaux champs optionnels (is_dependent, depends_on_question_id et answer_type) sont aussi pris en compte.
 *
 * @route PUT /questions/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.id - Identifiant de la question.
 * @param {Object} req.body - Contient les données pour la mise à jour.
 * @param {string} req.body.intitule - Nouveau texte ou intitulé de la question.
 * @param {string} [req.body.nom_mesure] - Nouveau nom de la mesure associée (optionnel).
 * @param {string} req.body.type_question - Nouveau type de la question.
 * @param {boolean} req.body.pour_ei - Indique si la question concerne les entités importantes.
 * @param {string} [req.body.recommandation] - Nouvelle recommandation (optionnel).
 * @param {boolean} [req.body.is_dependent] - Indique si la question dépend d'une réponse antérieure (optionnel).
 * @param {number|null} [req.body.depends_on_question_id] - ID de la question dont dépend l'affichage (optionnel).
 * @param {string} [req.body.answer_type] - Nouveau type de réponse (BINAIRE, ENTIER ou TEXTUEL) (optionnel).
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.updateQuestion = async (req, res) => {
  console.log("[updateQuestion] Début de la mise à jour de la question avec ID :", req.params.id);
  try {
    const { 
      intitule, 
      nom_mesure, 
      type_question, 
      pour_ei, 
      recommandation,
      is_dependent, 
      depends_on_question_id, 
      answer_type 
    } = req.body;
    console.log("[updateQuestion] Données reçues pour la mise à jour :", { 
      intitule, nom_mesure, type_question, pour_ei, recommandation, is_dependent, depends_on_question_id, answer_type 
    });
    // Vérification des champs obligatoires
    if (!intitule || !type_question || pour_ei === undefined) {
      console.error("[updateQuestion] Champs obligatoires manquants : intitule, type_question ou pour_ei.");
      return res.status(400).json({ message: "Les champs intitule, type_question et pour_ei sont obligatoires." });
    }
    console.log("[updateQuestion] Appel du modèle pour mettre à jour la question.");
    const updatedQuestion = await Question.update(
      req.params.id, 
      intitule, 
      nom_mesure, 
      type_question, 
      pour_ei, 
      recommandation, 
      is_dependent, 
      depends_on_question_id, 
      answer_type
    );
    if (!updatedQuestion) {
      console.error("[updateQuestion] Aucune question trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Question non trouvée." });
    }
    console.log("[updateQuestion] Question mise à jour avec succès :", updatedQuestion);
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("[updateQuestion] Erreur lors de la mise à jour de la question :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Supprimer une question.
 * Supprime la question identifiée par l'ID passé en paramètre et renvoie une confirmation.
 * Ajoute des logs détaillés pour suivre le processus de suppression.
 *
 * @route DELETE /questions/:id
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Contient les paramètres de l'URL.
 * @param {number|string} req.params.id - Identifiant de la question.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>}
 */
exports.deleteQuestion = async (req, res) => {
  console.log("[deleteQuestion] Début de la suppression de la question avec ID :", req.params.id);
  try {
    console.log("[deleteQuestion] Appel du modèle pour supprimer la question.");
    const deletedQuestion = await Question.delete(req.params.id);
    if (!deletedQuestion) {
      console.error("[deleteQuestion] Aucune question trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Question non trouvée." });
    }
    console.log("[deleteQuestion] Question supprimée avec succès :", deletedQuestion);
    res.status(200).json({ message: "Question supprimée avec succès", question: deletedQuestion });
  } catch (error) {
    console.error("[deleteQuestion] Erreur lors de la suppression de la question :", error.message);
    res.status(500).json({ message: error.message });
  }
};