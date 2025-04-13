/**
 * @fileoverview evaluationFlow.controller.js
 * Ce fichier regroupe l'ensemble des contrôleurs gérant le déroulement de l'évaluation.
 * Il inclut les fonctions suivantes :
 *   - getNextQuestion() : Récupère la prochaine question non répondue selon les conditions d'affichage.
 *   - getCurrentInfo() : Retourne les informations courantes de l'évaluation (objectif et axe).
 *   - finalizeObjective() : Finalise l'objectif courant et passe à l'objectif suivant.
 *   - postAnswer() : Enregistre la réponse de l'utilisateur à une question et calcule les scores, conformités, etc.
 *   - verifyNextObjective() : Vérifie si la prochaine question appartient à un nouvel objectif,
 *                             et le cas échéant finalise l'objectif courant.
 */

const pool = require("../config/db");

/**
 * Récupère la prochaine question non répondue qui satisfait les conditions d’affichage.
 *
 * Conditions :
 *   - Pour une évaluation de type EI, seule une question avec pour_ei=true est affichée.
 *   - Pour une question dépendante (is_dependent=true), on vérifie que le score de la réponse de la
 *     question parente (depends_on_question_id) est supérieur ou égal au seuil minimal (min_score).
 *
 * @async
 * @function getNextQuestion
 * @param {Object} req - Objet de requête Express.
 * @param {Object} res - Objet de réponse Express.
 * @returns {Object} JSON contenant la question à afficher.
 */
