<template>
    <div class="auth-container">
      <article class="auth-card">
        <header>
          <h1>Réinitialiser le mot de passe</h1>
          <p>Entrez votre nouveau mot de passe</p>
        </header>
  
        <!-- Bandeau de notification -->
        <div v-if="notification" class="notification-banner">
          <p>{{ notification }}</p>
          <button class="close-btn" @click="closeNotification">×</button>
        </div>
  
        <form ref="resetForm" @submit.prevent="handleResetPassword" class="auth-form">
          <div class="form-group">
            <label for="newPassword">Nouveau mot de passe</label>
            <input 
              :type="showPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              required
              minlength="6"
              placeholder="Votre nouveau mot de passe"
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
          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            Réinitialiser
          </button>
        </form>
  
        <footer>
          <p>
            Retour à <RouterLink to="/login">la connexion</RouterLink>
          </p>
        </footer>
      </article>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import axios from 'axios';
  import { Eye, EyeOff } from 'lucide-vue-next';
  
  /**
   * @fileoverview Page de réinitialisation du mot de passe.
   * L'utilisateur arrive via un lien contenant token et email, saisit son nouveau mot de passe, et le backend effectue la réinitialisation.
   */
  
  const router = useRouter();
  const route = useRoute();
  
  const newPassword = ref('');
  const showPassword = ref(false);
  const notification = ref('');
  
  // Récupération du token et de l'email depuis la query string
  const token = ref('');
  const email = ref('');
  
  onMounted(() => {
    if (route.query.token && route.query.email) {
      token.value = String(route.query.token);
      email.value = String(route.query.email);
    }
  });
  
  /**
   * Formulaire valide si le nouveau mot de passe est d'au moins 6 caractères.
   */
  const isFormValid = computed(() => {
    return newPassword.value.trim().length >= 6;
  });
  
  /**
   * Bascule l'affichage du mot de passe.
   */
  function togglePassword(): void {
    showPassword.value = !showPassword.value;
  }
  
  /**
   * Ferme le bandeau de notification.
   */
  function closeNotification(): void {
    notification.value = '';
  }
  
  /**
   * Gère la réinitialisation du mot de passe en appelant l'API backend.
   */
  async function handleResetPassword(): Promise<void> {
    try {
      const response = await axios.post('http://localhost:5000/utilisateurs/reset-password', {
        email: email.value,
        token: token.value,
        newPassword: newPassword.value
      });
      notification.value = response.data.message || "Mot de passe réinitialisé avec succès.";
      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 2000);
    } catch (error: any) {
      console.error("Erreur lors de la réinitialisation :", error.response?.data || error.message);
      notification.value = error.response?.data?.message || "Erreur lors de la réinitialisation.";
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
  
  /* Notification Banner */
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
  /* End Notification Banner */
  
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
  </style>  