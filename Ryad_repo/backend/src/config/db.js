/**
 * @fileoverview Configuration de la connexion à PostgreSQL.
 * Ce module utilise `pg.Pool` pour gérer les connexions avec la base de données PostgreSQL.
 * Les paramètres de connexion sont chargés depuis les variables d'environnement.
 * @module config/db
 */

const { Pool } = require("pg");
require("dotenv").config();
console.log("[db.js] ➤ DEBUG DB_PASSWORD =", process.env.DB_PASSWORD);


console.log("[db.js] Chargement des variables d'environnement pour la configuration de PostgreSQL.");

/**
 * Pool de connexions à PostgreSQL.
 * L'instance de Pool est configurée avec les paramètres de connexion fournis par les variables d'environnement.
 *
 * @constant {Pool} pool - Instance de Pool pour gérer les connexions PostgreSQL.
 */
const pool = new Pool({
  user: process.env.DB_USER,         // Nom d'utilisateur de la base de données
  host: process.env.DB_HOST,         // Hôte de la base de données
  database: process.env.DB_NAME,     // Nom de la base de données
  password: process.env.DB_PASSWORD, // Mot de passe de la base de données
  port: process.env.DB_PORT,         // Port d'écoute de PostgreSQL
});

console.log("[db.js] Pool de connexions créé avec les paramètres suivants :", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

/**
 * Teste la connexion à la base de données PostgreSQL.
 * Affiche un message de succès si la connexion est établie ou une erreur en cas d'échec.
 */
pool.connect()
  .then(() => console.log("✅ Connexion à PostgreSQL réussie !"))
  .catch(err => console.error("❌ Erreur de connexion à PostgreSQL :", err));

/**
 * @exports pool
 * @description Instance de `pg.Pool` exportée pour être utilisée dans les modèles de l'application.
 */
module.exports = pool;