exports.getNextQuestion = async (req, res) => {
  console.log("[getNextQuestion] Début de la méthode getNextQuestion.");
  try {
    // Récupération des paramètres evaluation_id (dans les paramètres URL) et user_id (en query)
    const evaluation_id = req.params.evaluation_id;
    const user_id = req.query.user_id;
    console.log("[getNextQuestion] evaluation_id:", evaluation_id, "user_id:", user_id);

    if (!evaluation_id || !user_id) {
      console.error("[getNextQuestion] Erreur: evaluation_id ou user_id manquant.");
      return res.status(400).json({ message: "evaluation_id et user_id sont requis." });
    }

    // 1. Récupérer l'évaluation pour connaître son type (EE ou EI)
    console.log("[getNextQuestion] Récupération de l'évaluation.");
    const evaluationQuery = "SELECT * FROM evaluation WHERE evaluation_id = $1 AND user_id = $2";
    const evaluationResult = await pool.query(evaluationQuery, [evaluation_id, user_id]);
    if (evaluationResult.rows.length === 0) {
      console.error("[getNextQuestion] Aucune évaluation trouvée pour evaluation_id:", evaluation_id);
      return res.status(404).json({ message: "Évaluation non trouvée pour cet utilisateur." });
    }
    const evaluation = evaluationResult.rows[0];
    console.log("[getNextQuestion] Évaluation récupérée:", evaluation);

    // 2. Récupérer le dernier identifiant de question répondu
    console.log("[getNextQuestion] Récupération du dernier question_id répondu.");
    const lastAnswerQuery = `
      SELECT question_id 
      FROM reponse 
      WHERE evaluation_id = $1 AND user_id = $2 
      ORDER BY question_id DESC 
      LIMIT 1
    `;
    const lastAnswerResult = await pool.query(lastAnswerQuery, [evaluation_id, user_id]);
    let lastQuestionId = 0;
    if (lastAnswerResult.rows.length > 0) {
      lastQuestionId = lastAnswerResult.rows[0].question_id;
    }
    console.log("[getNextQuestion] Dernier question_id répondu:", lastQuestionId);

    // 3. Récupérer toutes les questions dont l'ID est supérieur à celui du dernier répondu, par ordre croissant
    console.log("[getNextQuestion] Récupération des questions suivantes.");
    const nextQuestionsQuery = `
      SELECT * 
      FROM question 
      WHERE question_id > $1 
      ORDER BY question_id ASC
    `;
    const nextQuestionsResult = await pool.query(nextQuestionsQuery, [lastQuestionId]);
    console.log("[getNextQuestion] Nombre de questions récupérées:", nextQuestionsResult.rows.length);

    let nextQuestion = null;

    // 4. Parcourir les questions pour appliquer les conditions d'affichage.
    for (const question of nextQuestionsResult.rows) {
      console.log("[getNextQuestion] Évaluation de la question_id:", question.question_id);

      // Condition 1: Vérifier la compatibilité avec le type d'évaluation (EI/EE)
      if (evaluation.type_entite === 'EI' && !question.pour_ei) {
        console.log("[getNextQuestion] Ignorer question_id", question.question_id, "- condition pour_ei non respectée pour EI.");
        continue;
      }
      // Pour une évaluation EE, aucune restriction sur pour_ei n'est appliquée.

      // Condition 2: Si la question est dépendante, vérifier le score de la réponse de la question parente.
      if (question.is_dependent) {
        console.log("[getNextQuestion] Question_id", question.question_id, "est dépendante. Récupération du score de la question parente (id:", question.depends_on_question_id, ").");
        const parentAnswerQuery = `
          SELECT score 
          FROM reponse 
          WHERE evaluation_id = $1 AND user_id = $2 AND question_id = $3
        `;
        const parentAnswerResult = await pool.query(parentAnswerQuery, [evaluation_id, user_id, question.depends_on_question_id]);
        if (parentAnswerResult.rows.length === 0) {
          console.log("[getNextQuestion] Aucune réponse trouvée pour la question parente id:", question.depends_on_question_id, "pour question_id:", question.question_id);
          continue;
        }
        const parentScore = parentAnswerResult.rows[0].score;
        console.log("[getNextQuestion] Score de la question parente:", parentScore, "seuil min_score:", question.min_score);
        if (parentScore < question.min_score) {
          console.log("[getNextQuestion] Score insuffisant pour afficher question_id:", question.question_id);
          continue;
        }
      }
      // Si toutes les conditions sont remplies, c'est la question à afficher.
      nextQuestion = question;
      console.log("[getNextQuestion] Question trouvée:", question.question_id);
      break;
    }

    if (!nextQuestion) {
      console.error("[getNextQuestion] Aucune question valide trouvée pour evaluation_id:", evaluation_id);
      return res.status(404).json({ message: "Aucune question valide trouvée pour cette évaluation." });
    }

    console.log("[getNextQuestion] Renvoi de la prochaine question:", nextQuestion);
    return res.status(200).json(nextQuestion);
  } catch (error) {
    console.error("[getNextQuestion] Erreur:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Récupère les informations courantes de l’évaluation, c'est-à-dire l'objectif en cours et son axe associé.
 * Si aucune réponse n’a encore été fournie, l’objectif par défaut est considéré comme étant l’objectif 1 (axe 1).
 *
 * @async
 * @function getCurrentInfo
 * @param {Object} req - Objet de requête Express.
 * @param {Object} res - Objet de réponse Express.
 * @returns {Object} JSON contenant evaluation_id, current_objective et current_axis.
 */
exports.getCurrentInfo = async (req, res) => {
  console.log("[getCurrentInfo] Début de la méthode getCurrentInfo.");
  try {
    const { evaluation_id } = req.params;
    const { user_id } = req.query;
    console.log("[getCurrentInfo] evaluation_id:", evaluation_id, "user_id:", user_id);

    if (!evaluation_id || !user_id) {
      console.error("[getCurrentInfo] Erreur: evaluation_id ou user_id manquant.");
      return res.status(400).json({ message: "evaluation_id et user_id sont requis." });
    }

    // Récupérer l'évaluation
    console.log("[getCurrentInfo] Récupération de l'évaluation.");
    const evalQuery = "SELECT * FROM evaluation WHERE evaluation_id = $1 AND user_id = $2";
    const evalResult = await pool.query(evalQuery, [evaluation_id, user_id]);
    if (evalResult.rows.length === 0) {
      console.error("[getCurrentInfo] Évaluation non trouvée pour evaluation_id:", evaluation_id);
      return res.status(404).json({ message: "Évaluation non trouvée pour cet utilisateur." });
    }
    const evaluation = evalResult.rows[0];
    console.log("[getCurrentInfo] Évaluation récupérée:", evaluation);

    // Déterminer l'objectif courant : s'il n'y a aucune réponse, l'objectif 1 est utilisé par défaut.
    const currentObjectiveId = evaluation.id_dernier_objectif || 1;
    console.log("[getCurrentInfo] Objectif courant déterminé:", currentObjectiveId);

    // Récupérer l'objectif et l'axe associé
    console.log("[getCurrentInfo] Récupération de l'objectif et de l'axe associé.");
    const objectiveQuery = `
      SELECT o.*, a.nom AS axe_nom 
      FROM objectif o
      JOIN axe a ON o.axe_id = a.axe_id
      WHERE o.objectif_id = $1
    `;
    const objectiveResult = await pool.query(objectiveQuery, [currentObjectiveId]);
    if (objectiveResult.rows.length === 0) {
      console.error("[getCurrentInfo] Objectif courant non trouvé pour objective_id:", currentObjectiveId);
      return res.status(404).json({ message: "Objectif courant non trouvé." });
    }
    const currentObjective = objectiveResult.rows[0];
    console.log("[getCurrentInfo] Objectif courant récupéré:", currentObjective);

    const responsePayload = {
      evaluation_id: evaluation.evaluation_id,
      current_objective: currentObjective,
      current_axis: {
        axe_id: currentObjective.axe_id,
        nom: currentObjective.axe_nom
      }
    };

    console.log("[getCurrentInfo] Renvoi des informations courantes:", responsePayload);
    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("[getCurrentInfo] Erreur:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Finalise l'objectif courant pour une évaluation en passant à l'objectif suivant.
 * Cette fonction met à jour l'évaluation (champ id_dernier_objectif) et renvoie les informations
 * du nouvel objectif et de son axe associé.
 *
 * @async
 * @function finalizeObjective
 * @param {Object} req - Objet de requête Express.
 * @param {Object} res - Objet de réponse Express.
 * @returns {Object} JSON contenant message, new_objective et new_axis.
 */
exports.finalizeObjective = async (req, res) => {
  console.log("[finalizeObjective] Début de la méthode finalizeObjective.");
  try {
    const { evaluation_id } = req.params;
    const { user_id } = req.query;
    console.log("[finalizeObjective] evaluation_id:", evaluation_id, "user_id:", user_id);

    if (!evaluation_id || !user_id) {
      console.error("[finalizeObjective] Erreur: evaluation_id ou user_id manquant.");
      return res.status(400).json({ message: "evaluation_id et user_id sont requis." });
    }

    // Récupérer l'évaluation
    console.log("[finalizeObjective] Récupération de l'évaluation.");
    const evalQuery = "SELECT * FROM evaluation WHERE evaluation_id = $1 AND user_id = $2";
    const evalResult = await pool.query(evalQuery, [evaluation_id, user_id]);
    if (evalResult.rows.length === 0) {
      console.error("[finalizeObjective] Évaluation non trouvée pour evaluation_id:", evaluation_id);
      return res.status(404).json({ message: "Évaluation non trouvée pour cet utilisateur." });
    }
    const evaluation = evalResult.rows[0];
    console.log("[finalizeObjective] Évaluation récupérée:", evaluation);

    // Déterminer l'objectif courant (si aucune réponse, objectif 1 par défaut)
    const currentObjectiveId = evaluation.id_dernier_objectif || 1;
    console.log("[finalizeObjective] Objectif courant:", currentObjectiveId);

    // Chercher l'objectif suivant dans l'ordre croissant d'objectifs
    console.log("[finalizeObjective] Recherche du prochain objectif.");
    const nextObjectiveQuery = `
      SELECT o.*, a.nom AS axe_nom
      FROM objectif o
      JOIN axe a ON o.axe_id = a.axe_id
      WHERE o.objectif_id > $1
      ORDER BY o.objectif_id ASC
      LIMIT 1
    `;
    const nextObjectiveResult = await pool.query(nextObjectiveQuery, [currentObjectiveId]);
    if (nextObjectiveResult.rows.length === 0) {
      console.error("[finalizeObjective] Aucun objectif suivant trouvé pour objective_id:", currentObjectiveId);
      return res.status(404).json({ message: "Aucun objectif suivant trouvé, évaluation terminée ?" });
    }
    const nextObjective = nextObjectiveResult.rows[0];
    console.log("[finalizeObjective] Prochain objectif trouvé:", nextObjective);

    // Mettre à jour l'évaluation avec le nouvel objectif courant
    console.log("[finalizeObjective] Mise à jour de l'évaluation avec l'objectif:", nextObjective.objectif_id);
    const updateQuery = `
      UPDATE evaluation 
      SET id_dernier_objectif = $1, date_derniere_modification = CURRENT_TIMESTAMP 
      WHERE evaluation_id = $2 AND user_id = $3
      RETURNING *
    `;
    await pool.query(updateQuery, [nextObjective.objectif_id, evaluation_id, user_id]);
    console.log("[finalizeObjective] Évaluation mise à jour avec succès.");

    const responsePayload = {
      message: "Objectif finalisé avec succès.",
      new_objective: nextObjective,
      new_axis: {
        axe_id: nextObjective.axe_id,
        nom: nextObjective.axe_nom
      }
    };

    console.log("[finalizeObjective] Renvoi de la réponse:", responsePayload);
    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("[finalizeObjective] Erreur:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Enregistre la réponse de l'utilisateur à une question.
 *
 * En fonction du type de réponse attendu par la question (BINAIRE, ENTIER, TEXTUEL ou DATE),
 * cette fonction récupère la valeur fournie par l'utilisateur, calcule le score, détermine la conformité,
 * et, pour les questions de type DATE, calcule également is_dynamic et expires_at.
 *
 * @async
 * @function postAnswer
 * @param {Object} req - Objet de requête Express.
 * @param {Object} res - Objet de réponse Express.
 * @returns {Object} JSON contenant la réponse enregistrée dans la base de données.
 */
exports.postAnswer = async (req, res) => {
  console.log("[postAnswer] Début de la méthode postAnswer.");
  try {
    const { evaluation_id, user_id, question_id } = req.body;
    console.log("[postAnswer] evaluation_id:", evaluation_id, "user_id:", user_id, "question_id:", question_id);

    if (!evaluation_id || !user_id || !question_id) {
      console.error("[postAnswer] Erreur: evaluation_id, user_id ou question_id manquant.");
      return res.status(400).json({ message: "evaluation_id, user_id et question_id sont requis." });
    }

    // Récupérer la question pour connaître son answer_type et, le cas échéant, months_before_verification
    console.log("[postAnswer] Récupération de la question pour question_id:", question_id);
    const questionQuery = `SELECT * FROM question WHERE question_id = $1`;
    const questionResult = await pool.query(questionQuery, [question_id]);
    if (questionResult.rows.length === 0) {
      console.error("[postAnswer] Question non trouvée pour question_id:", question_id);
      return res.status(404).json({ message: "Question non trouvée." });
    }
    const question = questionResult.rows[0];
    console.log("[postAnswer] Question récupérée:", question);

    const answerType = question.answer_type; // 'BINAIRE', 'ENTIER', 'TEXTUEL', ou 'DATE'
    let score, conformite, is_dynamic, expires_at = null;
    let donnee_boolean = null, donnee_entiere = null, donnee_textuelle = null, donnee_date = null;

    if (answerType === 'BINAIRE') {
      console.log("[postAnswer] Traitement pour answer_type BINAIRE.");
      if (typeof req.body.donnee_boolean === "undefined") {
        console.error("[postAnswer] Erreur: donnee_boolean manquant pour answer_type BINAIRE.");
        return res.status(400).json({ message: "La propriété donnee_boolean est requise pour le type BINAIRE." });
      }
      donnee_boolean = req.body.donnee_boolean;
      score = donnee_boolean ? 10 : 0;
      is_dynamic = false;
    } else if (answerType === 'ENTIER') {
      console.log("[postAnswer] Traitement pour answer_type ENTIER.");
      if (typeof req.body.donnee_entiere === "undefined") {
        console.error("[postAnswer] Erreur: donnee_entiere manquant pour answer_type ENTIER.");
        return res.status(400).json({ message: "La propriété donnee_entiere est requise pour le type ENTIER." });
      }
      donnee_entiere = req.body.donnee_entiere;
      // Récupérer l'évaluation pour obtenir le nombre de SI
      console.log("[postAnswer] Récupération de l'évaluation pour obtenir nombre_si.");
      const evalQuery = `SELECT * FROM evaluation WHERE evaluation_id = $1 AND user_id = $2`;
      const evalResult = await pool.query(evalQuery, [evaluation_id, user_id]);
      if (evalResult.rows.length === 0) {
        console.error("[postAnswer] Évaluation non trouvée pour evaluation_id:", evaluation_id);
        return res.status(404).json({ message: "Évaluation non trouvée pour cet utilisateur." });
      }
      const evaluation = evalResult.rows[0];
      const nombre_si = evaluation.nombre_si;
      console.log("[postAnswer] Nombre de SI dans l'évaluation:", nombre_si);
      if (nombre_si <= 0) {
        console.error("[postAnswer] Erreur: nombre_si doit être > 0 pour answer_type ENTIER.");
        return res.status(400).json({ message: "Le nombre de SI de l'évaluation doit être supérieur à 0 pour le type ENTIER." });
      }
      // Appliquer la règle de trois : (donnee_entiere / nombre_si) * 10
      score = Math.round((donnee_entiere / nombre_si) * 10);
      if (score > 10) score = 10;
      if (score < 0) score = 0;
      is_dynamic = false;
    } else if (answerType === 'TEXTUEL') {
      console.log("[postAnswer] Traitement pour answer_type TEXTUEL.");
      if (typeof req.body.donnee_textuelle === "undefined") {
        console.error("[postAnswer] Erreur: donnee_textuelle manquant pour answer_type TEXTUEL.");
        return res.status(400).json({ message: "La propriété donnee_textuelle est requise pour le type TEXTUEL." });
      }
      donnee_textuelle = req.body.donnee_textuelle;
      // Si le texte est vide, score = 0, sinon 10
      score = donnee_textuelle.trim() === "" ? 0 : 10;
      is_dynamic = false;
    } else if (answerType === 'DATE') {
      console.log("[postAnswer] Traitement pour answer_type DATE.");
      if (typeof req.body.donnee_date === "undefined") {
        console.error("[postAnswer] Erreur: donnee_date manquant pour answer_type DATE.");
        return res.status(400).json({ message: "La propriété donnee_date est requise pour le type DATE." });
      }
      donnee_date = req.body.donnee_date;
      const userDate = new Date(donnee_date);
      if (isNaN(userDate.getTime())) {
        console.error("[postAnswer] Erreur: La date fournie est invalide.");
        return res.status(400).json({ message: "La date fournie dans donnee_date est invalide." });
      }
      // Vérifier que la question a bien une valeur de months_before_verification
      const months = question.months_before_verification;
      if (months === null || typeof months !== "number") {
        console.error("[postAnswer] Erreur: months_before_verification non renseigné pour question de type DATE.");
        return res.status(400).json({ message: "La question de type DATE doit avoir months_before_verification renseigné." });
      }
      // Calculer expires_at = donnee_date + months_before_verification mois
      let expiresDate = new Date(userDate);
      expiresDate.setMonth(expiresDate.getMonth() + months);
      expires_at = expiresDate.toISOString();
      // Si la date actuelle est antérieure ou égale à expires_at, score = 10, sinon 0
      const now = new Date();
      score = now <= expiresDate ? 10 : 0;
      is_dynamic = true;
    } else {
      console.error("[postAnswer] Erreur: type de réponse invalide:", answerType);
      return res.status(400).json({ message: "Type de réponse invalide." });
    }

    // Calculer la conformité en fonction du score obtenu
    console.log("[postAnswer] Calcul de la conformité avec score:", score);
    if (score === 10) {
      conformite = "CONFORME";
    } else if (score === 0) {
      conformite = "NON_CONFORME";
    } else {
      conformite = "PARTIELLEMENT_CONFORME";
    }
    console.log("[postAnswer] Conformité déterminée:", conformite);

    // Insertion de la réponse dans la table reponse
    console.log("[postAnswer] Insertion de la réponse dans la base de données.");
    const insertQuery = `
      INSERT INTO reponse 
        (evaluation_id, user_id, question_id, score, donnee_boolean, donnee_entiere, donnee_textuelle, donnee_date, conformite, answer_type, is_dynamic, expires_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      evaluation_id,
      user_id,
      question_id,
      score,
      donnee_boolean,
      donnee_entiere,
      donnee_textuelle,
      donnee_date,
      conformite,
      answerType,
      is_dynamic,
      expires_at
    ];
    const result = await pool.query(insertQuery, values);
    console.log("[postAnswer] Réponse enregistrée avec succès:", result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("[postAnswer] Erreur:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Vérifie si la prochaine question à traiter correspond à un nouvel objectif.
 * Si c'est le cas, finalise l'objectif courant en mettant à jour l'évaluation et renvoie { new_objective_finalized: true }.
 *
 * Expects :
 *   - evaluation_id dans req.params
 *   - user_id dans req.query (exemple : ?user_id=1)
 *
 * @async
 * @function verifyNextObjective
 * @param {Object} req - Objet de requête Express.
 * @param {Object} res - Objet de réponse Express.
 * @returns {Object} JSON avec { new_objective_finalized: true } si un nouvel objectif est atteint, sinon false.
 */
exports.verifyNextObjective = async (req, res) => {
  console.log("[verifyNextObjective] Début de la méthode verifyNextObjective.");
  try {
    const { evaluation_id } = req.params;
    const { user_id } = req.query;
    console.log("[verifyNextObjective] evaluation_id:", evaluation_id, "user_id:", user_id);

    if (!evaluation_id || !user_id) {
      console.error("[verifyNextObjective] Erreur: evaluation_id ou user_id manquant.");
      return res.status(400).json({ message: "evaluation_id et user_id sont requis." });
    }

    // Récupérer l'évaluation afin d'obtenir l'objectif courant.
    console.log("[verifyNextObjective] Récupération de l'évaluation.");
    const evalQuery = "SELECT * FROM evaluation WHERE evaluation_id = $1 AND user_id = $2";
    const evalResult = await pool.query(evalQuery, [evaluation_id, user_id]);
    if (evalResult.rows.length === 0) {
      console.error("[verifyNextObjective] Évaluation non trouvée pour evaluation_id:", evaluation_id);
      return res.status(404).json({ message: "Évaluation non trouvée pour cet utilisateur." });
    }
    const evaluation = evalResult.rows[0];
    console.log("[verifyNextObjective] Évaluation récupérée:", evaluation);

    // Déterminer l'objectif courant (si aucune réponse, on considère objectif 1 par défaut)
    const currentObjectiveId = evaluation.id_dernier_objectif || 1;
    console.log("[verifyNextObjective] Objectif courant:", currentObjectiveId);

    // Récupérer le dernier identifiant de question répondu par l'utilisateur.
    console.log("[verifyNextObjective] Récupération du dernier question_id répondu.");
    const lastAnswerResult = await pool.query(
      `SELECT question_id 
       FROM reponse 
       WHERE evaluation_id = $1 AND user_id = $2 
       ORDER BY question_id DESC 
       LIMIT 1`,
      [evaluation_id, user_id]
    );
    let lastQuestionId = 0;
    if (lastAnswerResult.rows.length > 0) {
      lastQuestionId = lastAnswerResult.rows[0].question_id;
    }
    console.log("[verifyNextObjective] Dernier question_id répondu:", lastQuestionId);

    // Récupérer la prochaine question dans l'ordre croissant des question_id.
    console.log("[verifyNextObjective] Récupération de la prochaine question.");
    const nextQuestionResult = await pool.query(
      `SELECT * 
       FROM question 
       WHERE question_id > $1 
       ORDER BY question_id ASC 
       LIMIT 1`,
      [lastQuestionId]
    );
    if (nextQuestionResult.rows.length === 0) {
      console.log("[verifyNextObjective] Aucune question suivante disponible.");
      return res.status(200).json({ new_objective_finalized: false });
    }
    const nextQuestion = nextQuestionResult.rows[0];
    console.log("[verifyNextObjective] Prochaine question récupérée:", nextQuestion);

    // Vérifier si la prochaine question appartient à un nouvel objectif
    if (nextQuestion.objectif_id !== currentObjectiveId) {
      console.log("[verifyNextObjective] La prochaine question appartient à un nouvel objectif. Finalisation de l'objectif courant.");
      // Finaliser l'objectif en mettant à jour l'évaluation avec le nouvel objectif.
      const updateQuery = `
        UPDATE evaluation 
        SET id_dernier_objectif = $1, date_derniere_modification = CURRENT_TIMESTAMP 
        WHERE evaluation_id = $2 AND user_id = $3
      `;
      await pool.query(updateQuery, [nextQuestion.objectif_id, evaluation_id, user_id]);
      console.log("[verifyNextObjective] Objectif finalisé, renvoi de true.");
      return res.status(200).json({ new_objective_finalized: true });
    } else {
      console.log("[verifyNextObjective] La prochaine question appartient au même objectif, renvoi de false.");
      return res.status(200).json({ new_objective_finalized: false });
    }
  } catch (error) {
    console.error("[verifyNextObjective] Erreur:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Récupère les détails d'une évaluation pour un utilisateur donné,
 * en renvoyant pour chaque objectif uniquement les questions auxquelles l'utilisateur a répondu
 * et, pour chaque question, la réponse associée, avec toutes les colonnes des tables concernées.
 *
 * Pour chaque objectif, le score minimal parmi les réponses de ses questions est calculé.
 *
 * Exemples d'appel :
 * GET /evaluation-flow/evaluation-details/14?user_id=1
 *
 * @async
 * @function getEvaluationAnsweredDetails
 * @param {Object} req - Objet de requête Express.
 * @param {Object} res - Objet de réponse Express.
 * @returns {Object} JSON contenant evaluation_id et un tableau d'objectifs avec leurs questions répondues, réponses et le score minimal.
 */
exports.getEvaluationAnsweredDetails = async (req, res) => {
  console.log("[getEvalDetails] Start getEvaluationAnsweredDetails");
  try {
    const { evaluation_id } = req.params;
    const { user_id } = req.query;
    console.log("[getEvalDetails] Params received: evaluation_id =", evaluation_id, ", user_id =", user_id);

    // Vérifier que evaluation_id et user_id sont fournis
    if (!evaluation_id || !user_id) {
      console.error("[getEvalDetails] Missing parameters");
      return res.status(400).json({ message: "evaluation_id et user_id sont requis." });
    }

    // Requête SQL : récupérer toutes les questions auxquelles l'utilisateur a répondu
    // en joignant les informations de l'objectif, de la question et de la réponse.
    const detailsQuery = `
      SELECT 
         o.objectif_id AS o_objectif_id,
         o.description AS o_description,
         o.justification_risques AS o_justification_risques,
         q.question_id AS q_question_id,
         q.intitule AS q_intitule,
         q.nom_mesure AS q_nom_mesure,
         q.type_question AS q_type_question,
         q.pour_ei AS q_pour_ei,
         q.recommandation AS q_recommandation,
         q.is_dependent AS q_is_dependent,
         q.depends_on_question_id AS q_depends_on_question_id,
         q.answer_type AS q_answer_type,
         q.min_score AS q_min_score,
         q.months_before_verification AS q_months_before_verification,
         r.reponse_id AS r_reponse_id,
         r.score AS r_score,
         r.donnee_boolean AS r_donnee_boolean,
         r.donnee_entiere AS r_donnee_entiere,
         r.donnee_textuelle AS r_donnee_textuelle,
         r.donnee_date AS r_donnee_date,
         r.conformite AS r_conformite,
         r.answer_type AS r_answer_type,
         r.is_dynamic AS r_is_dynamic,
         r.expires_at AS r_expires_at
      FROM question q
      JOIN reponse r ON q.question_id = r.question_id
      JOIN objectif o ON q.objectif_id = o.objectif_id
      WHERE r.evaluation_id = $1 AND r.user_id = $2
      ORDER BY o.objectif_id, q.question_id;
    `;
    const detailsResult = await pool.query(detailsQuery, [evaluation_id, user_id]);
    console.log("[getEvalDetails] Rows returned:", detailsResult.rowCount);

    // Grouper les résultats par objectif
    const objectives = {};
    detailsResult.rows.forEach(row => {
      const objId = row.o_objectif_id;
      // Création d'un groupe par objectif si non existant
      if (!objectives[objId]) {
        objectives[objId] = {
          objectif: {
            objectif_id: row.o_objectif_id,
            description: row.o_description,
            justification_risques: row.o_justification_risques
          },
          questions: []
        };
      }
      // Ajout de la question et de la réponse associée dans le groupe
      objectives[objId].questions.push({
        question: {
          question_id: row.q_question_id,
          intitule: row.q_intitule,
          nom_mesure: row.q_nom_mesure,
          type_question: row.q_type_question,
          pour_ei: row.q_pour_ei,
          recommandation: row.q_recommandation,
          is_dependent: row.q_is_dependent,
          depends_on_question_id: row.q_depends_on_question_id,
          answer_type: row.q_answer_type,
          min_score: row.q_min_score,
          months_before_verification: row.q_months_before_verification,
        },
        reponse: {
          reponse_id: row.r_reponse_id,
          score: row.r_score,
          donnee_boolean: row.r_donnee_boolean,
          donnee_entiere: row.r_donnee_entiere,
          donnee_textuelle: row.r_donnee_textuelle,
          donnee_date: row.r_donnee_date,
          conformite: row.r_conformite,
          answer_type: row.r_answer_type,
          is_dynamic: row.r_is_dynamic,
          expires_at: row.r_expires_at
        }
      });
    });

    // Calculer le score minimal pour chaque objectif parmi les réponses
    Object.keys(objectives).forEach(objId => {
      const scores = objectives[objId].questions
        .map(q => q.reponse?.score)
        .filter(s => s !== null && s !== undefined);
      const minScore = scores.length > 0 ? Math.min(...scores) : null;
      objectives[objId].min_response_score = minScore;
      console.log("[getEvalDetails] Objective", objId, "min_response_score:", minScore);
    });

    const objectivesArray = Object.values(objectives);
    console.log("[getEvalDetails] Grouped objectives count:", objectivesArray.length);

    return res.status(200).json({
      evaluation_id,
      objectives: objectivesArray
    });
  } catch (error) {
    console.error("[getEvalDetails] Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};