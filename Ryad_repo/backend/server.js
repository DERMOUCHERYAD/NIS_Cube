/**
 * @fileoverview Point d'entrée de l'API backend.
 * Ce module configure l'application Express avec les middlewares de sécurité, les routes et la gestion globale des erreurs.
 * Il démarre également le serveur sur le port spécifié.
 * @module serveur
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import des middlewares de gestion des erreurs
const { errorHandler } = require("./src/middleware/error.js");

// Import des routes de l'application
const utilisateurRoutes = require("./src/routes/utilisateur.routes");
const axeRoutes = require("./src/routes/axe.routes");
const objectifRoutes = require("./src/routes/objectif.routes");
const questionRoutes = require("./src/routes/question.routes");
const evaluationRoutes = require("./src/routes/evaluation.routes");
const reponseRoutes = require("./src/routes/reponse.routes");
const evaluationFlowRoutes = require("./src/routes/evaluationFlow.routes");

const app = express();
const PORT = process.env.PORT || 5000;

console.log("[serveur.js] Configuration de l'application Express.");

// Sécurité HTTP avec Helmet
console.log("[serveur.js] Application de Helmet pour la sécurité HTTP.");
app.use(helmet());

// Configuration CORS pour autoriser les requêtes depuis le frontend
console.log("[serveur.js] Configuration de CORS pour autoriser les requêtes depuis http://localhost:5173.");
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// Rate Limiting pour limiter le nombre de requêtes
console.log("[serveur.js] Configuration du rate limiting (100 requêtes par IP par 15 minutes).");
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par IP par fenêtre
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard."
});
app.use(limiter);

// Middleware pour parser le JSON dans le body des requêtes
console.log("[serveur.js] Ajout du middleware pour parser le JSON.");
app.use(express.json());

// Définition des routes de l'API
console.log("[serveur.js] Définition des routes de l'API.");
app.use("/utilisateurs", utilisateurRoutes);
app.use("/axes", axeRoutes);
app.use("/objectifs", objectifRoutes);
app.use("/questions", questionRoutes);
app.use("/evaluations", evaluationRoutes);
app.use("/reponses", reponseRoutes);
app.use("/evaluation-flow", evaluationFlowRoutes); 

// Route racine pour tester le serveur
app.get("/", (req, res) => {
  console.log("[serveur.js] Requête GET reçue sur la route racine.");
  res.send("🚀 API en cours d'exécution...");
});

// Middleware global de gestion des erreurs (doit être placé après toutes les routes)
console.log("[serveur.js] Ajout du middleware global de gestion des erreurs.");
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});