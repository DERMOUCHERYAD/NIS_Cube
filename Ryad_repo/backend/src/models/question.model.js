/**
 * @fileoverview Modèle pour la gestion des questions.
 * Ce module fournit des méthodes pour créer, récupérer, mettre à jour et supprimer des questions dans la base de données.
 * @module models/question.model
 */

const pool = require("../config/db");

const Question = {
  /**
   * Créer une nouvelle question.
   * Valide que tous les champs obligatoires sont fournis et que le type de question est valide,
   * puis insère une nouvelle question dans la table "question" et retourne l'objet créé.
   *
   * @param {number} objectif_id - ID de l'objectif associé.
   * @param {number} axe_id - ID de l'axe associé.
   * @param {string} intitule - Texte de la question.
   * @param {string} nom_mesure - Nom de la mesure de conformité.
   * @param {string} type_question - Type de la question (BINAIRE ou NON_BINAIRE).
   * @param {boolean} pour_ei - Indique si la question s'applique aux Entités Importantes (EI).
   * @param {string} recommandation - Recommandation associée à la question.
   * @param {boolean} [is_dependent=false] - Indique si la question dépend d’une réponse précédente.
   * @param {number|null} [depends_on_question_id=null] - ID de la question dont dépend l’affichage (obligatoire si is_dependent est true).
   * @param {string} [answer_type] - Type de réponse pour la question (BINAIRE, ENTIER ou TEXTUEL).
   *                                Si non fourni, par défaut : 'BINAIRE' si type_question vaut "BINAIRE", sinon 'ENTIER'.
   * @returns {Promise<Object>} - Retourne la question créée.
   * @throws {Error} Si un champ obligatoire est manquant ou si le type de question n'est pas valide.
   */
  create: async (
    objectif_id,
    axe_id,
    intitule,
    nom_mesure,
    type_question,
    pour_ei,
    recommandation,
    is_dependent = false,
    depends_on_question_id = null,
    answer_type
  ) => {
    console.log("[Question.create] Début de la création d'une nouvelle question.");
    try {
      // Validation des entrées obligatoires
      if (!objectif_id || !axe_id || !intitule || !type_question || pour_ei === undefined) {
        console.error("[Question.create] Champs obligatoires manquants :", {
          objectif_id,
          axe_id,
          intitule,
          type_question,
          pour_ei,
        });
        throw new Error("Tous les champs obligatoires doivent être renseignés.");
      }
      // Validation du type de question (ancien système : BINAIRE ou NON_BINAIRE)
      if (!["BINAIRE", "NON_BINAIRE"].includes(type_question)) {
        console.error("[Question.create] Type de question invalide :", type_question);
        throw new Error("Le type de question doit être 'BINAIRE' ou 'NON_BINAIRE'.");
      }
      // Validation de la dépendance
      if (is_dependent && !depends_on_question_id) {
        console.error("[Question.create] La question est dépendante mais depends_on_question_id n'est pas fourni.");
        throw new Error("La question dépendante doit spécifier l'ID de la question dont elle dépend.");
      }
      // Si non dépendante, forcer depends_on_question_id à null
      if (!is_dependent) {
        depends_on_question_id = null;
      }
      // Définir answer_type par défaut si non fourni
      if (!answer_type) {
        answer_type = (type_question === "BINAIRE") ? "BINAIRE" : "ENTIER";
      }
      // Préparation de la requête SQL incluant les nouveaux champs
      const query = `INSERT INTO question 
                     (objectif_id, axe_id, intitule, nom_mesure, type_question, pour_ei, recommandation, is_dependent, depends_on_question_id, answer_type)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
      const values = [
        objectif_id,
        axe_id,
        intitule,
        nom_mesure,
        type_question,
        pour_ei,
        recommandation,
        is_dependent,
        depends_on_question_id,
        answer_type,
      ];
      console.log("[Question.create] Exécution de la requête SQL :", query, "avec les valeurs :", values);
      const result = await pool.query(query, values);
      console.log("[Question.create] Question créée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Question.create] ❌ Erreur lors de la création de la question :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer une question par son ID.
   * Exécute une requête SQL pour obtenir la question correspondant à l'ID fourni.
   *
   * @param {number} question_id - ID de la question.
   * @returns {Promise<Object>} - Retourne la question correspondante.
   * @throws {Error} Si aucune question n'est trouvée avec cet ID.
   */
  getById: async (question_id) => {
    console.log("[Question.getById] Début de la récupération de la question avec ID :", question_id);
    try {
      const query = "SELECT * FROM question WHERE question_id = $1";
      console.log("[Question.getById] Exécution de la requête SQL :", query, "avec le paramètre :", question_id);
      const result = await pool.query(query, [question_id]);
      if (result.rows.length === 0) {
        console.error("[Question.getById] Aucune question trouvée avec l'ID :", question_id);
        throw new Error("Aucune question trouvée avec cet ID.");
      }
      console.log("[Question.getById] Question récupérée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Question.getById] ❌ Erreur lors de la récupération de la question :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer toutes les questions associées à un objectif donné.
   * Exécute une requête SQL pour récupérer l'ensemble des questions liées à l'ID de l'objectif.
   *
   * @param {number} objectif_id - ID de l'objectif.
   * @returns {Promise<Array>} - Retourne un tableau des questions.
   * @throws {Error} Si aucune question n'est trouvée pour cet objectif.
   */
  getByObjectif: async (objectif_id) => {
    console.log("[Question.getByObjectif] Début de la récupération des questions pour l'objectif ID :", objectif_id);
    try {
      const query = "SELECT * FROM question WHERE objectif_id = $1";
      console.log("[Question.getByObjectif] Exécution de la requête SQL :", query, "avec le paramètre :", objectif_id);
      const result = await pool.query(query, [objectif_id]);
      if (result.rows.length === 0) {
        console.error("[Question.getByObjectif] Aucune question trouvée pour l'objectif ID :", objectif_id);
        throw new Error("Aucune question trouvée pour cet objectif.");
      }
      console.log("[Question.getByObjectif] Nombre de questions récupérées :", result.rows.length);
      return result.rows;
    } catch (error) {
      console.error("[Question.getByObjectif] ❌ Erreur lors de la récupération des questions :", error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour une question existante.
   * Valide le type de question s'il est fourni, puis met à jour la question identifiée par son ID.
   *
   * @param {number} question_id - ID de la question à mettre à jour.
   * @param {string} [intitule] - Nouveau texte de la question.
   * @param {string} [nom_mesure] - Nouveau nom de la mesure de conformité.
   * @param {string} [type_question] - Nouveau type de question (BINAIRE ou NON_BINAIRE).
   * @param {boolean} [pour_ei] - Mise à jour de l'indication si la question s'applique aux EI.
   * @param {string} [recommandation] - Nouvelle recommandation.
   * @param {boolean} [is_dependent] - Indique si la question dépend d’une réponse précédente.
   * @param {number|null} [depends_on_question_id] - ID de la question dont dépend l'affichage.
   * @param {string} [answer_type] - Nouveau type de réponse (BINAIRE, ENTIER ou TEXTUEL).
   * @returns {Promise<Object>} - Retourne la question mise à jour.
   * @throws {Error} Si aucune question n'est trouvée pour la mise à jour ou si le type de question est invalide.
   */
  update: async (
    question_id,
    intitule,
    nom_mesure,
    type_question,
    pour_ei,
    recommandation,
    is_dependent,
    depends_on_question_id,
    answer_type
  ) => {
    console.log("[Question.update] Début de la mise à jour de la question avec ID :", question_id);
    try {
      // Validation du type de question s'il est fourni
      if (type_question && !["BINAIRE", "NON_BINAIRE"].includes(type_question)) {
        console.error("[Question.update] Type de question invalide :", type_question);
        throw new Error("Le type de question doit être 'BINAIRE' ou 'NON_BINAIRE'.");
      }
      // Si la question est marquée comme dépendante, depends_on_question_id doit être fourni
      if (is_dependent === true && !depends_on_question_id) {
        console.error("[Question.update] La question est marquée comme dépendante mais depends_on_question_id n'est pas fourni.");
        throw new Error("La question dépendante doit spécifier l'ID de la question dont elle dépend.");
      }
      // Préparation de la requête SQL pour la mise à jour
      const query = `UPDATE question 
                     SET intitule = COALESCE($1, intitule), 
                         nom_mesure = COALESCE($2, nom_mesure), 
                         type_question = COALESCE($3, type_question), 
                         pour_ei = COALESCE($4, pour_ei), 
                         recommandation = COALESCE($5, recommandation),
                         is_dependent = COALESCE($6, is_dependent),
                         depends_on_question_id = COALESCE($7, depends_on_question_id),
                         answer_type = COALESCE($8, answer_type)
                     WHERE question_id = $9 RETURNING *`;
      const values = [
        intitule,
        nom_mesure,
        type_question,
        pour_ei,
        recommandation,
        is_dependent,
        depends_on_question_id,
        answer_type,
        question_id,
      ];
      console.log("[Question.update] Exécution de la requête SQL :", query, "avec les valeurs :", values);
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error("[Question.update] Aucune question trouvée pour l'ID :", question_id);
        throw new Error("Aucune question trouvée pour la mise à jour.");
      }
      console.log("[Question.update] Question mise à jour avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Question.update] ❌ Erreur lors de la mise à jour de la question :", error.message);
      throw error;
    }
  },

  /**
   * Supprimer une question par son ID.
   * Exécute une requête SQL pour supprimer la question correspondante et retourne l'objet supprimé.
   *
   * @param {number} question_id - ID de la question à supprimer.
   * @returns {Promise<Object>} - Retourne la question supprimée.
   * @throws {Error} Si aucune question n'est trouvée pour la suppression.
   */
  delete: async (question_id) => {
    console.log("[Question.delete] Début de la suppression de la question avec ID :", question_id);
    try {
      const query = "DELETE FROM question WHERE question_id = $1 RETURNING *";
      console.log("[Question.delete] Exécution de la requête SQL :", query, "avec le paramètre :", question_id);
      const result = await pool.query(query, [question_id]);
      if (result.rows.length === 0) {
        console.error("[Question.delete] Aucune question trouvée pour la suppression avec l'ID :", question_id);
        throw new Error("Aucune question trouvée pour la suppression.");
      }
      console.log("[Question.delete] Question supprimée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Question.delete] ❌ Erreur lors de la suppression de la question :", error.message);
      throw error;
    }
  },
};

module.exports = Question;