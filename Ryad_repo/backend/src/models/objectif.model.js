/**
 * @fileoverview Modèle pour la gestion des objectifs.
 * Ce module fournit des méthodes pour créer, récupérer, mettre à jour et supprimer des objectifs dans la base de données.
 * @module models/objectif.model
 */

const pool = require("../config/db");

const Objectif = {
  /**
   * Créer un nouvel objectif.
   * Valide que les champs obligatoires (axe_id, description, justification_risques) sont fournis,
   * puis insère un nouvel enregistrement dans la table "objectif" et retourne l'objet créé.
   *
   * @param {number} axe_id - ID de l'axe associé.
   * @param {string} description - Description de l'objectif.
   * @param {string} justification_risques - Justification des risques si l'objectif n'est pas atteint.
   * @returns {Promise<Object>} - Retourne l'objectif créé.
   * @throws {Error} Si l'un des champs obligatoires est manquant ou si une erreur survient lors de l'insertion.
   */
  create: async (axe_id, description, justification_risques) => {
    console.log("[Objectif.create] Début de la création d'un nouvel objectif.");
    try {
      // Validation des entrées
      if (!axe_id || !description || !justification_risques) {
        console.error("[Objectif.create] Champs obligatoires manquants :", { axe_id, description, justification_risques });
        throw new Error("L'ID de l'axe, la description et la justification des risques sont obligatoires.");
      }
      // Préparation de la requête SQL pour insérer un nouvel objectif
      const query = `INSERT INTO objectif (axe_id, description, justification_risques) 
                     VALUES ($1, $2, $3) RETURNING *`;
      const values = [axe_id, description, justification_risques];
      console.log("[Objectif.create] Exécution de la requête SQL :", query, "avec les valeurs :", values);
      const result = await pool.query(query, values);
      console.log("[Objectif.create] Objectif créé avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Objectif.create] ❌ Erreur lors de la création de l'objectif :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer un objectif par son ID.
   * Exécute une requête SQL pour obtenir l'objectif correspondant à l'ID fourni.
   *
   * @param {number} objectif_id - ID de l'objectif.
   * @returns {Promise<Object>} - Retourne l'objectif correspondant.
   * @throws {Error} Si aucun objectif n'est trouvé ou si une erreur survient lors de la requête.
   */
  getById: async (objectif_id) => {
    console.log("[Objectif.getById] Début de la récupération de l'objectif avec ID :", objectif_id);
    try {
      const query = "SELECT * FROM objectif WHERE objectif_id = $1";
      console.log("[Objectif.getById] Exécution de la requête SQL :", query, "avec le paramètre :", objectif_id);
      const result = await pool.query(query, [objectif_id]);
      if (result.rows.length === 0) {
        console.error("[Objectif.getById] Aucun objectif trouvé avec l'ID :", objectif_id);
        throw new Error("Aucun objectif trouvé avec cet ID.");
      }
      console.log("[Objectif.getById] Objectif récupéré avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Objectif.getById] ❌ Erreur lors de la récupération de l'objectif :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer tous les objectifs associés à un axe donné.
   * Exécute une requête SQL pour récupérer l'ensemble des objectifs de l'axe spécifié.
   *
   * @param {number} axe_id - ID de l'axe.
   * @returns {Promise<Array>} - Retourne un tableau contenant les objectifs.
   * @throws {Error} Si aucun objectif n'est trouvé ou si une erreur survient lors de la requête.
   */
  getByAxe: async (axe_id) => {
    console.log("[Objectif.getByAxe] Début de la récupération des objectifs pour l'axe ID :", axe_id);
    try {
      const query = "SELECT * FROM objectif WHERE axe_id = $1";
      console.log("[Objectif.getByAxe] Exécution de la requête SQL :", query, "avec le paramètre :", axe_id);
      const result = await pool.query(query, [axe_id]);
      if (result.rows.length === 0) {
        console.error("[Objectif.getByAxe] Aucun objectif trouvé pour l'axe ID :", axe_id);
        throw new Error("Aucun objectif trouvé pour cet axe.");
      }
      console.log("[Objectif.getByAxe] Nombre d'objectifs récupérés :", result.rows.length);
      return result.rows;
    } catch (error) {
      console.error("[Objectif.getByAxe] ❌ Erreur lors de la récupération des objectifs :", error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour un objectif existant.
   * Vérifie que l'objectif existe, puis met à jour ses champs "description" et "justification_risques".
   *
   * @param {number} objectif_id - ID de l'objectif à mettre à jour.
   * @param {string} description - Nouvelle description de l'objectif.
   * @param {string} justification_risques - Nouvelle justification des risques.
   * @returns {Promise<Object>} - Retourne l'objectif mis à jour.
   * @throws {Error} Si l'objectif n'est pas trouvé ou si une erreur survient lors de la mise à jour.
   */
  update: async (objectif_id, description, justification_risques) => {
    console.log("[Objectif.update] Début de la mise à jour de l'objectif avec ID :", objectif_id);
    try {
      // Vérifier si l'objectif existe avant de procéder à la mise à jour
      const checkQuery = "SELECT * FROM objectif WHERE objectif_id = $1";
      console.log("[Objectif.update] Vérification de l'existence de l'objectif avec la requête :", checkQuery, "paramètre :", objectif_id);
      const checkResult = await pool.query(checkQuery, [objectif_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Objectif.update] Aucun objectif trouvé pour l'ID :", objectif_id);
        throw new Error("Aucun objectif trouvé pour la mise à jour.");
      }
      // Préparation et exécution de la requête SQL pour mettre à jour l'objectif
      const query = `UPDATE objectif 
                     SET description = COALESCE($1, description), 
                         justification_risques = COALESCE($2, justification_risques)
                     WHERE objectif_id = $3 RETURNING *`;
      const values = [description, justification_risques, objectif_id];
      console.log("[Objectif.update] Exécution de la requête SQL :", query, "avec les valeurs :", values);
      const result = await pool.query(query, values);
      console.log("[Objectif.update] Objectif mis à jour avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Objectif.update] ❌ Erreur lors de la mise à jour de l'objectif :", error.message);
      throw error;
    }
  },

  /**
   * Supprimer un objectif par son ID.
   * Vérifie que l'objectif existe, puis le supprime en exécutant une requête SQL.
   *
   * @param {number} objectif_id - ID de l'objectif à supprimer.
   * @returns {Promise<Object>} - Retourne l'objectif supprimé.
   * @throws {Error} Si aucun objectif n'est trouvé ou si une erreur survient lors de la suppression.
   */
  delete: async (objectif_id) => {
    console.log("[Objectif.delete] Début de la suppression de l'objectif avec ID :", objectif_id);
    try {
      // Vérifier l'existence de l'objectif avant la suppression
      const checkQuery = "SELECT * FROM objectif WHERE objectif_id = $1";
      console.log("[Objectif.delete] Vérification de l'existence de l'objectif avec la requête :", checkQuery, "paramètre :", objectif_id);
      const checkResult = await pool.query(checkQuery, [objectif_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Objectif.delete] Aucun objectif trouvé pour l'ID :", objectif_id);
        throw new Error("Aucun objectif trouvé pour la suppression.");
      }
      // Exécution de la requête SQL pour supprimer l'objectif
      const query = "DELETE FROM objectif WHERE objectif_id = $1 RETURNING *";
      console.log("[Objectif.delete] Exécution de la requête SQL :", query, "avec le paramètre :", objectif_id);
      const result = await pool.query(query, [objectif_id]);
      console.log("[Objectif.delete] Objectif supprimé avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Objectif.delete] ❌ Erreur lors de la suppression de l'objectif :", error.message);
      throw error;
    }
  }
};

module.exports = Objectif;