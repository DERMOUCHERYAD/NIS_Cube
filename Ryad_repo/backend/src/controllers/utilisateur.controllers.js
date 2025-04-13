/**
 * @fileoverview Contrôleurs pour la gestion des utilisateurs avec MFA, réinitialisation de mot de passe
 * et gestion sécurisée de la modification d'email (via pending_email).
 * @module controllers/utilisateur.controllers
 */

const Utilisateur = require("../models/utilisateur.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateVerificationCode } = require("../utils/codeGenerator");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../services/emailService");

/**
 * Inscription d'un nouvel utilisateur avec MFA.
 * Génère un code de vérification, enregistre l'utilisateur avec is_verified = false,
 * et envoie un email de vérification à l'adresse indiquée.
 *
 * @route POST /utilisateurs/register
 * @param {Object} req - La requête Express (username, email, password).
 * @param {Object} res - La réponse Express.
 * @returns {Promise<void>}
 */
exports.registerUser = async (req, res) => {
  console.log("[registerUser] Début de l'inscription d'un nouvel utilisateur.");
  try {
    const { username, email, password } = req.body;
    console.log("[registerUser] Données reçues :", { username, email });

    if (!username || !email || !password) {
      console.error("[registerUser] Champs manquants.");
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findByEmail(email).catch((err) => {
      console.error("[registerUser] Erreur lors de la recherche de l'utilisateur :", err);
      return null;
    });
    if (existingUser) {
      console.error("[registerUser] L'email est déjà utilisé.");
      return res.status(400).json({ message: "L'email est déjà utilisé." });
    }

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();
    console.log("[registerUser] Code de vérification généré :", verificationCode);

    // Créer l'utilisateur avec ce code (is_verified = false)
    const newUser = await Utilisateur.create(username, email, password, verificationCode);
    console.log("[registerUser] Utilisateur créé avec succès :", newUser.user_id);

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verificationCode);
    console.log("[registerUser] Email de vérification envoyé à", email);

    res.status(201).json({
      message: "Utilisateur créé. Un code de vérification a été envoyé par email.",
      user: newUser
    });
  } catch (error) {
    console.error("[registerUser] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Connexion de l'utilisateur.
 * Vérifie les identifiants, l'état de vérification, puis met à jour last_login.
 * Si last_login remonte à plus de 30 jours, envoie un nouveau code de réactivation.
 *
 * @route POST /utilisateurs/login
 * @param {Object} req - Contient email et password.
 * @param {Object} res - Réponse Express.
 * @returns {Promise<void>}
 */
exports.loginUser = async (req, res) => {
  console.log("[loginUser] Début de la connexion.");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.error("[loginUser] Email ou mot de passe manquant.");
      return res.status(400).json({ message: "Email et mot de passe sont obligatoires." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      console.error("[loginUser] Utilisateur introuvable pour l'email :", email);
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérification du mot de passe (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("[loginUser] Mot de passe incorrect pour l'email :", email);
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérification is_verified
    if (!user.is_verified) {
      console.error("[loginUser] Compte non vérifié pour l'email :", email);
      return res.status(400).json({ message: "Utilisateur non vérifié" });
    }

    // Vérifier si l'utilisateur est inactif depuis plus de 30 jours
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastLogin = user.last_login ? new Date(user.last_login).getTime() : 0;

    if (!user.last_login || (now - lastLogin) > THIRTY_DAYS_MS) {
      console.log("[loginUser] Dernière connexion > 30 jours ou inexistante:", user.user_id);

      const reactivationCode = generateVerificationCode();
      console.log("[loginUser] Code de réactivation généré :", reactivationCode);

      await Utilisateur.updateVerificationCode(user.user_id, reactivationCode);
      await sendVerificationEmail(email, reactivationCode);
      console.log("[loginUser] Email de réactivation envoyé à", email);

      return res.status(400).json({
        message: "Votre compte n'a pas été utilisé depuis plus de 30 jours. " +
                 "Veuillez vérifier votre email pour réactiver votre compte."
      });
    }

    // Mise à jour de last_login
    await Utilisateur.updateLastLogin(user.user_id, now);
    console.log("[loginUser] last_login mis à jour pour l'utilisateur :", user.user_id);

    // Génération du token JWT
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    console.log("[loginUser] Connexion réussie pour l'utilisateur :", user.user_id);

    res.status(200).json({ message: "Connexion réussie", token, user });
  } catch (error) {
    console.error("[loginUser] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Vérifie l'utilisateur via MFA (code de vérification).
 * Met is_verified = true, efface verification_code et maj last_login.
 *
 * @route POST /utilisateurs/verify
 * @param {Object} req - email + verificationCode.
 * @param {Object} res - Réponse Express.
 */
exports.verifyUser = async (req, res) => {
  console.log("[verifyUser] Début de la vérification de l'utilisateur.");
  try {
    const { email, verificationCode } = req.body;
    console.log("[verifyUser] Données reçues :", { email, verificationCode });

    if (!email || !verificationCode) {
      console.error("[verifyUser] Email ou code manquant.");
      return res.status(400).json({ message: "Email et code de vérification sont obligatoires." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      console.error("[verifyUser] Utilisateur non trouvé pour l'email :", email);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (user.verification_code !== verificationCode) {
      console.error("[verifyUser] Code de vérification incorrect pour l'email :", email);
      return res.status(400).json({ message: "Code de vérification incorrect." });
    }

    // Mise à jour : is_verified = true + effacer verification_code
    const updatedUser = await Utilisateur.verify(user.user_id);
    console.log("[verifyUser] Utilisateur vérifié avec succès :", updatedUser.user_id);

    // Mettre à jour last_login
    await Utilisateur.updateLastLogin(updatedUser.user_id, Date.now());
    console.log("[verifyUser] last_login mis à jour pour l'utilisateur :", updatedUser.user_id);

    res.status(200).json({
      message: "Votre compte a été vérifié avec succès.",
      user: updatedUser
    });
  } catch (error) {
    console.error("[verifyUser] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupère un utilisateur par son ID.
 *
 * @route GET /utilisateurs/:id
 * @param {Object} req - Contient req.params.id.
 * @param {Object} res - Réponse.
 */
exports.getUserById = async (req, res) => {
  console.log("[getUserById] Recherche de l'utilisateur ID :", req.params.id);
  try {
    const user = await Utilisateur.findById(req.params.id);
    if (!user) {
      console.error("[getUserById] Utilisateur non trouvé ID :", req.params.id);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    console.log("[getUserById] Utilisateur trouvé :", user.user_id);
    res.status(200).json(user);
  } catch (error) {
    console.error("[getUserById] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Met à jour un utilisateur (username, email, mot de passe).
 * - Si newPassword est renseigné, vérifie d'abord currentPassword contre le hash en base.
 * - Si email change, stocke en pending_email + envoie un code de confirmation à l’ancienne adresse.
 *
 * @route PUT /utilisateurs/:id
 * @param {Object} req - Requête Express ({ username, email, newPassword, currentPassword }).
 * @param {Object} res - Réponse Express.
 * @returns {Promise<void>}
 */
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  console.log("[updateUser] Début de la mise à jour de l'utilisateur ID :", userId);

  try {
    const { username, email, newPassword, currentPassword } = req.body;

    // Aucun champ fourni ?
    if (!username && !email && !newPassword) {
      console.error("[updateUser] Aucun champ à mettre à jour.");
      return res.status(400).json({ message: "Au moins un champ doit être mis à jour." });
    }

    // Récupérer l'utilisateur complet (incluant password pour vérification)
    const user = await Utilisateur.findByIdWithPassword(userId);
    console.log("[updateUser] Utilisateur récupéré pour mise à jour :", user.user_id);

    let emailChanged = false;
    let emailToUpdate = user.email;

    // Si changement d'email
    if (email && email !== user.email) {
      emailChanged = true;
      console.log("[updateUser] Nouvelle adresse détectée :", email);
      const code = generateVerificationCode();
      console.log("[updateUser] Code confirmation généré :", code);

      await Utilisateur.updatePendingEmail(user.user_id, email, code);
      console.log("[updateUser] pending_email + verification_code mis à jour");

      await sendVerificationEmail(user.email, code);
      console.log("[updateUser] Email de confirmation envoyé à l'ancienne adresse :", user.email);
    }

    // Gestion du changement de mot de passe
    let hashedPassword = null;
    if (newPassword) {
      console.log("[updateUser] Demande de changement de mot de passe reçue");
      if (!currentPassword) {
        console.error("[updateUser] currentPassword manquant");
        return res.status(400).json({ message: "Le mot de passe actuel est requis pour changer le mot de passe." });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.error("[updateUser] Mot de passe actuel incorrect pour user ID :", userId);
        return res.status(400).json({ message: "Mot de passe actuel incorrect." });
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("[updateUser] Nouveau mot de passe haché");
    }

    // Effectuer la mise à jour (username, email effectif, password)
    const updatedUser = await Utilisateur.update(
      userId,
      username,
      emailToUpdate,
      hashedPassword
    );

    console.log("[updateUser] Mise à jour réussie pour user ID :", updatedUser.user_id);
    return res.status(200).json({
      ...updatedUser,
      emailChanged
    });

  } catch (error) {
    console.error("[updateUser] Erreur inattendue :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Supprime un utilisateur par son ID.
 *
 * @route DELETE /utilisateurs/:id
 * @param {Object} req - contient req.params.id
 * @param {Object} res - Réponse Express
 */
exports.deleteUser = async (req, res) => {
  console.log("[deleteUser] Suppression de l'utilisateur ID :", req.params.id);
  try {
    const deletedUser = await Utilisateur.delete(req.params.id);
    if (!deletedUser) {
      console.error("[deleteUser] Utilisateur non trouvé ID :", req.params.id);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    console.log("[deleteUser] Utilisateur supprimé :", deletedUser.user_id);
    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
      user: deletedUser
    });
  } catch (error) {
    console.error("[deleteUser] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Vérifie si un email est déjà utilisé.
 *
 * @route GET /utilisateurs/check?email=...
 * @param {Object} req - doit contenir req.query.email
 * @param {Object} res - Réponse
 */
exports.checkEmail = async (req, res) => {
  console.log("[checkEmail] Vérification de l'email :", req.query.email);
  try {
    const { email } = req.query;
    if (!email) {
      console.error("[checkEmail] Email manquant dans la query.");
      return res.status(400).json({ message: "Email manquant." });
    }

    let user;
    try {
      user = await Utilisateur.findByEmail(email);
      console.log("[checkEmail] Utilisateur trouvé :", user ? user.user_id : null);
    } catch (err) {
      console.error("[checkEmail] Erreur lors de la recherche de l'email :", err);
    }

    if (user) {
      return res.status(200).json({ exists: true, is_verified: user.is_verified });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("[checkEmail] Erreur :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Renvoyer un nouveau code de vérification pour un utilisateur non vérifié.
 *
 * @route POST /utilisateurs/resend
 * @param {Object} req - Requête Express (req.body.email).
 * @param {Object} res - Réponse.
 */
exports.resendVerificationCode = async (req, res) => {
  console.log("[resendVerificationCode] Demande de renvoi de code pour l'email :", req.body.email);
  try {
    const { email } = req.body;
    if (!email) {
      console.error("[resendVerificationCode] Email manquant.");
      return res.status(400).json({ message: "Email manquant." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      console.error("[resendVerificationCode] Aucun utilisateur trouvé pour l'email :", email);
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
    }
    if (user.is_verified) {
      console.error("[resendVerificationCode] L'utilisateur est déjà vérifié :", email);
      return res.status(400).json({ message: "Cet utilisateur est déjà vérifié." });
    }

    const newCode = generateVerificationCode();
    console.log("[resendVerificationCode] Nouveau code généré :", newCode);

    await Utilisateur.updateVerificationCode(user.user_id, newCode);
    console.log("[resendVerificationCode] Code de vérification mis à jour user :", user.user_id);

    await sendVerificationEmail(email, newCode);
    console.log("[resendVerificationCode] Email de vérification renvoyé à", email);

    res.status(200).json({ message: "Nouveau code de vérification envoyé." });
  } catch (error) {
    console.error("[resendVerificationCode] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Gère la demande de réinitialisation du mot de passe.
 *
 * @route POST /utilisateurs/forgot-password
 * @param {Object} req - Requête (req.body.email).
 * @param {Object} res - Réponse.
 */
exports.forgotPassword = async (req, res) => {
  console.log("[forgotPassword] Demande de réinitialisation pour l'email :", req.body.email);
  try {
    const { email } = req.body;
    if (!email) {
      console.error("[forgotPassword] Email manquant dans le body.");
      return res.status(400).json({ message: "Email manquant." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      console.log("[forgotPassword] Utilisateur introuvable => Réponse générique.");
      return res.status(200).json({
        message: "Si cet email est enregistré, vous recevrez un lien de réinitialisation."
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log("[forgotPassword] Token généré :", resetToken);

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log("[forgotPassword] Token haché :", tokenHash);

    const expires = Date.now() + 3600000; // 1h
    console.log("[forgotPassword] Token expirera à :", new Date(expires).toLocaleString());

    await Utilisateur.updateResetToken(user.user_id, tokenHash, expires);
    console.log("[forgotPassword] Token de réinitialisation stocké pour l'utilisateur :", user.user_id);

    // Envoi email
    await sendResetPasswordEmail(email, resetToken);
    console.log("[forgotPassword] Email de réinitialisation envoyé à", email);

    return res.status(200).json({
      message: "Si cet email est enregistré, vous recevrez un lien de réinitialisation."
    });
  } catch (error) {
    console.error("[forgotPassword] Erreur :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Réinitialise le mot de passe d'un utilisateur.
 *
 * @route POST /utilisateurs/reset-password
 * @param {Object} req - (email, token, newPassword)
 * @param {Object} res - Réponse.
 */
exports.resetPassword = async (req, res) => {
  console.log("[resetPassword] Réinitialisation du mot de passe pour l'email :", req.body.email);
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      console.error("[resetPassword] Champs manquants.");
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user || !user.reset_password_token || !user.reset_password_expires) {
      console.error("[resetPassword] Réinitialisation invalide : user introuvable ou token absent.");
      return res.status(400).json({ message: "Réinitialisation invalide ou expirée." });
    }

    // Comparer le token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log("[resetPassword] Token (haché) fourni :", tokenHash);

    const tokenValid = tokenHash === user.reset_password_token;
    const tokenNotExpired = Date.now() <= new Date(user.reset_password_expires).getTime();

    if (!tokenValid || !tokenNotExpired) {
      console.error("[resetPassword] Token invalide ou expiré.");
      return res.status(400).json({ message: "Réinitialisation invalide ou expirée." });
    }

    // Hachage du nouveau password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("[resetPassword] Nouveau mot de passe haché.");

    const updatedUser = await Utilisateur.resetPassword(user.user_id, hashedPassword);
    console.log("[resetPassword] Mot de passe réinitialisé user :", updatedUser.user_id);

    return res.status(200).json({
      message: "Mot de passe réinitialisé avec succès.",
      user: updatedUser
    });
  } catch (error) {
    console.error("[resetPassword] Erreur :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Renvoyer un code de réactivation pour un compte inactif.
 *
 * @route POST /utilisateurs/resend-reactivation
 * @param {Object} req - doit contenir req.body.email
 * @param {Object} res - Réponse
 */
exports.resendReactivationCode = async (req, res) => {
  console.log("[resendReactivationCode] Demande de renvoi de code de réactivation pour :", req.body.email);
  try {
    const { email } = req.body;
    if (!email) {
      console.error("[resendReactivationCode] Email manquant.");
      return res.status(400).json({ message: "Email manquant." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      console.error("[resendReactivationCode] Utilisateur introuvable pour email :", email);
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
    }

    const reactivationCode = generateVerificationCode();
    console.log("[resendReactivationCode] Code généré :", reactivationCode);

    await Utilisateur.updateVerificationCode(user.user_id, reactivationCode);
    await sendVerificationEmail(email, reactivationCode);
    console.log("[resendReactivationCode] Code de réactivation envoyé à", email);

    res.status(200).json({ message: "Nouveau code de réactivation envoyé." });
  } catch (error) {
    console.error("[resendReactivationCode] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Vérifie le code de réactivation fourni par l'utilisateur.
 *
 * @route POST /utilisateurs/verify-reactivation
 * @param {Object} req - (email, reactivationCode)
 * @param {Object} res - Réponse.
 */
exports.verifyReactivation = async (req, res) => {
  console.log("[verifyReactivation] Réactivation du compte pour l'email :", req.body.email);
  try {
    const { email, reactivationCode } = req.body;
    if (!email || !reactivationCode) {
      console.error("[verifyReactivation] Champs manquants.");
      return res.status(400).json({ message: "Email et code de réactivation sont obligatoires." });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      console.error("[verifyReactivation] Utilisateur non trouvé :", email);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (user.verification_code !== reactivationCode) {
      console.error("[verifyReactivation] Code de réactivation incorrect.");
      return res.status(400).json({ message: "Code de réactivation incorrect." });
    }

    await Utilisateur.updateVerificationCode(user.user_id, null);
    await Utilisateur.updateLastLogin(user.user_id, Date.now());
    console.log("[verifyReactivation] Compte réactivé pour l'utilisateur :", user.user_id);

    res.status(200).json({ message: "Votre compte a été réactivé avec succès." });
  } catch (error) {
    console.error("[verifyReactivation] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Confirme le changement d'email via pending_email.
 * Vérifie le code de confirmation stocké dans verification_code,
 * et si OK, transfère pending_email -> email.
 *
 * @route POST /utilisateurs/confirm-email-change
 * @param {Object} req - (userId, verificationCode)
 * @param {Object} res - Réponse
 */
exports.confirmEmailChange = async (req, res) => {
  console.log("[confirmEmailChange] Début de la confirmation du changement d'email.");
  try {
    const { userId, verificationCode } = req.body;
    if (!userId || !verificationCode) {
      console.error("[confirmEmailChange] Champs manquants : userId ou verificationCode absent.");
      return res.status(400).json({ message: "ID utilisateur et code de vérification sont obligatoires." });
    }

    // Récupérer l'utilisateur
    const user = await Utilisateur.findForEmailConfirmation(userId);
    if (!user) {
      console.error("[confirmEmailChange] Utilisateur introuvable ID :", userId);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Comparer le code existant dans verification_code
    if (user.verification_code !== verificationCode) {
      console.error("[confirmEmailChange] Code incorrect pour l'utilisateur ID :", userId);
      return res.status(400).json({ message: "Code de vérification incorrect." });
    }

    // Transférer pending_email vers email
    const updatedUser = await Utilisateur.confirmEmailChange(userId);
    console.log("[confirmEmailChange] Email confirmé pour user :", updatedUser.user_id);

    res.status(200).json({
      message: "Email mis à jour avec succès.",
      user: updatedUser
    });
  } catch (error) {
    console.error("[confirmEmailChange] Erreur :", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;