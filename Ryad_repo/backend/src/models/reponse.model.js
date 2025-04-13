/**
 * @fileoverview Modèle pour la gestion des réponses.
 * Ce module fournit des méthodes pour créer, récupérer, mettre à jour et supprimer des réponses
 * dans la base de données PostgreSQL.
 * Il a été mis à jour pour inclure les colonnes donnee_textuelle, conformite, answer_type, is_dynamic et expires_at.
 * @module models/reponse.model
 */

const pool = require("../config/db");

const Reponse = {
  /**
 * Créer une nouvelle réponse.
 *
 * Cette fonction insère une nouvelle réponse dans la table "reponse" de PostgreSQL.
 * Elle vérifie que les champs obligatoires sont présents et que les valeurs numériques respectent les contraintes.
 * En fonction de la valeur de "answer_type", seule l'une des colonnes de données doit être renseignée :
 *   - Si answer_type vaut "BINAIRE", seule "donnee_boolean" doit être renseignée.
 *   - Si answer_type vaut "ENTIER", seule "donnee_entiere" doit être renseignée.
 *   - Si answer_type vaut "TEXTUEL", seule "donnee_textuelle" doit être renseignée.
 *   - Si answer_type vaut "DATE", seule "donnee_date" doit être renseignée.
 *
 * @async
 * @function create
 * @param {number} evaluation_id - L'ID de l'évaluation.
 * @param {number} user_id - L'ID de l'utilisateur.
 * @param {number} question_id - L'ID de la question.
 * @param {number} score - Le score attribué (doit être entre 0 et 10).
 * @param {boolean} [donnee_boolean] - Valeur booléenne, utilisée si answer_type est "BINAIRE" (optionnel).
 * @param {number} [donnee_entiere] - Valeur numérique, utilisée si answer_type est "ENTIER" (optionnel, entre 0 et 10).
 * @param {string} [donnee_textuelle] - Réponse textuelle, utilisée si answer_type est "TEXTUEL" (optionnel).
 * @param {string} [donnee_date] - Réponse de type date, utilisée si answer_type est "DATE" (optionnel).
 * @param {string} [conformite] - Niveau de conformité ("CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME") (optionnel).
 * @param {string} [answer_type] - Type de réponse attendu ("BINAIRE", "ENTIER", "TEXTUEL" ou "DATE") (optionnel).
 * @param {boolean} [is_dynamic=false] - Indique si la réponse est dynamique (score peut expirer), par défaut false.
 * @param {string} [expires_at] - Date ISO8601 à laquelle la réponse devient invalide (optionnel).
 * @returns {Promise<Object>} L'objet réponse créé.
 * @throws {Error} Lance une erreur si une contrainte de validation échoue ou si la requête SQL échoue.
 *
 * @example
 * // Exemple d'appel :
 * Reponse.create(
 *   1,                // evaluation_id
 *   2,                // user_id
 *   3,                // question_id
 *   8,                // score
 *   true,             // donnee_boolean (utilisé si answer_type est "BINAIRE")
 *   null,             // donnee_entiere
 *   null,             // donnee_textuelle
 *   '2025-12-25',     // donnee_date (utilisé si answer_type est "DATE")
 *   "CONFORME",       // conformite
 *   "BINAIRE",        // answer_type
 *   false,            // is_dynamic
 *   null              // expires_at
 * ).then(response => console.log("Réponse créée:", response))
 *  .catch(err => console.error("Erreur:", err));
 */
  create: async (
    evaluation_id,
    user_id,
    question_id,
    score,
    donnee_boolean,
    donnee_entiere,
    donnee_textuelle,
    donnee_date,
    conformite,
    answer_type,
    is_dynamic = false,
    expires_at
  ) => {
    console.log("[Reponse.create] Début de la création d'une nouvelle réponse.");
    try {
      // Vérification des champs obligatoires
      if (!evaluation_id || !user_id || !question_id || score === undefined) {
        console.error("[Reponse.create] Champs obligatoires manquants :", {
          evaluation_id,
          user_id,
          question_id,
          score,
        });
        throw new Error("Tous les champs obligatoires doivent être renseignés.");
      }
      console.log("[Reponse.create] Tous les champs obligatoires sont validés.");

      // Vérification que le score est dans l'intervalle autorisé
      if (score < 0 || score > 10) {
        console.error("[Reponse.create] Score invalide :", score);
        throw new Error("Le score doit être entre 0 et 10.");
      }
      console.log("[Reponse.create] Score validé :", score);

      // Validation de donnee_entiere (si fournie)
      if (donnee_entiere !== null && donnee_entiere !== undefined && (donnee_entiere < 0 || donnee_entiere > 10)) {
        console.error("[Reponse.create] Valeur entière invalide :", donnee_entiere);
        throw new Error("La valeur entière doit être entre 0 et 10.");
      }
      console.log("[Reponse.create] donnee_entiere validée (si applicable) :", donnee_entiere);

      // Définition des types de réponse autorisés, incluant désormais "DATE"
      const allowedAnswerTypes = ["BINAIRE", "ENTIER", "TEXTUEL", "DATE"];
      if (answer_type && !allowedAnswerTypes.includes(answer_type)) {
        console.error("[Reponse.create] Valeur de 'answer_type' invalide :", answer_type);
        throw new Error("La valeur de 'answer_type' doit être 'BINAIRE', 'ENTIER', 'TEXTUEL' ou 'DATE'.");
      }
      console.log("[Reponse.create] answer_type validé (si fourni) :", answer_type);

      // Préparation de la requête SQL pour insérer la réponse
      // La requête inclut désormais la colonne donnee_date pour le type "DATE"
      const query = `
      INSERT INTO reponse (
        evaluation_id, user_id, question_id, score, 
        donnee_boolean, donnee_entiere, donnee_textuelle, donnee_date, conformite,
        answer_type, is_dynamic, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
        donnee_date,       // Nouveau paramètre pour stocker la date
        conformite,
        answer_type,
        is_dynamic,
        expires_at,
      ];
      console.log("[Reponse.create] Requête SQL préparée :", query);
      console.log("[Reponse.create] Valeurs associées :", values);

      // Exécution de la requête SQL
      const result = await pool.query(query, values);
      console.log("[Reponse.create] Réponse créée avec succès :", result.rows[0]);

      // Retourner l'objet réponse créé
      return result.rows[0];
    } catch (error) {
      console.error("[Reponse.create] ❌ Erreur lors de la création de la réponse :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer une réponse par son ID.
   *
   * @async
   * @function getById
   * @param {number} reponse_id - ID de la réponse.
   * @returns {Promise<Object>} L'objet réponse correspondant.
   * @throws {Error} Si aucune réponse n'est trouvée.
   */
  getById: async (reponse_id) => {
    console.log("[Reponse.getById] Début de la récupération de la réponse avec ID :", reponse_id);
    try {
      const query = "SELECT * FROM reponse WHERE reponse_id = $1";
      console.log("[Reponse.getById] Exécution de la requête SQL :", query, "avec le paramètre :", reponse_id);
      const result = await pool.query(query, [reponse_id]);
      if (result.rows.length === 0) {
        console.error("[Reponse.getById] Aucune réponse trouvée avec l'ID :", reponse_id);
        throw new Error("Aucune réponse trouvée avec cet ID.");
      }
      console.log("[Reponse.getById] Réponse récupérée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Reponse.getById] ❌ Erreur lors de la récupération de la réponse :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer toutes les réponses associées à une évaluation.
   *
   * @async
   * @function getByEvaluation
   * @param {number} evaluation_id - ID de l'évaluation.
   * @returns {Promise<Array>} Un tableau contenant toutes les réponses.
   * @throws {Error} Si aucune réponse n'est trouvée.
   */
  getByEvaluation: async (evaluation_id) => {
    console.log("[Reponse.getByEvaluation] Début de la récupération des réponses pour l'évaluation ID :", evaluation_id);
    try {
      const query = "SELECT * FROM reponse WHERE evaluation_id = $1";
      console.log("[Reponse.getByEvaluation] Exécution de la requête SQL :", query, "avec le paramètre :", evaluation_id);
      const result = await pool.query(query, [evaluation_id]);
      if (result.rows.length === 0) {
        console.error("[Reponse.getByEvaluation] Aucune réponse trouvée pour l'évaluation ID :", evaluation_id);
        throw new Error("Aucune réponse trouvée pour cette évaluation.");
      }
      console.log("[Reponse.getByEvaluation] Nombre de réponses récupérées :", result.rows.length);
      return result.rows;
    } catch (error) {
      console.error("[Reponse.getByEvaluation] ❌ Erreur lors de la récupération des réponses :", error.message);
      throw error;
    }
  },

  /**
 * Mettre à jour une réponse existante.
 * 
 * Cette fonction met à jour les champs suivants dans la table "reponse" :
 *   - score : Nouveau score (doit être entre 0 et 10).
 *   - donnee_boolean : Nouvelle valeur booléenne (pour answer_type "BINAIRE").
 *   - donnee_entiere : Nouvelle valeur numérique (pour answer_type "ENTIER", entre 0 et 10).
 *   - donnee_textuelle : Nouvelle réponse textuelle (pour answer_type "TEXTUEL").
 *   - donnee_date : Nouvelle réponse de type date (pour answer_type "DATE").
 *   - conformite : Nouveau niveau de conformité ("CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME").
 *   - answer_type : Nouveau type de réponse ("BINAIRE", "ENTIER", "TEXTUEL" ou "DATE").
 *   - is_dynamic : Indique si la réponse est dynamique (true/false).
 *   - expires_at : Date ISO8601 à laquelle la réponse devient invalide.
 * 
 * Seuls les champs fournis dans le corps de la requête seront mis à jour (utilisation de COALESCE).
 *
 * @async
 * @function update
 * @param {number} reponse_id - L'ID de la réponse à mettre à jour.
 * @param {number} [score] - Le nouveau score (doit être entre 0 et 10).
 * @param {boolean} [donnee_boolean] - La nouvelle valeur booléenne (pour answer_type "BINAIRE").
 * @param {number} [donnee_entiere] - La nouvelle valeur numérique (pour answer_type "ENTIER", entre 0 et 10).
 * @param {string} [donnee_textuelle] - La nouvelle réponse textuelle (pour answer_type "TEXTUEL").
 * @param {string} [donnee_date] - La nouvelle donnée de type date (pour answer_type "DATE").
 * @param {string} [conformite] - Le nouveau niveau de conformité ("CONFORME", "PARTIELLEMENT_CONFORME", "NON_CONFORME").
 * @param {string} [answer_type] - Le nouveau type de réponse ("BINAIRE", "ENTIER", "TEXTUEL" ou "DATE").
 * @param {boolean} [is_dynamic] - Indique si la réponse est dynamique (score peut expirer).
 * @param {string} [expires_at] - La date à laquelle la réponse devient invalide (ISO8601, optionnel).
 * @returns {Promise<Object>} L'objet réponse mis à jour.
 * @throws {Error} Lance une erreur si aucune réponse n'est trouvée ou si une validation échoue.
 *
 * @example
 * Reponse.update(
 *   5,               // reponse_id
 *   7,               // score
 *   null,            // donnee_boolean
 *   7,               // donnee_entiere
 *   null,            // donnee_textuelle
 *   '2025-12-25',    // donnee_date
 *   "CONFORME",      // conformite
 *   "DATE",          // answer_type
 *   false,           // is_dynamic
 *   null             // expires_at
 * ).then(updated => console.log("Réponse mise à jour :", updated))
 *  .catch(err => console.error("Erreur :", err));
 */
  update: async (
    reponse_id,
    score,
    donnee_boolean,
    donnee_entiere,
    donnee_textuelle,
    donnee_date,      // Nouveau paramètre pour la donnée de type date
    conformite,
    answer_type,
    is_dynamic,
    expires_at
  ) => {
    console.log("[Reponse.update] Début de la mise à jour de la réponse avec ID :", reponse_id);
    try {
      // Validation du score (si fourni)
      if (score !== undefined && (score < 0 || score > 10)) {
        console.error("[Reponse.update] Score invalide :", score);
        throw new Error("Le score doit être entre 0 et 10.");
      }
      // Validation de donnee_entiere (si fournie)
      if (donnee_entiere !== null && donnee_entiere !== undefined && (donnee_entiere < 0 || donnee_entiere > 10)) {
        console.error("[Reponse.update] Valeur entière invalide :", donnee_entiere);
        throw new Error("La valeur entière doit être entre 0 et 10.");
      }

      // Validation de 'answer_type' si fourni
      const allowedAnswerTypes = ["BINAIRE", "ENTIER", "TEXTUEL", "DATE"];
      if (answer_type && !allowedAnswerTypes.includes(answer_type)) {
        console.error("[Reponse.update] Valeur de 'answer_type' invalide :", answer_type);
        throw new Error("La valeur de 'answer_type' doit être 'BINAIRE', 'ENTIER', 'TEXTUEL' ou 'DATE'.");
      }
      console.log("[Reponse.update] Les validations de score, donnee_entiere et answer_type sont passées.");

      // Préparation de la requête SQL pour mettre à jour la réponse
      // La colonne donnee_date est ajoutée pour gérer les réponses de type date.
      const query = `
      UPDATE reponse 
      SET score = COALESCE($1, score), 
          donnee_boolean = COALESCE($2, donnee_boolean), 
          donnee_entiere = COALESCE($3, donnee_entiere),
          donnee_textuelle = COALESCE($4, donnee_textuelle),
          donnee_date = COALESCE($5, donnee_date),
          conformite = COALESCE($6, conformite),
          answer_type = COALESCE($7, answer_type),
          is_dynamic = COALESCE($8, is_dynamic),
          expires_at = COALESCE($9, expires_at)
      WHERE reponse_id = $10
      RETURNING *
    `;
      // Construction du tableau des valeurs à substituer dans la requête
      const values = [
        score,           // $1
        donnee_boolean,  // $2
        donnee_entiere,  // $3
        donnee_textuelle,// $4
        donnee_date,     // $5 : nouveau paramètre
        conformite,      // $6
        answer_type,     // $7
        is_dynamic,      // $8
        expires_at,      // $9
        reponse_id,      // $10
      ];
      console.log("[Reponse.update] Requête SQL préparée :", query);
      console.log("[Reponse.update] Valeurs associées :", values);

      // Exécution de la requête SQL
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error("[Reponse.update] Aucune réponse trouvée pour l'ID :", reponse_id);
        throw new Error("Aucune réponse trouvée pour la mise à jour.");
      }
      console.log("[Reponse.update] Réponse mise à jour avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Reponse.update] ❌ Erreur lors de la mise à jour de la réponse :", error.message);
      throw error;
    }
  },

  /**
   * Supprimer une réponse par son ID.
   *
   * @async
   * @function delete
   * @param {number} reponse_id - ID de la réponse à supprimer.
   * @returns {Promise<Object>} L'objet réponse supprimé.
   * @throws {Error} Si aucune réponse n'est trouvée pour la suppression.
   */
  delete: async (reponse_id) => {
    console.log("[Reponse.delete] Début de la suppression de la réponse avec ID :", reponse_id);
    try {
      const query = "DELETE FROM reponse WHERE reponse_id = $1 RETURNING *";
      console.log("[Reponse.delete] Exécution de la requête SQL :", query, "avec le paramètre :", reponse_id);
      const result = await pool.query(query, [reponse_id]);
      if (result.rows.length === 0) {
        console.error("[Reponse.delete] Aucune réponse trouvée pour la suppression avec l'ID :", reponse_id);
        throw new Error("Aucune réponse trouvée pour la suppression.");
      }
      console.log("[Reponse.delete] Réponse supprimée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Reponse.delete] ❌ Erreur lors de la suppression de la réponse :", error.message);
      throw error;
    }
  },
};

module.exports = Reponse;