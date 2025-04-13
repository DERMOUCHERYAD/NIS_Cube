<template>
  <div class="auth-container">
    <article class="auth-card">
      <header>
        <h1>Vérification du compte</h1>
        <p>Entrez le code de vérification que vous avez reçu par email.</p>
      </header>

      <form @submit.prevent="handleVerify" class="auth-form">
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
          <label for="code">Code de vérification</label>
          <input 
            type="text"
            id="code"
            v-model="code"
            required
            placeholder="Code à 6 chiffres"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="!isFormValid">
          Vérifier
        </button>
      </form>

      <footer>
        <p>
          Si vous n'avez pas reçu le code,
          <!-- On transforme le lien en bouton pour pouvoir le désactiver -->
          <button
            class="link-like"
            :disabled="timeLeft > 0"
            @click="resendCode"
          >
            <!-- Texte dynamique : soit "renvoyez-le" soit "Renvoyez-le (XXs)" -->
            <span v-if="timeLeft === 0">renvoyez-le</span>
            <span v-else>renvoyez-le ({{ timeLeft }}s)</span>
          </button>
        </p>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

/**
 * Champs du formulaire
 */
const email = ref('');
const code = ref('');
const router = useRouter();
const route = useRoute();

/**
 * Récupère l'email depuis la query string, s'il existe
 */
if (route.query.email) {
  email.value = String(route.query.email);
}

/**
 * Indique si le formulaire est valide (email non vide, code de 6 caractères)
 */
const isFormValid = computed(() => {
  return email.value.trim() !== '' && code.value.trim().length === 6;
});

/**
 * Gère la vérification en appelant l'API backend.
 */
const handleVerify = async (): Promise<void> => {
  try {
    await axios.post('http://localhost:5000/utilisateurs/verify', {
      email: email.value,
      verificationCode: code.value
    });
    // En cas de succès, on redirige vers la page de connexion
    router.push({ name: 'login' });
  } catch (error: any) {
    console.error("Erreur lors de la vérification :", error.response?.data || error.message);
    // Ici, on peut afficher un message d'erreur (via un alert, un bandeau, etc.)
    alert("Le code est invalide ou une erreur est survenue.");
  }
};

/**
 * Gestion du cooldown pour renvoyer le code
 * -----------------------------------------
 * - timeLeft : nombre de secondes restantes avant de pouvoir renvoyer
 * - resendAvailableAt : timestamp (en ms) stocké dans localStorage
 */
const timeLeft = ref(0);
let timerInterval: any = null;

/**
 * Met à jour timeLeft en fonction de resendAvailableAt - Date.now().
 */
function updateTimeLeft() {
  const stored = localStorage.getItem('resendAvailableAt');
  if (!stored) {
    timeLeft.value = 0;
    return;
  }
  const resendAt = parseInt(stored, 10);
  const diff = resendAt - Date.now();
  timeLeft.value = diff > 0 ? Math.ceil(diff / 1000) : 0;
}

/**
 * Lance un cooldown de 60s, stocke la date dans localStorage
 */
function startCooldown() {
  const now = Date.now();
  const cooldownMs = 60000; // 60 secondes
  const nextAllowed = now + cooldownMs;
  localStorage.setItem('resendAvailableAt', nextAllowed.toString());
  updateTimeLeft(); // force le recalcul immédiat
}

/**
 * Appelé quand on clique sur "renvoyez-le"
 */
async function resendCode() {
  // Vérifie si on est encore en cooldown
  if (timeLeft.value > 0) {
    // Optionnel : message pour dire "Patientez encore Xs"
    alert(`Vous devez encore patienter ${timeLeft.value} secondes.`);
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/utilisateurs/resend', { email: email.value });
    console.log("Code renvoyé :", response.data.message);
    // Lance un nouveau cooldown de 60s
    startCooldown();
  } catch (error: any) {
    console.error("Erreur lors du renvoi du code :", error.response?.data || error.message);
    alert("Impossible de renvoyer le code. Vérifiez l'email ou réessayez plus tard.");
  }
}

/**
 * Lifecycle hooks pour initialiser le cooldown
 */
onMounted(() => {
  // 1) Mettre à jour timeLeft dès le montage
  updateTimeLeft();

  // 2) Mettre à jour chaque seconde
  timerInterval = setInterval(() => {
    updateTimeLeft();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
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

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
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

.auth-card footer a,
.link-like {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

.auth-card footer a:hover,
.link-like:hover {
  text-decoration: underline;
}

.link-like:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>