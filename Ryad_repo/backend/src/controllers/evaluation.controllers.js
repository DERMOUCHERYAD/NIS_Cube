/**
 * @fileoverview Contrôleurs pour la gestion des évaluations.
 * Ce module gère la création, la récupération, la mise à jour et la suppression des évaluations via l'API.
 * Chaque contrôleur reçoit une requête Express, appelle le modèle et renvoie la réponse appropriée.
 *
 * @module controllers/evaluation.controllers
 * @requires module:models/evaluation.model
 */

const Evaluation = require("../models/evaluation.model");

/**
 * Créer une nouvelle évaluation.
 *
 * Cette fonction :
 *  1. Extrait les données de la requête (user_id, nom, id_dernier_objectif, entityType, nombre_si).
 *  2. Valide la présence des champs obligatoires (user_id, nom, entityType).
 *  3. Mappe la valeur front-end entityType ("essential" ou "important") vers la valeur en base de données ("EE" ou "EI").
 *  4. Appelle la méthode create du modèle Evaluation pour insérer l'évaluation dans la base de données, incluant la nouvelle colonne nombre_si.
 *  5. Retourne l'évaluation nouvellement créée au format JSON.
 *
 * @async
 * @function createEvaluation
 * @route POST /evaluations
 * @param {Object} req - Objet requête Express.
 * @param {Object} req.body - Corps de la requête contenant les données de l'évaluation.
 * @param {number|string} req.body.user_id - ID de l'utilisateur (peut être un nombre ou une chaîne représentant un nombre).
 * @param {string} req.body.nom - Nom ou titre de l'évaluation.
 * @param {number|string} [req.body.id_dernier_objectif] - ID du dernier objectif atteint (optionnel).
 * @param {string} req.body.entityType - Doit être "essential" ou "important".
 * @param {number} [req.body.nombre_si] - (Optionnel) Nombre de SI associé à l'évaluation. Par défaut, 0.
 * @param {Object} res - Objet réponse Express, utilisé pour renvoyer les données au client.
 * @returns {Promise<void>} Ne retourne rien directement (utilise res.json pour envoyer la réponse).
 * @throws {Error} Lance une erreur 500 si la création de l'évaluation échoue.
 *
 * @example
 * // Exemple d'appel côté front (axios)
 * axios.post('/evaluations', {
 *   user_id: 1,
 *   nom: "Évaluation Q1 2025",
 *   entityType: "essential",
 *   nombre_si: 3
 * })
 *   .then(response => console.log(response.data))
 *   .catch(err => console.error(err));
 */
