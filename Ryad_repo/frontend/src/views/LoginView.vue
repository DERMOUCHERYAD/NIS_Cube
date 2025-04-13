<template>
  <div class="auth-container">
    <article class="auth-card">
      <header>
        <h1>Connexion</h1>
        <p>Connectez-vous pour accéder à votre espace</p>
      </header>

      <!-- Bandeau de notification (pour afficher les erreurs) -->
      <div v-if="notification" class="notification-banner">
        <p>{{ notification }}</p>
        <button class="close-btn" @click="closeNotification">×</button>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="votre@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="Votre mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
            >
              <Eye v-if="!showPassword" class="icon" />
              <EyeOff v-else class="icon" />
            </button>
          </div>
        </div>

        <div class="form-footer">
          <a href="#" class="forgot-password" @click.prevent="goToForgotPassword"
            >Mot de passe oublié ?</a
          >
        </div>

        <!-- Bouton de soumission sans :disabled -->
        <button type="submit" class="submit-btn">
          <LogIn class="icon" />
          Se connecter
        </button>
      </form>

      <footer>
        <p>
          Pas encore de compte ?
          <RouterLink to="/register">Créer un compte</RouterLink>
        </p>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { LogIn, Eye, EyeOff } from 'lucide-vue-next';

/**
 * @fileoverview Composant Vue pour la page de connexion.
 * S'il s'avère que le compte n'est pas vérifié, on renvoie automatiquement un nouveau code
 * via l'endpoint /utilisateurs/resend et on redirige l'utilisateur vers la page de vérification.
 */

/**
 * Champs du formulaire
 */
const email = ref('');
const password = ref('');
const showPassword = ref(false);

/**
 * Notification pour afficher les erreurs (bandeau)
 */
const notification = ref('');

/**
 * Router pour la navigation
 */
const router = useRouter();

/**
 * Ferme le bandeau d'erreur
 */
function closeNotification(): void {
  notification.value = '';
}

/**
 * Bascule l'affichage du mot de passe (texte <-> password).
 */
function togglePassword(): void {
  showPassword.value = !showPassword.value;
}

/**
 * Redirige vers la page "Mot de passe oublié".
 */
function goToForgotPassword(): void {
  router.push({ name: 'forgot-password' });
}

/**
 * Gère la connexion en appelant l'API backend.
 * - Vérifie que les champs email et password sont renseignés.
 * - En cas de compte non vérifié, renvoie un nouveau code de vérification et redirige vers la page /verify.
 * - En cas de compte inactif (non utilisé depuis plus de 30 jours), redirige vers la page de réactivation.
 * - Sinon, stocke le token et l'identifiant utilisateur dans le localStorage et redirige vers le dashboard.
 *
 * @returns {Promise<void>}
 */
 async function handleLogin(): Promise<void> {
  // Vider la notification avant le début du traitement
  notification.value = '';
  console.log("[handleLogin] Début de la connexion.");

  // Vérifier que les champs email et password ne sont pas vides
  if (email.value.trim() === '' || password.value.trim() === '') {
    notification.value = "Veuillez remplir tous les champs.";
    console.error("[handleLogin] Champs manquants : email ou mot de passe vide.");
    return;
  }

  try {
    console.log("[handleLogin] Envoi de la requête de connexion pour l'email:", email.value);
    const response = await axios.post('http://localhost:5000/utilisateurs/login', {
      email: email.value,
      password: password.value
    });
    console.log("[handleLogin] Réponse reçue de l'API:", response.data);

    // Stocker le token dans le localStorage
    localStorage.setItem("token", response.data.token);
    console.log("[handleLogin] Token stocké dans le localStorage.");

    // Stocker l'identifiant utilisateur dans le localStorage
    if (response.data.user && response.data.user.user_id) {
      localStorage.setItem("userId", response.data.user.user_id);
      console.log("[handleLogin] Identifiant utilisateur stocké:", response.data.user.user_id);
    } else {
      console.error("[handleLogin] Identifiant utilisateur manquant dans la réponse.");
    }

    // Redirection vers le dashboard en cas de connexion réussie
    console.log("[handleLogin] Redirection vers le dashboard.");
    router.push({ name: 'dashboard' });
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const serverMsg = error.response.data?.message || '';
      console.error("[handleLogin] Erreur de réponse de l'API. Statut:", status, "Message:", serverMsg);

      if (status === 401) {
        // Email ou mot de passe incorrect
        notification.value = "Email ou mot de passe incorrect. Veuillez réessayer.";
      } else if (status === 400 && serverMsg.includes("Utilisateur non vérifié")) {
        // Compte non vérifié : renvoyer un nouveau code et rediriger vers la page de vérification
        notification.value = "Votre compte n'est pas vérifié. Un nouveau code vient de vous être envoyé.";
        try {
          console.log("[handleLogin] Tentative de renvoi du code de vérification pour l'email:", email.value);
          await axios.post('http://localhost:5000/utilisateurs/resend', { email: email.value });
          console.log("[handleLogin] Nouveau code de vérification envoyé.");
        } catch (resendError) {
          console.error("[handleLogin] Erreur lors du renvoi du code de vérification:", resendError);
        }
        router.push({ name: 'verify', query: { email: email.value } });
      } else if (status === 400 && serverMsg.includes("n'a pas été utilisé depuis plus de 30 jours")) {
        // Compte inactif : rediriger vers la page de réactivation
        notification.value = serverMsg;
        console.error("[handleLogin] Compte inactif depuis plus de 30 jours pour l'email:", email.value);
        router.push({ name: 'reactivation', query: { email: email.value } });
      } else if (status === 400 || status === 404) {
        notification.value = serverMsg || "Identifiants invalides.";
      } else {
        notification.value = "Une erreur s'est produite. Veuillez réessayer plus tard.";
      }
    } else {
      console.error("[handleLogin] Erreur réseau ou absence de réponse de l'API:", error);
      notification.value = "Impossible de se connecter. Vérifiez votre connexion.";
    }
    console.error("[handleLogin] Détails de l'erreur:", error.response?.data || error.message);
  }
}
</script>

<style scoped>
/* Vos styles identiques au code initial */
.auth-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.auth-card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.auth-card header {
  background: var(--primary-focus);
  padding: 2rem;
  text-align: center;
}

.auth-card header h1 {
  color: var(--primary);
  margin: 0;
  margin-bottom: 0.5rem;
}

.auth-card header p {
  color: var(--text-light);
  margin: 0;
}

.auth-form {
  padding: 2rem;
}

.notification-banner {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 1rem;
  margin: 1rem 2rem 0;
  border: 1px solid #fca5a5;
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-banner p {
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #b91c1c;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: var(--transition);
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-focus);
  outline: none;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  color: var(--text-light);
  cursor: pointer;
}

.toggle-password:hover {
  color: var(--primary);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
  cursor: pointer;
}

.forgot-password {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.auth-card footer {
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid var(--border);
}

.auth-card footer p {
  margin: 0;
  color: var(--text);
}

.auth-card footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-card footer a:hover {
  text-decoration: underline;
}
</style>