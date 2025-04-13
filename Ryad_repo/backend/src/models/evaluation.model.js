/**
 * @fileoverview Modèle pour la gestion des évaluations.
 * Ce module fournit des méthodes pour créer, récupérer, mettre à jour et supprimer des évaluations dans la base de données PostgreSQL.
 * Il utilise le module de pool de connexions pour exécuter des requêtes SQL et intègre de nombreux logs pour faciliter le débogage.
 *
 * @module models/evaluation.model
 * @requires module:config/db
 */

const pool = require("../config/db");

const Evaluation = {

  /**
 * Créer une nouvelle évaluation.
 *
 * Cette fonction vérifie que les champs obligatoires sont présents, puis insère une nouvelle ligne
 * dans la table "evaluation". La date de dernière modification est automatiquement définie sur la date actuelle.
 * La nouvelle colonne `nombre_si` (nombre de SI) est également insérée dans la base de données.
 *
 * @async
 * @function create
 * @param {number} user_id - L'ID de l'utilisateur qui initie l'évaluation.
 * @param {string} nom - Le nom ou titre de l'évaluation.
 * @param {number|null} id_dernier_objectif - (Optionnel) L'ID du dernier objectif atteint. Peut être null.
 * @param {string} type_entite - Le type d'entité de l'évaluation. Doit être "EE" (Entité Essentielle) ou "EI" (Entité Importante).
 * @param {number} [nombre_si=0] - (Optionnel) Le nombre de SI associés à l'évaluation. Par défaut, il est initialisé à 0.
 * @returns {Promise<Object>} Retourne une promesse résolue avec l'objet évaluation créé.
 * @throws {Error} Lance une erreur si un champ obligatoire est manquant ou si la requête SQL échoue.
 *
 * @example
 * Evaluation.create(1, "Audit de sécurité", null, "EE", 5)
 *   .then(evaluation => console.log("Évaluation créée :", evaluation))
 *   .catch(err => console.error("Erreur :", err));
 */
  create: async (user_id, nom, id_dernier_objectif, type_entite, nombre_si = 0) => {
    console.log("[Evaluation.create] Début de la création d'une évaluation.");

    try {
      // Vérification de la présence des champs obligatoires
      if (!user_id || !nom || !type_entite) {
        console.error("[Evaluation.create] Champs obligatoires manquants :", { user_id, nom, type_entite });
        throw new Error("Les champs user_id, nom et type_entite sont obligatoires.");
      }
      console.log("[Evaluation.create] Tous les champs obligatoires sont présents.");
      console.log("[Evaluation.create] Paramètre 'nombre_si' reçu :", nombre_si);

      // Préparation de la requête SQL
      // La colonne 'nombre_si' est ajoutée pour stocker le nombre de SI associé à l'évaluation.
      const query = `
      INSERT INTO evaluation 
        (user_id, nom, id_dernier_objectif, type_entite, date_derniere_modification, nombre_si)
      VALUES 
        ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      RETURNING *
    `;
      // Construction du tableau des valeurs à insérer dans la requête SQL
      const values = [user_id, nom, id_dernier_objectif, type_entite, nombre_si];

      console.log("[Evaluation.create] Requête SQL préparée :", query);
      console.log("[Evaluation.create] Valeurs associées :", values);

      // Exécution de la requête SQL
      const result = await pool.query(query, values);
      console.log("[Evaluation.create] Requête SQL exécutée avec succès.");
      console.log("[Evaluation.create] Évaluation créée :", result.rows[0]);

      // Retourne l'objet évaluation créé
      return result.rows[0];
    } catch (error) {
      console.error("[Evaluation.create] ❌ Erreur lors de la création de l'évaluation :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer une évaluation par son ID.
   *
   * Exécute une requête SQL afin d'obtenir l'évaluation correspondant à l'ID fourni.
   *
   * @async
   * @function getById
   * @param {number} evaluation_id - L'ID de l'évaluation à récupérer.
   * @returns {Promise<Object>} Retourne une promesse résolue avec l'objet évaluation trouvé.
   * @throws {Error} Lance une erreur si aucune évaluation n'est trouvée ou si la requête SQL échoue.
   *
   * @example
   * Evaluation.getById(1)
   *   .then(evaluation => console.log("Évaluation trouvée :", evaluation))
   *   .catch(err => console.error("Erreur :", err));
   */
  getById: async (evaluation_id) => {
    console.log("[Evaluation.getById] Début de la récupération de l'évaluation avec ID :", evaluation_id);
    try {
      // Définition de la requête SQL pour récupérer l'évaluation par ID
      const query = "SELECT * FROM evaluation WHERE evaluation_id = $1";
      console.log("[Evaluation.getById] Requête SQL :", query, "avec le paramètre :", evaluation_id);

      // Exécution de la requête
      const result = await pool.query(query, [evaluation_id]);
      console.log("[Evaluation.getById] Requête exécutée.");

      // Si aucune évaluation n'est trouvée, lever une erreur
      if (result.rows.length === 0) {
        console.error("[Evaluation.getById] Aucune évaluation trouvée avec l'ID :", evaluation_id);
        throw new Error("Aucune évaluation trouvée avec cet ID.");
      }
      console.log("[Evaluation.getById] Évaluation récupérée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Evaluation.getById] ❌ Erreur lors de la récupération de l'évaluation :", error.message);
      throw error;
    }
  },

  /**
   * Récupère toutes les évaluations associées à un utilisateur.
   *
   * Exécute une requête SQL pour obtenir toutes les évaluations de l'utilisateur spécifié.
   * Retourne un tableau vide si aucune évaluation n'est trouvée.
   *
   * @async
   * @function getByUser
   * @param {number} user_id - L'ID de l'utilisateur.
   * @returns {Promise<Array<Object>>} Une promesse résolue avec un tableau d'objets évaluation.
   *
   * @example
   * Evaluation.getByUser(1)
   *   .then(evaluations => console.log("Évaluations de l'utilisateur :", evaluations))
   *   .catch(err => console.error("Erreur :", err));
   */
  getByUser: async (user_id) => {
    console.log("[Evaluation.getByUser] Récupération des évaluations pour user_id:", user_id);
    // Préparation de la requête SQL
    const query = "SELECT * FROM evaluation WHERE user_id = $1";
    console.log("[Evaluation.getByUser] Requête SQL préparée :", query);

    // Exécution de la requête SQL
    const result = await pool.query(query, [user_id]);
    console.log("[Evaluation.getByUser] Nombre d'enregistrements trouvés :", result.rows.length);
    // Retourne le tableau d'évaluations (peut être vide)
    return result.rows;
  },

  /**
  * @async
  * @function getDashboardByUser
  * @description
  * Récupère un tableau récapitulatif ("dashboard") pour chaque évaluation appartenant à un utilisateur.
  * Chaque entrée du tableau contient :
  *   - `evaluation_id` : L'identifiant unique de l'évaluation.
  *   - `nom` : Le nom (ou titre) de l'évaluation.
  *   - `date_derniere_modification` : La date/heure de la dernière modification de l'évaluation.
  *   - `type_entite` : Le type d'entité liée à l'évaluation ("EE" ou "EI").
  *   - `answered_questions` : Le nombre total de réponses effectivement enregistrées pour cette évaluation.
  *   - `total_questions` : Le nombre total de questions de base attendues pour ce type d'entité,
  *     en excluant les questions marquées comme dépendantes (is_dependent = FALSE).
  *   - `progress_pct` : Le pourcentage d'avancement (answered_questions / total_questions * 100).
  *   - `nb_conforme` : Nombre de réponses dont le champ `conformite` vaut "CONFORME".
  *   - `nb_partiellement` : Nombre de réponses dont le champ `conformite` vaut "PARTIELLEMENT_CONFORME".
  *   - `nb_nonconforme` : Nombre de réponses dont le champ `conformite` vaut "NON_CONFORME".
  *
  * @param {number} user_id - L'ID de l'utilisateur dont on veut récupérer le dashboard.
  * @returns {Promise<Array>} Un tableau d'objets, chacun décrivant l'état d'une évaluation.
  */
  getDashboardByUser: async (user_id) => {
    console.log("[Evaluation.getDashboardByUser] Démarrage de la récupération du dashboard pour user_id :", user_id);

    // Construction de la requête SQL.
    // 1) La table "evaluation" est jointe à la table "reponse" pour récupérer les réponses existantes.
    //    On utilise un LEFT JOIN afin de ne pas exclure les évaluations sans réponse.
    // 2) On dénombre le nombre de réponses enregistrées (answered_questions).
    // 3) On calcule total_questions en fonction du type d'entité ("EE" ou "EI"),
    //    en ne prenant que les questions is_dependent = FALSE.
    // 4) progress_pct correspond à (answered_questions / total_questions) * 100, arrondi en entier.
    // 5) On compte les réponses classées par leur valeur de "conformite" :
    //    - nb_conforme (CONFORME)
    //    - nb_partiellement (PARTIELLEMENT_CONFORME)
    //    - nb_nonconforme (NON_CONFORME).
    const query = `
    SELECT
      e.evaluation_id,
      e.nom,
      e.date_derniere_modification,
      e.type_entite,

      -- Nombre total de réponses enregistrées pour l'évaluation
      COALESCE(COUNT(r.reponse_id), 0) AS answered_questions,

      -- Nombre total de questions à traiter (excluant celles qui sont dépendantes)
      CASE 
        WHEN e.type_entite = 'EE'
          THEN (SELECT COUNT(*) FROM question WHERE pour_ei = false AND is_dependent = false)
        ELSE (SELECT COUNT(*) FROM question WHERE pour_ei = true AND is_dependent = false)
      END AS total_questions,

      -- Pourcentage d'avancement de l'évaluation
      ROUND(
        COALESCE(COUNT(r.reponse_id), 0)::decimal
        / NULLIF(
            CASE 
              WHEN e.type_entite = 'EE'
                THEN (SELECT COUNT(*) FROM question WHERE pour_ei = false AND is_dependent = false)
              ELSE (SELECT COUNT(*) FROM question WHERE pour_ei = true AND is_dependent = false)
            END, 0
          ) * 100
      )::int AS progress_pct,

      -- Comptage du nombre de réponses par niveau de conformité
      SUM(CASE WHEN r.conformite = 'CONFORME' THEN 1 ELSE 0 END) AS nb_conforme,
      SUM(CASE WHEN r.conformite = 'PARTIELLEMENT_CONFORME' THEN 1 ELSE 0 END) AS nb_partiellement,
      SUM(CASE WHEN r.conformite = 'NON_CONFORME' THEN 1 ELSE 0 END) AS nb_nonconforme

    FROM evaluation e
      LEFT JOIN reponse r 
        ON e.evaluation_id = r.evaluation_id 
       AND e.user_id       = r.user_id
    WHERE e.user_id = $1
    GROUP BY e.evaluation_id, e.nom, e.date_derniere_modification, e.type_entite
    ORDER BY e.date_derniere_modification DESC;
  `;

    console.log("[Evaluation.getDashboardByUser] Requête SQL :", query);

    try {
      // Exécution de la requête SQL avec le user_id en paramètre.
      const { rows } = await pool.query(query, [user_id]);

      console.log("[Evaluation.getDashboardByUser] Nombre d'évaluations trouvées :", rows.length);

      // Retourne le tableau d'objets : chaque objet représente une évaluation
      // avec ses informations de progression et de conformité.
      return rows;
    } catch (error) {
      console.error("[Evaluation.getDashboardByUser] Erreur lors de la récupération du dashboard :", error.message);
      throw error;
    }
  },

  /**
 * Mettre à jour une évaluation existante.
 *
 * Cette méthode vérifie d'abord l'existence de l'évaluation, puis met à jour ses champs :
 * - **nom** : le nouveau nom de l'évaluation.
 * - **id_dernier_objectif** : le nouvel ID du dernier objectif atteint (optionnel).
 * - **type_entite** : le nouveau type d'entité ("EE" pour Entité Essentielle ou "EI" pour Entité Importante).
 * - **nombre_si** : le nouveau nombre de SI associés à l'évaluation (optionnel).
 *
 * La date de dernière modification est automatiquement mise à jour sur CURRENT_TIMESTAMP.
 *
 * @async
 * @function update
 * @param {number} evaluation_id - L'ID de l'évaluation à mettre à jour.
 * @param {string} nom - Le nouveau nom de l'évaluation.
 * @param {number|null} id_dernier_objectif - (Optionnel) Le nouvel ID du dernier objectif atteint.
 * @param {string} type_entite - Le nouveau type d'entité (doit être "EE" ou "EI").
 * @param {number} [nombre_si] - (Optionnel) Le nouveau nombre de SI associés à l'évaluation.
 * @returns {Promise<Object>} Une promesse résolue avec l'évaluation mise à jour.
 * @throws {Error} Lance une erreur si l'évaluation n'existe pas ou si la mise à jour échoue.
 *
 * @example
 * Evaluation.update(1, "Audit 2025 Modifié", null, "EI", 3)
 *   .then(updated => console.log("Évaluation mise à jour :", updated))
 *   .catch(err => console.error("Erreur :", err));
 */
  update: async (evaluation_id, nom, id_dernier_objectif, type_entite, nombre_si) => {
    console.log("[Evaluation.update] Début de la mise à jour de l'évaluation avec ID :", evaluation_id);
    try {
      // Vérification de l'existence de l'évaluation en base de données
      const checkQuery = "SELECT * FROM evaluation WHERE evaluation_id = $1";
      console.log("[Evaluation.update] Vérification de l'existence de l'évaluation avec la requête :", checkQuery, "et le paramètre :", evaluation_id);
      const checkResult = await pool.query(checkQuery, [evaluation_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Evaluation.update] Aucune évaluation trouvée pour l'ID :", evaluation_id);
        throw new Error("Aucune évaluation trouvée pour la mise à jour.");
      }
      console.log("[Evaluation.update] L'évaluation existe, préparation de la requête de mise à jour.");

      // Préparation de la requête SQL pour mettre à jour les champs de l'évaluation
      // On met à jour les colonnes : nom, id_dernier_objectif, type_entite, nombre_si et date_derniere_modification
      const query = `
      UPDATE evaluation 
      SET nom = COALESCE($1, nom), 
          id_dernier_objectif = COALESCE($2, id_dernier_objectif),
          type_entite = COALESCE($3, type_entite),
          nombre_si = COALESCE($4, nombre_si),
          date_derniere_modification = CURRENT_TIMESTAMP
      WHERE evaluation_id = $5 RETURNING *
    `;
      // Construction du tableau des valeurs à utiliser dans la requête SQL
      const values = [nom, id_dernier_objectif, type_entite, nombre_si, evaluation_id];
      console.log("[Evaluation.update] Requête SQL de mise à jour préparée :", query);
      console.log("[Evaluation.update] Valeurs associées :", values);

      // Exécution de la requête SQL
      const result = await pool.query(query, values);
      console.log("[Evaluation.update] Mise à jour effectuée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Evaluation.update] ❌ Erreur lors de la mise à jour de l'évaluation :", error.message);
      throw error;
    }
  },

  /**
   * Supprimer une évaluation par son ID.
   *
   * Vérifie l'existence de l'évaluation avant de l'effacer de la base de données. La suppression retourne l'objet supprimé.
   *
   * @async
   * @function delete
   * @param {number} evaluation_id - L'ID de l'évaluation à supprimer.
   * @returns {Promise<Object>} Retourne une promesse résolue avec l'objet évaluation supprimé.
   * @throws {Error} Lance une erreur si aucune évaluation n'est trouvée ou si la suppression échoue.
   *
   * @example
   * Evaluation.delete(1)
   *   .then(deleted => console.log("Évaluation supprimée :", deleted))
   *   .catch(err => console.error("Erreur :", err));
   */
  delete: async (evaluation_id) => {
    console.log("[Evaluation.delete] Début de la suppression de l'évaluation avec ID :", evaluation_id);
    try {
      // Vérification de l'existence de l'évaluation à supprimer
      const checkQuery = "SELECT * FROM evaluation WHERE evaluation_id = $1";
      console.log("[Evaluation.delete] Vérification de l'existence de l'évaluation avec la requête :", checkQuery, "et le paramètre :", evaluation_id);
      const checkResult = await pool.query(checkQuery, [evaluation_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Evaluation.delete] Aucune évaluation trouvée pour l'ID :", evaluation_id);
        throw new Error("Aucune évaluation trouvée pour la suppression.");
      }
      console.log("[Evaluation.delete] L'évaluation existe, préparation de la requête de suppression.");

      // Préparation de la requête SQL pour supprimer l'évaluation et retourner la ligne supprimée
      const query = "DELETE FROM evaluation WHERE evaluation_id = $1 RETURNING *";
      console.log("[Evaluation.delete] Requête SQL de suppression préparée :", query);
      console.log("[Evaluation.delete] Exécution de la requête avec le paramètre :", evaluation_id);

      // Exécution de la suppression
      const result = await pool.query(query, [evaluation_id]);
      console.log("[Evaluation.delete] Évaluation supprimée avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Evaluation.delete] ❌ Erreur lors de la suppression de l'évaluation :", error.message);
      throw error;
    }
  }
};

module.exports = Evaluation;