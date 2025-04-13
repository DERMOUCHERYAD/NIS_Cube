/**
 * @fileoverview Générateur de code de vérification.
 * @module utils/codeGenerator
 */

/**
 * Génère un code numérique à 6 chiffres.
 *
 * @returns {string} Code généré.
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  module.exports = { generateVerificationCode };  