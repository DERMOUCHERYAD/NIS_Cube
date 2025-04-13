<template>
  <div class="auth-container">
    <article class="auth-card">
      <header>
        <h1>Créer un compte</h1>
        <p>Rejoignez-nous pour commencer votre évaluation</p>
      </header>

      <!-- Bandeau de notification (erreur ou info) -->
      <div v-if="notification" class="notification-banner">
        <p>{{ notification }}</p>
        <button class="close-btn" @click="closeNotification">×</button>
      </div>

      <!-- Formulaire d'inscription -->
      <form ref="registerForm" @submit.prevent="handleRegister" class="auth-form">
        <!-- Champ : Nom complet -->
        <div class="form-group">
          <label for="name">Nom complet</label>
          <input 
            type="text"
            id="name"
            v-model="username"
            required
            minlength="2"
            placeholder="Votre nom"
          />
        </div>

        <!-- Champ : Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="votre@email.com"
            pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
          />
        </div>

        <!-- Champ : Mot de passe -->
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              minlength="6"
              placeholder="Choisissez un mot de passe"
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
          <!-- Indicateur de robustesse du mot de passe -->
          <div class="password-strength" v-if="password">
            <div class="strength-bar" :style="strengthBarStyle"></div>
            <small>{{ strengthText }}</small>
          </div>
        </div>

        <!-- Champ : Conditions d'utilisation -->
        <div class="form-group">
          <label class="terms">
            <input type="checkbox" v-model="acceptTerms" required />
            <span>
              J'accepte les <a href="#">conditions d'utilisation</a> et la 
              <a href="#">politique de confidentialité</a>
            </span>
          </label>
        </div>

        <!-- Bouton d'envoi -->
        <button type="submit" class="submit-btn">
          <UserPlus class="icon" />
          Créer mon compte
        </button>
      </form>

      <footer>
        <p>
          Déjà inscrit ? <RouterLink to="/login">Se connecter</RouterLink>
        </p>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview Composant Vue pour l'inscription d'un nouvel utilisateur,
 * avec pattern strict sur l'email pour bloquer "abdouseba420@gmail" (sans .com).
 * On combine la validation HTML5 + pattern + vérification JS pour éviter les emails invalides.
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { UserPlus, Eye, EyeOff } from 'lucide-vue-next';

const registerForm = ref<HTMLFormElement | null>(null);

const username = ref('');
const email = ref('');
const password = ref('');
const acceptTerms = ref(false);
const showPassword = ref(false);

/**
 * Variable pour stocker les messages de notification (erreur, avertissement, etc.).
 */
const notification = ref('');

/**
 * Affiche un message dans le bandeau de notification.
 * @param {string} message - Le message à afficher.
 */
function showNotification(message: string) {
  notification.value = message;
}

/**
 * Ferme (efface) le message de notification.
 */
function closeNotification() {
  notification.value = '';
}

const router = useRouter();

/**
 * Calcule la robustesse du mot de passe de manière plus exigeante.
 * Critères cumulés :
 * - longueur >= 6, >= 8, >= 10, >= 12
 * - présence de minuscules, majuscules, chiffres, caractères spéciaux
 */
function calculatePasswordStrength(pwd: string): number {
  let score = 0;
  // Longueur
  if (pwd.length >= 6) score += 10;
  if (pwd.length >= 8) score += 10;
  if (pwd.length >= 10) score += 10;
  if (pwd.length >= 12) score += 10;

  // Diversité de caractères
  if (/[a-z]/.test(pwd)) score += 10;
  if (/[A-Z]/.test(pwd)) score += 10;
  if (/\d/.test(pwd))   score += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 10;

  return score;
}

/**
 * Barre de progression pour la robustesse du mot de passe.
 */
const strengthBarStyle = computed(() => {
  const score = calculatePasswordStrength(password.value);
  let color = '#ef4444'; // rouge par défaut

  if (score > 30 && score <= 60) color = '#f59e0b'; // orange
  if (score > 60 && score <= 90) color = '#10b981'; // vert moyen
  if (score > 90) color = '#22c55e'; // vert clair

  return {
    width: `${score}%`,
    backgroundColor: password.value.length === 0 ? 'transparent' : color
  };
});

/**
 * Texte indiquant la force du mot de passe.
 */
const strengthText = computed(() => {
  const score = calculatePasswordStrength(password.value);
  if (password.value.length === 0) return '';
  if (score <= 30) return 'Faible';
  if (score <= 60) return 'Moyen';
  if (score <= 90) return 'Bon';
  return 'Excellent';
});

/**
 * Bascule l'affichage du mot de passe.
 */
function togglePassword(): void {
  showPassword.value = !showPassword.value;
}

/**
 * Vérifie manuellement si l'email matche notre pattern strict (en plus du pattern HTML5).
 */
function isEmailValid(emailValue: string): boolean {
  const strictEmailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return strictEmailRegex.test(emailValue);
}

/**
 * Gère la soumission du formulaire.
 */
async function handleRegister(): Promise<void> {
  // 1. Vérifier d'abord la validité globale du formulaire (HTML5).
  const formEl = registerForm.value;
  if (formEl && !formEl.checkValidity()) {
    formEl.reportValidity(); // Force l'affichage des messages HTML5
    return;
  }

  // 2. Vérification JS : email doit matcher strictEmailRegex
  if (!isEmailValid(email.value)) {
    showNotification("Veuillez saisir un email valide (ex: exemple@domaine.com).");
    return;
  }

  // 3. Logique spécifique : Vérifier si l'email existe déjà, etc.
  try {
    const checkResponse = await axios.get(
      `http://localhost:5000/utilisateurs/check?email=${encodeURIComponent(email.value)}`
    );
    const data = checkResponse.data;

    // Email déjà utilisé et vérifié
    if (data.exists && data.is_verified) {
      showNotification("Cet email est déjà utilisé.");
      return;
    }

    // Email existe mais pas vérifié => renvoi du code
    if (data.exists && !data.is_verified) {
      await axios.post('http://localhost:5000/utilisateurs/resend', { email: email.value });
      router.push({ name: 'verify', query: { email: email.value } });
      return;
    }

    // Email n'existe pas => inscription
    await axios.post('http://localhost:5000/utilisateurs/register', {
      username: username.value,
      email: email.value,
      password: password.value
    });
    router.push({ name: 'verify', query: { email: email.value } });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error.response?.data || error.message);
    showNotification("Erreur lors de l'inscription. Veuillez réessayer.");
  }
}
</script>

<style scoped>
/* Même design global, on ajoute un style pour le bandeau de notification. */

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

/* ----------- Notification Banner ----------- */
.notification-banner {
  background-color: #fef2f2; /* Rouge clair */
  color: #b91c1c; /* Rouge sombre */
  padding: 1rem;
  margin: 1rem 2rem 0;
  border: 1px solid #fca5a5; /* Rouge plus vif */
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

/* ------------------------------------------ */

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
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

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: var(--primary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.password-strength small {
  display: block;
  margin-top: 0.25rem;
  color: var(--text-light);
  font-size: 0.75rem;
}

.terms {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  font-size: 0.875rem;
}

.terms a {
  color: var(--primary);
  text-decoration: none;
}

.terms a:hover {
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

.submit-btn:hover {
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
