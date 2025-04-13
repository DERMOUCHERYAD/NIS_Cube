/**
 * @fileoverview Routes pour la gestion des utilisateurs.
 * Définit l'inscription, la connexion, la vérification, la réinitialisation de mot de passe,
 * la réactivation, la gestion CRUD et la modification sécurisée de l'email (via pending_email).
 * @module routes/utilisateur.routes
 */

const express = require("express");
const {
  registerUser,
  loginUser,
  checkEmail,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  resendReactivationCode,
  verifyReactivation,
  confirmEmailChange
} = require("../controllers/utilisateur.controllers");

const router = express.Router();

/**
 * Vérifier si un email est déjà utilisé.
 * @route GET /utilisateurs/check?email=...
 */
router.get("/check", (req, res, next) => {
  console.log("[utilisateur.routes] GET /check, email =", req.query.email);
  checkEmail(req, res, next);
});

/**
 * Inscription d'un nouvel utilisateur.
 * @route POST /utilisateurs/register
 */
router.post("/register", (req, res, next) => {
  console.log("[utilisateur.routes] POST /register");
  registerUser(req, res, next);
});

/**
 * Connexion d'un utilisateur.
 * @route POST /utilisateurs/login
 */
router.post("/login", (req, res, next) => {
  console.log("[utilisateur.routes] POST /login");
  loginUser(req, res, next);
});

/**
 * Vérification via MFA.
 * @route POST /utilisateurs/verify
 */
router.post("/verify", (req, res, next) => {
  console.log("[utilisateur.routes] POST /verify");
  verifyUser(req, res, next);
});

/**
 * Renvoi d'un nouveau code de vérification pour un user non vérifié.
 * @route POST /utilisateurs/resend
 */
router.post("/resend", (req, res, next) => {
  console.log("[utilisateur.routes] POST /resend");
  resendVerificationCode(req, res, next);
});

/**
 * Demande de réinitialisation du mot de passe.
 * @route POST /utilisateurs/forgot-password
 */
router.post("/forgot-password", (req, res, next) => {
  console.log("[utilisateur.routes] POST /forgot-password");
  forgotPassword(req, res, next);
});

/**
 * Réinitialisation du mot de passe.
 * @route POST /utilisateurs/reset-password
 */
router.post("/reset-password", (req, res, next) => {
  console.log("[utilisateur.routes] POST /reset-password");
  resetPassword(req, res, next);
});

/**
 * Renvoi d'un code de réactivation pour un compte inactif.
 * @route POST /utilisateurs/resend-reactivation
 */
router.post("/resend-reactivation", (req, res, next) => {
  console.log("[utilisateur.routes] POST /resend-reactivation");
  resendReactivationCode(req, res, next);
});

/**
 * Vérification du code de réactivation.
 * @route POST /utilisateurs/verify-reactivation
 */
router.post("/verify-reactivation", (req, res, next) => {
  console.log("[utilisateur.routes] POST /verify-reactivation");
  verifyReactivation(req, res, next);
});

/**
 * Récupérer un utilisateur par son ID.
 * @route GET /utilisateurs/:id
 */
router.get("/:id", (req, res, next) => {
  console.log("[utilisateur.routes] GET /:id, ID =", req.params.id);
  getUserById(req, res, next);
});

/**
 * Mettre à jour un utilisateur (username, email en mode pending, password).
 * @route PUT /utilisateurs/:id
 */
router.put("/:id", (req, res, next) => {
  console.log("[utilisateur.routes] PUT /:id, ID =", req.params.id);
  updateUser(req, res, next);
});

/**
 * Supprimer un utilisateur.
 * @route DELETE /utilisateurs/:id
 */
router.delete("/:id", (req, res, next) => {
  console.log("[utilisateur.routes] DELETE /:id, ID =", req.params.id);
  deleteUser(req, res, next);
});

/**
 * Confirme le changement d'email (pending_email -> email).
 * @route POST /utilisateurs/confirm-email-change
 */
router.post("/confirm-email-change", (req, res, next) => {
  console.log("[utilisateur.routes] POST /confirm-email-change");
  confirmEmailChange(req, res, next);
});

module.exports = router;