exports.createEvaluation = async (req, res) => {
  console.log("[createEvaluation] Début création évaluation.");
  try {
    // Extraction des données du corps de la requête
    const { user_id, nom, id_dernier_objectif, entityType, nombre_si } = req.body;
    console.log("[createEvaluation] Payload reçu:", { user_id, nom, id_dernier_objectif, entityType, nombre_si });

    // Validation des champs obligatoires
    if (!user_id || !nom || !entityType) {
      console.error("[createEvaluation] Champs obligatoires manquants => user_id, nom, entityType");
      return res.status(400).json({ message: "user_id, nom et entityType sont obligatoires." });
    }
    console.log("[createEvaluation] Tous les champs obligatoires sont présents.");

    // Mapping du champ entityType (front-end) vers type_entite attendu en base de données
    const typeMap = { essential: 'EE', important: 'EI' };
    const type_entite = typeMap[entityType];
    if (!type_entite) {
      console.error("[createEvaluation] Valeur entityType invalide:", entityType);
      return res.status(400).json({ message: "entityType doit être 'essential' ou 'important'." });
    }
    console.log("[createEvaluation] Type entité mappé pour la DB :", type_entite);

    // Appel du modèle pour créer l'évaluation en transmettant le nouveau paramètre nombre_si
    console.log("[createEvaluation] Appel de Evaluation.create(...) avec le paramètre nombre_si =", nombre_si);
    const newEvaluation = await Evaluation.create(user_id, nom, id_dernier_objectif, type_entite, nombre_si);
    console.log("[createEvaluation] Évaluation créée avec succès =>", newEvaluation);

    // Renvoi de la nouvelle évaluation au client en format JSON
    return res.status(201).json(newEvaluation);
  } catch (error) {
    console.error("[createEvaluation] Erreur lors de la création de l'évaluation:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer toutes les évaluations d'un utilisateur.
 *
 * Cette fonction :
 *  1. Extrait l'ID de l'utilisateur depuis req.params.user_id.
 *  2. Appelle la méthode getByUser du modèle pour récupérer toutes les évaluations associées.
 *  3. Retourne la liste sous forme d'un tableau JSON (même si vide).
 *
 * @async
 * @function getEvaluationsByUser
 * @route GET /evaluations/user/:user_id
 * @param {Object} req - Objet requête Express.
 * @param {Object} req.params - Paramètres d'URL.
 * @param {number|string} req.params.user_id - ID de l'utilisateur (peut être numérique ou chaîne).
 * @param {Object} res - Objet réponse Express.
 * @returns {Promise<void>}
 * @throws {Error} Erreur 500 si une exception se produit lors de la récupération.
 *
 * @example
 * // Exemple de requête: GET /evaluations/user/1
 * // Réponse (JSON): [ { evaluation_id: 10, user_id: 1, nom: "Audit Q1", ... }, ... ]
 */
exports.getEvaluationsByUser = async (req, res) => {
  console.log("[getEvaluationsByUser] Début de la récupération des évaluations pour l'utilisateur ID :", req.params.user_id);
  try {
    console.log("[getEvaluationsByUser] Appel du modèle -> Evaluation.getByUser(...)");
    const evaluations = await Evaluation.getByUser(req.params.user_id);

    console.log("[getEvaluationsByUser] Nombre d'évaluations récupérées :", evaluations.length);
    return res.status(200).json(evaluations);
  } catch (error) {
    console.error("[getEvaluationsByUser] Erreur lors de la récupération des évaluations :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Récupère le résumé "dashboard" de toutes les évaluations d’un utilisateur.
 *
 * Cette méthode permet d'obtenir, pour chaque évaluation, un ensemble de données clés comme :
 *  - L'ID de l'évaluation
 *  - Le nom de l'évaluation
 *  - La date de dernière modification
 *  - Le type d'entité (EE ou EI)
 *  - Le nombre de questions répondues
 *  - Le total de questions
 *  - Le pourcentage d'avancement (progress_pct)
 *
 * @async
 * @function getDashboardByUser
 * @route GET /evaluations/dashboard/user/:user_id
 * @param {Object} req - Requête Express.
 * @param {Object} req.params - Paramètres d'URL.
 * @param {number|string} req.params.user_id - ID de l'utilisateur.
 * @param {Object} res - Réponse Express.
 * @returns {Promise<void>}
 * @throws {Error} Erreur 500 si une exception survient.
 */
exports.getDashboardByUser = async (req, res) => {
  console.log("[getDashboardByUser] Début récupération dashboard pour user_id:", req.params.user_id);
  try {
    console.log("[getDashboardByUser] Appel de Evaluation.getDashboardByUser(...)");
    const dashboard = await Evaluation.getDashboardByUser(req.params.user_id);

    console.log("[getDashboardByUser] Dashboard récupéré avec succès, nb d'entrées:", dashboard.length);
    return res.status(200).json(dashboard);
  } catch (error) {
    console.error("[getDashboardByUser] Erreur:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer une évaluation par son ID.
 *
 * Cette fonction :
 *  1. Lit l'ID de l'évaluation dans req.params.id.
 *  2. Appelle la méthode getById du modèle.
 *  3. Vérifie si l'évaluation existe, sinon renvoie 404.
 *  4. Retourne l'évaluation si trouvée.
 *
 * @async
 * @function getEvaluationById
 * @route GET /evaluations/:id
 * @param {Object} req - Requête Express.
 * @param {Object} req.params - Paramètres d'URL.
 * @param {number|string} req.params.id - ID de l'évaluation à récupérer.
 * @param {Object} res - Réponse Express.
 * @returns {Promise<void>}
 * @throws {Error} Erreur 500 si la récupération échoue.
 *
 * @example
 * // GET /evaluations/5
 * // Réponse: { evaluation_id: 5, user_id: 1, nom: "Audit Sécu", ... }
 */
exports.getEvaluationById = async (req, res) => {
  console.log("[getEvaluationById] Début de la récupération de l'évaluation avec ID :", req.params.id);
  try {
    console.log("[getEvaluationById] Appel du modèle -> Evaluation.getById(...)");
    const evaluation = await Evaluation.getById(req.params.id);

    // Si la méthode getById renvoie null ou undefined, c'est qu'aucune évaluation n'a été trouvée
    if (!evaluation) {
      console.error("[getEvaluationById] Aucune évaluation trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Évaluation non trouvée." });
    }

    console.log("[getEvaluationById] Évaluation récupérée avec succès :", evaluation);
    return res.status(200).json(evaluation);
  } catch (error) {
    console.error("[getEvaluationById] Erreur lors de la récupération de l'évaluation :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Mettre à jour une évaluation.
 *
 * Cette fonction :
 *  1. Extrait l'ID de l'évaluation depuis req.params.id.
 *  2. Extrait les données du corps de la requête : nom, id_dernier_objectif, type_entite et nombre_si.
 *  3. Vérifie la présence des champs obligatoires (nom, type_entite).
 *  4. Appelle la méthode update du modèle Evaluation pour modifier les données de l'évaluation,
 *     en incluant le nouveau paramètre nombre_si.
 *  5. Retourne l'évaluation mise à jour en format JSON.
 *
 * @async
 * @function updateEvaluation
 * @route PUT /evaluations/:id
 * @param {Object} req - Requête Express.
 * @param {Object} req.params - Paramètres d'URL.
 * @param {number|string} req.params.id - ID de l'évaluation à mettre à jour.
 * @param {Object} req.body - Données pour la mise à jour.
 * @param {string} req.body.nom - Nouveau nom de l'évaluation (obligatoire).
 * @param {number|string} [req.body.id_dernier_objectif] - Dernier objectif atteint (optionnel).
 * @param {string} req.body.type_entite - Nouveau type d'entité (obligatoire), "EE" ou "EI".
 * @param {number} [req.body.nombre_si] - (Optionnel) Nouveau nombre de SI associés à l'évaluation.
 * @param {Object} res - Réponse Express.
 * @returns {Promise<void>}
 * @throws {Error} Lance une erreur 500 si la mise à jour échoue.
 *
 * @example
 * // PUT /evaluations/10
 * // Body: { nom: "Nouvelle éval", id_dernier_objectif: 2, type_entite: "EI", nombre_si: 4 }
 * // Réponse: { ...évaluation mise à jour... }
 */
exports.updateEvaluation = async (req, res) => {
  console.log("[updateEvaluation] Début de la mise à jour de l'évaluation avec ID :", req.params.id);
  try {
    // Extraction des données du body, y compris le nouveau paramètre nombre_si
    const { nom, id_dernier_objectif, type_entite, nombre_si } = req.body;
    console.log("[updateEvaluation] Données reçues pour la mise à jour :", {
      nom,
      id_dernier_objectif,
      type_entite,
      nombre_si
    });

    // Vérification des champs obligatoires
    if (!nom || !type_entite) {
      console.error("[updateEvaluation] Champs obligatoires manquants => nom, type_entite");
      return res.status(400).json({ message: "Le nom et le type d'entité sont obligatoires pour la mise à jour." });
    }
    console.log("[updateEvaluation] Champs obligatoires vérifiés.");

    // Appel du modèle pour mettre à jour l'évaluation, en passant le paramètre nombre_si
    console.log("[updateEvaluation] Appel de Evaluation.update(...) avec le paramètre nombre_si =", nombre_si);
    const updatedEvaluation = await Evaluation.update(req.params.id, nom, id_dernier_objectif, type_entite, nombre_si);

    // Vérification du résultat : si aucune évaluation n'est trouvée, renvoyer 404
    if (!updatedEvaluation) {
      console.error("[updateEvaluation] Aucune évaluation trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Évaluation non trouvée." });
    }
    console.log("[updateEvaluation] Évaluation mise à jour avec succès :", updatedEvaluation);

    // Renvoi de l'évaluation mise à jour en JSON
    return res.status(200).json(updatedEvaluation);
  } catch (error) {
    console.error("[updateEvaluation] Erreur lors de la mise à jour de l'évaluation :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Supprimer une évaluation.
 *
 * Cette fonction :
 *  1. Extrait l'ID de l'évaluation depuis req.params.id.
 *  2. Appelle la méthode delete du modèle pour supprimer la ligne correspondante en base de données.
 *  3. Retourne un message de confirmation et l'objet supprimé en JSON.
 *
 * @async
 * @function deleteEvaluation
 * @route DELETE /evaluations/:id
 * @param {Object} req - Requête Express.
 * @param {Object} req.params - Paramètres d'URL.
 * @param {number|string} req.params.id - ID de l'évaluation à supprimer.
 * @param {Object} res - Réponse Express.
 * @returns {Promise<void>}
 * @throws {Error} Erreur 500 si la suppression échoue.
 *
 * @example
 * // DELETE /evaluations/12
 * // Réponse: { message: "Évaluation supprimée avec succès", evaluation: {...} }
 */
exports.deleteEvaluation = async (req, res) => {
  console.log("[deleteEvaluation] Début de la suppression de l'évaluation avec ID :", req.params.id);
  try {
    console.log("[deleteEvaluation] Appel du modèle -> Evaluation.delete(...)");
    const deletedEvaluation = await Evaluation.delete(req.params.id);

    if (!deletedEvaluation) {
      console.error("[deleteEvaluation] Aucune évaluation trouvée pour l'ID :", req.params.id);
      return res.status(404).json({ message: "Évaluation non trouvée." });
    }
    console.log("[deleteEvaluation] Évaluation supprimée avec succès :", deletedEvaluation);

    return res.status(200).json({ message: "Évaluation supprimée avec succès", evaluation: deletedEvaluation });
  } catch (error) {
    console.error("[deleteEvaluation] Erreur lors de la suppression de l'évaluation :", error.message);
    return res.status(500).json({ message: error.message });
  }
};