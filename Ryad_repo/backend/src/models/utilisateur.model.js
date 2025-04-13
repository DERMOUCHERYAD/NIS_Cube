/**
 * @fileoverview Modèle pour la gestion des utilisateurs.
 * Gère l'inscription (MFA), la connexion, la mise à jour (pending_email pour un changement d'email sécurisé),
 * la suppression, la vérification et la réinitialisation du mot de passe.
 * @module models/utilisateur.model
 */

const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Utilisateur = {
  /**
   * Créer un nouvel utilisateur avec MFA.
   * @param {string} username - Nom d'utilisateur.
   * @param {string} email - Adresse email unique.
   * @param {string} password - Mot de passe en clair (sera haché).
   * @param {string} verificationCode - Code de vérification MFA généré.
   * @returns {Promise<Object>} - L'utilisateur créé (sans mot de passe), is_verified=false, verification_code stocké.
   */
  create: async (username, email, password, verificationCode) => {
    console.log("[Utilisateur.create] Création d'un nouvel utilisateur. Email :", email);
    try {
      if (!username || !email || !password) {
        throw new Error("Tous les champs sont obligatoires.");
      }

      // Vérifier si l'email est déjà utilisé
      const emailExists = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
      if (emailExists.rows.length > 0) {
        console.error("[Utilisateur.create] L'email est déjà utilisé :", email);
        throw new Error("L'email est déjà utilisé.");
      }

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("[Utilisateur.create] Mot de passe haché avec succès.");

      // Insertion en base
      const query = `
        INSERT INTO utilisateur (username, email, password, verification_code, is_verified)
        VALUES ($1, $2, $3, $4, false)
        RETURNING user_id, username, email, is_verified, verification_code
      `;
      const values = [username, email, hashedPassword, verificationCode];
      const result = await pool.query(query, values);

      console.log("[Utilisateur.create] Utilisateur créé ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.create] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Recherche d'un utilisateur via email (retourne * tout *).
   * @param {string} email - Email à chercher.
   * @returns {Promise<Object|null>} - L'utilisateur ou null si inexistant.
   */
  findByEmail: async (email) => {
    console.log("[Utilisateur.findByEmail] Recherche utilisateur pour email :", email);
    try {
      const query = "SELECT * FROM utilisateur WHERE email = $1";
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) {
        console.log("[Utilisateur.findByEmail] Aucun utilisateur trouvé pour :", email);
        return null;
      }
      console.log("[Utilisateur.findByEmail] Utilisateur trouvé ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.findByEmail] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer un utilisateur par son ID (sans mot de passe).
   * @param {number} user_id - ID de l'utilisateur.
   * @returns {Promise<Object>} - L'utilisateur (ou erreur).
   */
  findById: async (user_id) => {
    console.log("[Utilisateur.findById] Recherche user ID :", user_id);
    try {
      const query = "SELECT user_id, username, email, is_verified FROM utilisateur WHERE user_id = $1";
      const result = await pool.query(query, [user_id]);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.findById] Aucun user trouvé ID :", user_id);
        throw new Error("Aucun utilisateur trouvé avec cet ID.");
      }
      console.log("[Utilisateur.findById] Utilisateur trouvé ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.findById] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Récupérer tous les utilisateurs (liste).
   * @returns {Promise<Array>} - Tableau des utilisateurs (user_id, username, email, is_verified).
   */
  getAll: async () => {
    console.log("[Utilisateur.getAll] Récupération de tous les utilisateurs...");
    try {
      const query = "SELECT user_id, username, email, is_verified FROM utilisateur";
      const result = await pool.query(query);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.getAll] Aucun utilisateur trouvé.");
        throw new Error("Aucun utilisateur trouvé.");
      }
      console.log("[Utilisateur.getAll] Nombre d'utilisateurs trouvés :", result.rows.length);
      return result.rows;
    } catch (error) {
      console.error("[Utilisateur.getAll] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour un utilisateur (username, email, password).
   * Remarque : L'email n'est mis à jour ici que si on l'envoie explicitement.
   * En cas de changement d'email sécurisé, on ne modifie pas la colonne email tant que la confirmation n'est pas faite.
   *
   * @param {number} user_id - ID user à mettre à jour.
   * @param {string} username - Nouveau username (ou null pour conserver).
   * @param {string} email - Nouvelle adresse email (ou null pour conserver).
   * @param {string} password - Mot de passe haché (ou null).
   * @returns {Promise<Object>} - L'utilisateur mis à jour (sans le mot de passe).
   */
  update: async (user_id, username, email, password) => {
    console.log("[Utilisateur.update] Mise à jour user ID :", user_id);
    try {
      // Vérification existence
      const checkQuery = "SELECT * FROM utilisateur WHERE user_id = $1";
      const checkResult = await pool.query(checkQuery, [user_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Utilisateur.update] Aucun user trouvé ID :", user_id);
        throw new Error("Aucun utilisateur trouvé pour la mise à jour.");
      }

      let hashedPassword = null;
      if (password) {
        // Déjà haché par le contrôleur, possible double hachage => selon votre choix
        hashedPassword = password;
        console.log("[Utilisateur.update] Mot de passe déjà haché reçu.");
      }

      // Mise à jour basique
      const query = `
        UPDATE utilisateur
        SET username = COALESCE($1, username),
            email = COALESCE($2, email),
            password = COALESCE($3, password)
        WHERE user_id = $4
        RETURNING user_id, username, email, is_verified
      `;
      const values = [username, email, hashedPassword, user_id];
      const result = await pool.query(query, values);

      console.log("[Utilisateur.update] Mise à jour réussie. ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.update] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Met à jour le pending_email et le code de vérification (verification_code)
   * pour préparer un changement d'email sécurisé.
   *
   * @param {number} user_id - ID de l'utilisateur.
   * @param {string} pendingEmail - Nouvel email en attente.
   * @param {string} newCode - Code de vérification généré.
   * @returns {Promise<Object>} - L'utilisateur mis à jour (avec pending_email).
   */
  updatePendingEmail: async (user_id, pendingEmail, newCode) => {
    console.log("[Utilisateur.updatePendingEmail] Stockage du pending_email pour user ID :", user_id);
    try {
      const query = `
        UPDATE utilisateur
        SET pending_email = $1,
            verification_code = $2
        WHERE user_id = $3
        RETURNING user_id, username, email, pending_email, is_verified, verification_code
      `;
      const values = [pendingEmail, newCode, user_id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.updatePendingEmail] Aucun user trouvé ID :", user_id);
        throw new Error("Utilisateur non trouvé pour la mise à jour du pending_email.");
      }
      console.log("[Utilisateur.updatePendingEmail] pending_email + code maj. ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.updatePendingEmail] Erreur :", error.message);
      throw error;
    }
  },

  /**
 * Met à jour le code de vérification pour un utilisateur.
 *
 * @param {number} user_id - ID de l'utilisateur.
 * @param {string|null} newCode - Nouveau code de vérification à enregistrer (ou null pour l'effacer).
 * @returns {Promise<Object>} - L'utilisateur avec le code de vérification mis à jour.
 */
  updateVerificationCode: async (user_id, newCode) => {
    console.log("[Utilisateur.updateVerificationCode] Mise à jour du code pour user ID :", user_id);
    try {
      const query = `
          UPDATE utilisateur
          SET verification_code = $1
          WHERE user_id = $2
          RETURNING user_id, verification_code
        `;
      const values = [newCode, user_id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.updateVerificationCode] Aucun user trouvé pour ID :", user_id);
        throw new Error("Utilisateur non trouvé pour la mise à jour du code.");
      }
      console.log("[Utilisateur.updateVerificationCode] Code mis à jour pour user ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.updateVerificationCode] Erreur :", error.message);
      throw error;
    }
  },

  /**
 * Récupérer les informations nécessaires pour la confirmation d'email.
 *
 * @param {number} user_id - ID de l'utilisateur.
 * @returns {Promise<Object>} - L'utilisateur avec user_id, username, email, pending_email, verification_code et is_verified.
 */
  findForEmailConfirmation: async (user_id) => {
    console.log("[Utilisateur.findForEmailConfirmation] Recherche user ID :", user_id);
    const query = `
    SELECT user_id, username, email, pending_email, verification_code, is_verified
    FROM utilisateur
    WHERE user_id = $1
  `;
    const result = await pool.query(query, [user_id]);
    if (result.rows.length === 0) {
      console.error("[Utilisateur.findForEmailConfirmation] Aucun utilisateur trouvé pour ID :", user_id);
      throw new Error("Utilisateur non trouvé avec cet ID.");
    }
    return result.rows[0];
  },

  /**
 * Récupère un utilisateur par son ID en incluant le mot de passe (pour vérification).
 * @param {number} user_id - ID de l'utilisateur.
 * @returns {Promise<Object>} - L'utilisateur complet (y compris le password).
 */
  findByIdWithPassword: async (user_id) => {
    console.log("[Utilisateur.findByIdWithPassword] Recherche user ID :", user_id);
    const query = "SELECT * FROM utilisateur WHERE user_id = $1";
    const result = await pool.query(query, [user_id]);
    if (result.rows.length === 0) {
      console.error("[Utilisateur.findByIdWithPassword] Aucun user trouvé ID :", user_id);
      throw new Error("Aucun utilisateur trouvé avec cet ID.");
    }
    return result.rows[0];
  },

  /**
   * Confirme le changement d'email : pending_email -> email
   * Remise à NULL de pending_email et verification_code.
   *
   * @param {number} user_id - ID du user.
   * @returns {Promise<Object>} - L'utilisateur avec la colonne email modifiée.
   */
  confirmEmailChange: async (user_id) => {
    console.log("[Utilisateur.confirmEmailChange] Confirmer email pour user ID :", user_id);
    try {
      const query = `
        UPDATE utilisateur
        SET email = pending_email,
            pending_email = NULL,
            verification_code = NULL
        WHERE user_id = $1
        RETURNING user_id, username, email, is_verified
      `;
      const result = await pool.query(query, [user_id]);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.confirmEmailChange] User introuvable ID :", user_id);
        throw new Error("Utilisateur non trouvé pour la confirmation d'email.");
      }
      console.log("[Utilisateur.confirmEmailChange] Email confirmé pour user ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.confirmEmailChange] Erreur :", error.message);
      throw error;
    }
  },

  /**
 * Supprimer un utilisateur par son ID ainsi que toutes ses évaluations et réponses associées.
 * Exécute une transaction qui :
 *  - Vérifie l'existence de l'utilisateur.
 *  - Supprime toutes les réponses des évaluations de l'utilisateur.
 *  - Supprime toutes les évaluations de l'utilisateur.
 *  - Supprime l'utilisateur.
 *
 * @param {number} user_id - L'ID de l'utilisateur à supprimer.
 * @returns {Promise<Object>} - Retourne l'utilisateur supprimé (sans ses données sensibles).
 * @throws {Error} Si l'utilisateur n'est pas trouvé ou si une erreur survient durant la suppression.
 */
  delete: async (user_id) => {
    console.log("[Utilisateur.delete] Début de la suppression de l'utilisateur et de ses données, user_id :", user_id);
    try {
      // Démarrage de la transaction
      await pool.query('BEGIN');

      // Vérification de l'existence de l'utilisateur
      const checkQuery = "SELECT * FROM utilisateur WHERE user_id = $1";
      const checkResult = await pool.query(checkQuery, [user_id]);
      if (checkResult.rows.length === 0) {
        console.error("[Utilisateur.delete] Aucun utilisateur trouvé pour l'ID :", user_id);
        throw new Error("Aucun utilisateur trouvé pour la suppression.");
      }

      // Suppression des réponses associées aux évaluations de cet utilisateur
      const deleteResponsesQuery = `
      DELETE FROM reponse 
      WHERE evaluation_id IN (SELECT evaluation_id FROM evaluation WHERE user_id = $1)
    `;
      await pool.query(deleteResponsesQuery, [user_id]);
      console.log("[Utilisateur.delete] Réponses associées supprimées.");

      // Suppression des évaluations associées à cet utilisateur
      const deleteEvaluationsQuery = "DELETE FROM evaluation WHERE user_id = $1";
      await pool.query(deleteEvaluationsQuery, [user_id]);
      console.log("[Utilisateur.delete] Évaluations associées supprimées.");

      // Suppression de l'utilisateur
      const query = `
      DELETE FROM utilisateur
      WHERE user_id = $1
      RETURNING user_id, username, email, is_verified
    `;
      const result = await pool.query(query, [user_id]);
      console.log("[Utilisateur.delete] Utilisateur supprimé avec succès, user_id :", result.rows[0].user_id);

      // Validation de la transaction
      await pool.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      // En cas d'erreur, annulation de la transaction
      await pool.query('ROLLBACK');
      console.error("[Utilisateur.delete] Erreur lors de la suppression de l'utilisateur :", error.message);
      throw error;
    }
  },

  /**
   * Vérifier un utilisateur (is_verified = true) et effacer verification_code.
   *
   * @param {number} user_id - ID user
   * @returns {Promise<Object>} - L'utilisateur vérifié
   */
  verify: async (user_id) => {
    console.log("[Utilisateur.verify] Vérification user ID :", user_id);
    try {
      const query = `
        UPDATE utilisateur
        SET is_verified = true,
            verification_code = NULL
        WHERE user_id = $1
        RETURNING user_id, username, email, is_verified
      `;
      const result = await pool.query(query, [user_id]);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.verify] Aucun user pour ID :", user_id);
        throw new Error("Utilisateur non trouvé pour la vérification.");
      }
      console.log("[Utilisateur.verify] User vérifié ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.verify] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Met à jour le token de réinitialisation du mot de passe pour un user.
   *
   * @param {number} user_id - ID user.
   * @param {string} tokenHash - token de réinitialisation haché.
   * @param {number} expires - Timestamp d'expiration (ms).
   * @returns {Promise<Object>} - L'utilisateur mis à jour, sans password.
   */
  updateResetToken: async (user_id, tokenHash, expires) => {
    console.log("[Utilisateur.updateResetToken] user ID :", user_id);
    try {
      const query = `
        UPDATE utilisateur
        SET reset_password_token = $1,
            reset_password_expires = to_timestamp($2 / 1000.0)
        WHERE user_id = $3
        RETURNING user_id, username, email
      `;
      const values = [tokenHash, expires, user_id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.updateResetToken] user introuvable ID :", user_id);
        throw new Error("Utilisateur non trouvé pour la mise à jour du token.");
      }
      console.log("[Utilisateur.updateResetToken] Token maj user ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.updateResetToken] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Réinitialise le mot de passe et efface le token pour un user.
   * @param {number} user_id - ID user
   * @param {string} newHashedPassword - le password haché
   * @returns {Promise<Object>} - user mis à jour
   */
  resetPassword: async (user_id, newHashedPassword) => {
    console.log("[Utilisateur.resetPassword] user ID :", user_id);
    try {
      const query = `
        UPDATE utilisateur
        SET password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE user_id = $2
        RETURNING user_id, username, email, is_verified
      `;
      const values = [newHashedPassword, user_id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error("[Utilisateur.resetPassword] Aucun user ID :", user_id);
        throw new Error("Utilisateur non trouvé pour la réinitialisation du mot de passe.");
      }
      console.log("[Utilisateur.resetPassword] Mot de passe réinitialisé ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.resetPassword] Erreur :", error.message);
      throw error;
    }
  },

  /**
   * Met à jour last_login pour un user.
   * @param {number} user_id - ID user
   * @param {number} timestamp - Date.now() en millisecondes
   * @returns {Promise<Object>} - user maj
   */
  updateLastLogin: async (user_id, timestamp) => {
    console.log("[Utilisateur.updateLastLogin] user ID :", user_id, "| timestamp =", timestamp);
    try {
      const query = `
        UPDATE utilisateur
        SET last_login = to_timestamp($1 / 1000.0)
        WHERE user_id = $2
        RETURNING user_id, username, email, is_verified, last_login
      `;
      const values = [timestamp, user_id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error("Utilisateur non trouvé pour la mise à jour de last_login.");
      }
      console.log("[Utilisateur.updateLastLogin] last_login mis à jour ID :", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.error("[Utilisateur.updateLastLogin] Erreur :", error.message);
      throw error;
    }
  },
};

module.exports = Utilisateur;