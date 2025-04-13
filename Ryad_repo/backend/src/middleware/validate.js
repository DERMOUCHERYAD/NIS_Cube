/**
 * @fileoverview Middlewares de validation des entrées avec express-validator.
 * Ce module fournit des middlewares permettant de valider les données envoyées par l'utilisateur pour l'inscription et la connexion.
 * @module middleware/validate
 */

const { body, validationResult } = require("express-validator");

/**
 * Middleware de validation pour l'inscription d'un utilisateur.
 * Vérifie que les champs username, email, password et type_entite sont présents et conformes aux exigences.
 *
 * @returns {Array} Un tableau de middlewares de validation pour l'inscription.
 */
exports.validateRegistration = [
  // Validation du champ username : il ne doit pas être vide
  body("username")
    .notEmpty()
    .withMessage("Le nom d'utilisateur est obligatoire.")
    .custom((value) => {
      console.log("[validateRegistration] Validation du champ username :", value);
      return true;
    }),

  // Validation du champ email : il doit correspondre à un format email valide
  body("email")
    .isEmail()
    .withMessage("L'email doit être valide.")
    .custom((value) => {
      console.log("[validateRegistration] Validation du champ email :", value);
      return true;
    }),

  // Validation du champ password : il doit comporter au moins 6 caractères
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit comporter au moins 6 caractères.")
    .custom((value) => {
      console.log("[validateRegistration] Validation du champ password. Longueur :", value.length);
      return true;
    }),

  // Validation du champ type_entite : il doit être soit "EE", soit "EI"
  body("type_entite")
    .isIn(["EE", "EI"])
    .withMessage("Le type d'entité doit être 'EE' ou 'EI'.")
    .custom((value) => {
      console.log("[validateRegistration] Validation du champ type_entite :", value);
      return true;
    }),

  // Middleware final qui vérifie si des erreurs de validation sont survenues et les renvoie si nécessaire
  (req, res, next) => {
    console.log("[validateRegistration] Vérification finale des erreurs de validation.");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[validateRegistration] Erreurs de validation :", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("[validateRegistration] Aucune erreur de validation détectée. Passage au middleware suivant.");
    next();
  },
];

/**
 * Middleware de validation pour la connexion d'un utilisateur.
 * Vérifie que l'email est valide et que le mot de passe est fourni.
 *
 * @returns {Array} Un tableau de middlewares de validation pour la connexion.
 */
exports.validateLogin = [
  // Validation du champ email : il doit correspondre à un format email valide
  body("email")
    .isEmail()
    .withMessage("L'email doit être valide.")
    .custom((value) => {
      console.log("[validateLogin] Validation du champ email :", value);
      return true;
    }),

  // Validation du champ password : il ne doit pas être vide
  body("password")
    .notEmpty()
    .withMessage("Le mot de passe est obligatoire.")
    .custom((value) => {
      console.log("[validateLogin] Validation du champ password :", value);
      return true;
    }),

  // Middleware final qui vérifie si des erreurs de validation sont survenues et les renvoie si nécessaire
  (req, res, next) => {
    console.log("[validateLogin] Vérification finale des erreurs de validation.");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[validateLogin] Erreurs de validation :", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("[validateLogin] Aucune erreur de validation détectée. Passage au middleware suivant.");
    next();
  },
];