/**
 * @fileoverview Middleware d'authentification par JWT.
 * Ce module vérifie la présence et la validité du token JWT dans l'en-tête Authorization.
 * Si le token est valide, son payload est attaché à req.user ; sinon, la requête est rejetée.
 * @module middleware/auth
 */

const jwt = require("jsonwebtoken");

/**
 * Middleware pour protéger les routes par vérification du token JWT.
 * Vérifie que le token est présent dans l'en-tête Authorization au format "Bearer token".
 * Si le token est valide, le payload est attaché à req.user ; sinon, la requête est rejetée avec un code 401.
 *
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.headers - Les en-têtes de la requête.
 * @param {string} req.headers.authorization - En-tête d'autorisation contenant le token.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.protect = (req, res, next) => {
  console.log("[auth.protect] Vérification du token JWT dans l'en-tête Authorization.");

  const authHeader = req.headers.authorization;
  console.log("[auth.protect] Authorization Header :", authHeader);

  // Vérifier la présence et le format du token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[auth.protect] Token manquant ou format invalide.");
    return res.status(401).json({ message: "Accès non autorisé : token manquant." });
  }

  // Extraire le token
  const token = authHeader.split(" ")[1];
  console.log("[auth.protect] Token extrait :", token);

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[auth.protect] Token vérifié avec succès. Payload décodé :", decoded);
    req.user = decoded; // Attacher le payload décodé à req.user
    next();
  } catch (error) {
    console.error("[auth.protect] Erreur lors de la vérification du token :", error.message);
    return res.status(401).json({ message: "Accès non autorisé : token invalide." });
  }
};