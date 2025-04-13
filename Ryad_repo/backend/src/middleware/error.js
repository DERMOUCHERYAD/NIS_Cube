/**
 * @fileoverview Middleware global de gestion des erreurs.
 * Ce module capture toutes les erreurs non gérées dans l'application,
 * les logue, et envoie une réponse JSON contenant le message d'erreur.
 * En production, la stack trace est masquée pour des raisons de sécurité.
 * @module middleware/error
 */

/**
 * Middleware de gestion globale des erreurs.
 * Log l'erreur, détermine le code d'erreur approprié et envoie une réponse JSON contenant le message d'erreur.
 *
 * @param {Error} err - L'objet erreur.
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.errorHandler = (err, req, res, next) => {
  console.error("[errorHandler] Une erreur a été capturée :", err.stack);
  // Si le statut de réponse n'a pas déjà été défini (différent de 200), on utilise 500 comme code par défaut
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  console.log("[errorHandler] Envoi de la réponse d'erreur avec le statut :", statusCode);
  res.status(statusCode).json({
    message: err.message,
    // En production, on masque la stack trace pour des raisons de sécurité
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};