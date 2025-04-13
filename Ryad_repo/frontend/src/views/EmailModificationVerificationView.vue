<template>
  <div class="auth-container">
    <article class="auth-card">
      <header>
        <h1>Confirmation du changement d'email</h1>
        <p>
          Un code de confirmation a été envoyé à votre
          <strong>ancienne adresse :</strong>
          <strong>{{ oldEmail }}</strong>.
          <br />
          Veuillez saisir ce code ci-dessous pour valider votre nouvelle adresse.
        </p>
      </header>

      <!-- Bandeau de notification (en cas d'erreur) -->
      <div v-if="notification" class="notification-banner">
        <p>{{ notification }}</p>
        <button class="close-btn" @click="closeNotification">×</button>
      </div>

      <form @submit.prevent="handleConfirm" class="auth-form">
        <!-- Champ caché pour l'ID utilisateur (nécessaire au backend) -->
        <input
          type="hidden"
          id="userId"
          v-model="userId"
        />

        <!-- Ancienne adresse email (désactivée) -->
        <div class="form-group">
          <label for="oldEmail">Ancienne adresse email</label>
          <input
            type="email"
            id="oldEmail"
            v-model="oldEmail"
            disabled
          />
        </div>

        <!-- Nouvelle adresse email (désactivée) -->
        <div class="form-group">
          <label for="newEmail">Nouvelle adresse email</label>
          <input
            type="email"
            id="newEmail"
            :value="newEmail"
            disabled
          />
        </div>

        <!-- Champ pour le code de confirmation -->
        <div class="form-group">
          <label for="code">Code de confirmation</label>
          <input
            type="text"
            id="code"
            v-model="code"
            required
            placeholder="Code à 6 chiffres"
          />
        </div>

        <!-- Bouton de confirmation -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="!isFormValid"
        >
          Confirmer
        </button>
      </form>
    </article>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview
 * Composant pour confirmer le changement d'email d'un utilisateur.
 * - L'utilisateur est redirigé ici après avoir saisi une nouvelle adresse
 *   et cliqué sur « Enregistrer » dans la page de profil.
 * - On récupère depuis la query string :
 *   * userId : l'ID de l'utilisateur
 *   * oldEmail : l'ancienne adresse
 *   * newEmail : la future adresse
 * - L'utilisateur doit alors renseigner le code MFA envoyé à son ancienne adresse.
 * - Le code est validé en appelant /utilisateurs/confirm-email-change dans le backend.
 * - En cas de succès, on redirige l'utilisateur vers sa page Profil.
 * - En cas d'erreur, on affiche un message dans un bandeau de notification.
 */

import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/axios-config';

// Logs de debug pour chaque étape
console.log("[EmailModificationVerificationView] Montage du composant.");

// On initialise les refs (variables réactives)
const userId = ref<string>('');
const oldEmail = ref<string>('');
const newEmail = ref<string>('');   // Ajout pour afficher la nouvelle adresse
const code = ref<string>('');
const notification = ref<string>(''); // Bandeau de notification (erreur, etc.)

// On utilise useRouter et useRoute pour naviguer et lire les query strings
const router = useRouter();
const route = useRoute();

// Lecture des query strings transmises depuis le Profil
if (route.query.userId) {
  userId.value = String(route.query.userId);
  console.log("[EmailModificationVerificationView] userId récupéré :", userId.value);
}
if (route.query.oldEmail) {
  oldEmail.value = String(route.query.oldEmail);
  console.log("[EmailModificationVerificationView] oldEmail récupéré :", oldEmail.value);
}
// Lecture du nouveau mail (AJOUT)
if (route.query.newEmail) {
  newEmail.value = String(route.query.newEmail);
  console.log("[EmailModificationVerificationView] newEmail récupéré :", newEmail.value);
}

/**
 * Calcule si le bouton Confirmer doit être activé.
 * On exige que le code MFA soit un code de 6 caractères (modifiable si nécessaire).
 */
const isFormValid = computed<boolean>(() => {
  return code.value.trim().length === 6;
});

/**
 * Ferme le bandeau de notification
 */
function closeNotification(): void {
  notification.value = '';
}

/**
 * handleConfirm()
 * - Vérifie le code de confirmation saisi
 * - Appelle /utilisateurs/confirm-email-change
 * - Redirige vers la page profil en cas de succès
 * - Affiche un message d'erreur dans le bandeau en cas d'échec
 */
async function handleConfirm(): Promise<void> {
  console.log("[handleConfirm] Début de la confirmation du changement d'email.");
  console.log("[handleConfirm] userId =", userId.value, "| code =", code.value);

  // On réinitialise le bandeau d'erreur avant l'appel
  notification.value = '';

  try {
    console.log("[handleConfirm] Envoi de la requête POST /utilisateurs/confirm-email-change ...");
    const response = await axios.post('/utilisateurs/confirm-email-change', {
      userId: userId.value,
      verificationCode: code.value
    });
    console.log("[handleConfirm] Réponse du serveur :", response.data);

    // En cas de succès, on redirige vers la page Profil
    console.log("[handleConfirm] Changement d'email confirmé, redirection vers 'profile'.");
    router.push({ name: 'profile' });
  } catch (error: any) {
    console.error("[handleConfirm] Erreur lors de la confirmation :", error.response?.data || error.message);
    notification.value = "Le code est incorrect ou une erreur est survenue. Veuillez réessayer.";
  }
}
</script>

<style scoped>
/* Styles d'apparence identiques à votre version actuelle */

/* Conteneur principal */
.auth-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Carte principale */
.auth-card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* En-tête de la carte */
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

/* Formulaire */
.auth-form {
  padding: 2rem;
}

/* Bandeau de notification d'erreur */
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

/* Groupes de champs du formulaire */
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

/* Bouton de soumission */
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
</style>