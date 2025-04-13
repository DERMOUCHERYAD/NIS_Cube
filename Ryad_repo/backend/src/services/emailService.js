/**
 * @fileoverview Service d'envoi d'emails via Nodemailer.
 * Ce service gère l'envoi d'emails de vérification et de réinitialisation de mot de passe.
 * @module services/emailService
 */

const nodemailer = require("nodemailer");

// Création du transporteur Nodemailer en utilisant les variables d'environnement
/**
 * Transporteur Nodemailer configuré à partir des variables d'environnement.
 * @constant {nodemailer.Transporter}
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                     // Hôte SMTP
  port: Number(process.env.SMTP_PORT),             // Port SMTP
  secure: process.env.SMTP_SECURE === "true",        // true pour SSL (port 465), false pour TLS (port 587)
  auth: {
    user: process.env.SMTP_USER,                   // Nom d'utilisateur SMTP
    pass: process.env.SMTP_PASSWORD,               // Mot de passe SMTP
  },
});

/**
 * Envoie un email de vérification contenant un code.
 * Construit un email de vérification et l'envoie via le transporteur Nodemailer.
 *
 * @async
 * @function sendVerificationEmail
 * @param {string} email - Adresse email du destinataire.
 * @param {string} code - Code de vérification à envoyer.
 * @returns {Promise<void>} Promesse résolue lorsque l'email est envoyé.
 * @throws {Error} Si l'envoi de l'email échoue.
 */
const sendVerificationEmail = async (email, code) => {
  console.log("[sendVerificationEmail] Préparation de l'email de vérification pour :", email);
  const mailOptions = {
    from: process.env.SMTP_FROM, // Exemple : "Votre Nom <no-reply@votredomaine.com>"
    to: email,
    subject: "Vérification de votre compte",
    text: `Votre code de vérification est : ${code}`,
    html: `<p>Bonjour,</p>
           <p>Votre code de vérification est : <strong>${code}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[sendVerificationEmail] ✅ Email de vérification envoyé à ${email}`);
  } catch (error) {
    console.error("[sendVerificationEmail] ❌ Erreur lors de l'envoi de l'email de vérification :", error.message);
    throw error;
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe.
 * Construit un lien de réinitialisation avec le token et l'email, puis envoie l'email via le transporteur Nodemailer.
 *
 * @async
 * @function sendResetPasswordEmail
 * @param {string} email - Adresse email du destinataire.
 * @param {string} resetToken - Token de réinitialisation en clair.
 * @returns {Promise<void>} Promesse résolue lorsque l'email est envoyé.
 * @throws {Error} Si l'envoi de l'email échoue.
 */
const sendResetPasswordEmail = async (email, resetToken) => {
  console.log("[sendResetPasswordEmail] Préparation de l'email de réinitialisation pour :", email);
  // Construction de l'URL de réinitialisation. Adaptez le domaine et le chemin selon votre configuration.
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  console.log("[sendResetPasswordEmail] URL de réinitialisation générée :", resetUrl);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    text: `Vous avez demandé de réinitialiser votre mot de passe. Cliquez sur le lien suivant pour le faire : ${resetUrl}\nSi vous n'avez pas fait cette demande, ignorez cet email.`,
    html: `<p>Vous avez demandé de réinitialiser votre mot de passe.</p>
           <p>Cliquez sur le lien suivant pour le réinitialiser : <a href="${resetUrl}">${resetUrl}</a></p>
           <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[sendResetPasswordEmail] ✅ Email de réinitialisation envoyé à ${email}`);
  } catch (error) {
    console.error("[sendResetPasswordEmail] ❌ Erreur lors de l'envoi de l'email de réinitialisation :", error.message);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };