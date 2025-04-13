<template>
    <div class="auth-container">
      <article class="auth-card">
        <header>
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
        </header>
  
        <!-- Bandeau de notification -->
        <div v-if="notification" class="notification-banner">
          <p>{{ notification }}</p>
          <button class="close-btn" @click="closeNotification">×</button>
        </div>
  
        <form @submit.prevent="handleForgotPassword" class="auth-form">
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
          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            Envoyer le lien
          </button>
        </form>
  
        <footer>
          <p>
            Retour à la <RouterLink to="/login">Connexion</RouterLink>
          </p>
        </footer>
      </article>
    </div>
  </template>
  
  <script setup lang="ts">
  /**
   * @fileoverview Page de demande de réinitialisation du mot de passe.
   * L'utilisateur saisit son email et, si cet email est enregistré, un lien de réinitialisation lui est envoyé.
   */
  
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  const email = ref('');
  const notification = ref('');
  const router = useRouter();
  
  /**
   * Vérifie que le champ email n'est pas vide.
   */
  const isFormValid = computed(() => {
    return email.value.trim() !== '';
  });
  
  /**
   * Ferme le bandeau de notification.
   */
  function closeNotification(): void {
    notification.value = '';
  }
  
  /**
   * Gère la demande de réinitialisation du mot de passe en appelant l'API backend.
   * Le message renvoyé est générique pour éviter toute divulgation d'information sur l'existence de l'email.
   */
  async function handleForgotPassword(): Promise<void> {
    try {
      const response = await axios.post('http://localhost:5000/utilisateurs/forgot-password', { email: email.value });
      notification.value = response.data.message || "Si cet email est enregistré, vous recevrez un lien de réinitialisation.";
    } catch (error: any) {
      console.error("Erreur lors de la demande de réinitialisation :", error.response?.data || error.message);
      notification.value = "Une erreur s'est produite. Veuillez réessayer.";
    }
  }
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
  
  .auth-card footer a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
  }
  
  .auth-card footer a:hover {
    text-decoration: underline;
  }
  
  /* Notification Banner */
  .notification-banner {
    background-color: #fef2f2; /* Rouge clair */
    color: #b91c1c;           /* Rouge sombre */
    padding: 1rem;
    margin: 1rem 2rem 0;
    border: 1px solid #fca5a5; /* Rouge vif */
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
  </style>  