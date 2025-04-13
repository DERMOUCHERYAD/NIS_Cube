/**
 * @fileoverview Modèle pour la gestion des axes.
 * Ce module fournit des méthodes pour créer, récupérer, mettre à jour et supprimer des axes dans la base de données.
 * @module models/axe.model
 */

const pool = require("../config/db");

/**
 * Objet représentant le modèle Axe avec ses méthodes CRUD.
 * @namespace Axe
 */
const Axe = {
  /**
   * Créer un nouvel axe.
   * Valide l'entrée et insère un nouvel enregistrement dans la table "axe".
   * Ajoute des logs détaillés pour le suivi de l'exécution.
   *
   * @param {string} nom - Nom de l'axe à créer.
   * @returns {Promise<Object>} - Retourne l'objet axe créé.
   * @throws {Error} Si le nom est manquant ou si une erreur survient lors de l'insertion en base.
   */
  create: async (nom) => {
    console.log("[Axe.create] Début de la création d'un nouvel axe avec le nom :", nom);
    try {
      // Validation de l'entrée
      if (!nom) {
        console.error("[Axe.create] Le nom de l'axe est obligatoire.");
        throw new Error("Le nom de l'axe est obligatoire.");
      }
      // Requête SQL pour insérer un nouvel axe
      const query = "INSERT INTO axe (nom) VALUES ($1) RETURNING *";
      console.log("[Axe.create] Exécution de la requête SQL :", query, "avec le paramètre :", nom);
      const result = await pool.query(query, [nom]);
      console.log("[Axe.create] Axe créé avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Axe.create] ❌ Erreur lors de la création de l'axe :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer un axe par son ID.
   * Exécute une requête SQL pour récupérer l'axe correspondant à l'ID fourni.
   * Ajoute des logs détaillés pour le suivi de l'exécution.
   *
   * @param {number} axe_id - Identifiant de l'axe à récupérer.
   * @returns {Promise<Object>} - Retourne l'objet axe correspondant.
   * @throws {Error} Si aucun axe n'est trouvé ou si une erreur survient lors de la requête.
   */
  getById: async (axe_id) => {
    console.log("[Axe.getById] Début de la récupération de l'axe avec ID :", axe_id);
    try {
      const query = "SELECT * FROM axe WHERE axe_id = $1";
      console.log("[Axe.getById] Exécution de la requête SQL :", query, "avec le paramètre :", axe_id);
      const result = await pool.query(query, [axe_id]);
      if (result.rows.length === 0) {
        console.error("[Axe.getById] Aucun axe trouvé avec l'ID :", axe_id);
        throw new Error("Aucun axe trouvé avec cet ID.");
      }
      console.log("[Axe.getById] Axe récupéré avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Axe.getById] ❌ Erreur lors de la récupération de l'axe :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer tous les axes.
   * Exécute une requête SQL pour récupérer tous les enregistrements de la table "axe".
   * Ajoute des logs détaillés pour le suivi de l'exécution.
   *
   * @returns {Promise<Array>} - Retourne un tableau contenant tous les axes.
   * @throws {Error} Si aucun axe n'est trouvé ou si une erreur survient lors de la requête.
   */
  getAll: async () => {
    console.log("[Axe.getAll] Début de la récupération de tous les axes.");
    try {
      const query = "SELECT * FROM axe";
      console.log("[Axe.getAll] Exécution de la requête SQL :", query);
      const result = await pool.query(query);
      if (result.rows.length === 0) {
        console.error("[Axe.getAll] Aucun axe trouvé dans la base.");
        throw new Error("Aucun axe trouvé.");
      }
      console.log("[Axe.getAll] Nombre d'axes récupérés :", result.rows.length);
      return result.rows;
    } catch (error) {
      console.error("[Axe.getAll] ❌ Erreur lors de la récupération des axes :", error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour un axe existant.
   * Vérifie l'existence de l'axe avant de procéder à la mise à jour avec une requête SQL.
   * Ajoute des logs détaillés pour suivre le processus de mise à jour.
   *
   * @param {number} axe_id - Identifiant de l'axe à mettre à jour.
   * @param {string} nom - Nouveau nom de l'axe.
   * @returns {Promise<Object>} - Retourne l'objet axe mis à jour.
   * @throws {Error} Si l'axe n'est pas trouvé ou si une erreur survient lors de la mise à jour.
   */
  update: async (axe_id, nom) => {
    console.log("[Axe.update] Début de la mise à jour de l'axe avec ID :", axe_id, "et nouveau nom :", nom);
    try {
      // Vérifier si l'axe existe avant de le modifier
      const checkQuery = "SELECT * FROM axe WHERE axe_id = $1";
      console.log("[Axe.update] Vérification de l'existence de l'axe avec la requête :", checkQuery, "paramètre :", axe_id);
      const checkResult = await pool.query(checkQuery, [axe_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Axe.update] Aucun axe trouvé pour l'ID :", axe_id);
        throw new Error("Aucun axe trouvé pour la mise à jour.");
      }
      // Requête SQL pour mettre à jour l'axe
      const query = "UPDATE axe SET nom = COALESCE($1, nom) WHERE axe_id = $2 RETURNING *";
      console.log("[Axe.update] Exécution de la requête SQL :", query, "avec les paramètres :", nom, axe_id);
      const result = await pool.query(query, [nom, axe_id]);
      console.log("[Axe.update] Axe mis à jour avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Axe.update] ❌ Erreur lors de la mise à jour de l'axe :", error.message);
      throw error;
    }
  },

  /**
   * Supprimer un axe par son ID.
   * Vérifie l'existence de l'axe avant de le supprimer à l'aide d'une requête SQL.
   * Ajoute des logs détaillés pour suivre le processus de suppression.
   *
   * @param {number} axe_id - Identifiant de l'axe à supprimer.
   * @returns {Promise<Object>} - Retourne l'objet axe supprimé.
   * @throws {Error} Si l'axe n'est pas trouvé ou si une erreur survient lors de la suppression.
   */
  delete: async (axe_id) => {
    console.log("[Axe.delete] Début de la suppression de l'axe avec ID :", axe_id);
    try {
      // Vérifier si l'axe existe avant de le supprimer
      const checkQuery = "SELECT * FROM axe WHERE axe_id = $1";
      console.log("[Axe.delete] Vérification de l'existence de l'axe avec la requête :", checkQuery, "paramètre :", axe_id);
      const checkResult = await pool.query(checkQuery, [axe_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Axe.delete] Aucun axe trouvé pour l'ID :", axe_id);
        throw new Error("Aucun axe trouvé pour la suppression.");
      }
      // Requête SQL pour supprimer l'axe
      const query = "DELETE FROM axe WHERE axe_id = $1 RETURNING *";
      console.log("[Axe.delete] Exécution de la requête SQL :", query, "avec le paramètre :", axe_id);
      const result = await pool.query(query, [axe_id]);
      console.log("[Axe.delete] Axe supprimé avec succès :", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("[Axe.delete] ❌ Erreur lors de la suppression de l'axe :", error.message);
      throw error;
    }
  }
};

module.exports = Axe;