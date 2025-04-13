<template>
  <div class="profile-container">
    <!-- Indicateur de chargement -->
    <div v-if="isLoading">Chargement des données utilisateur...</div>
    <div v-else>
      <article class="profile-card">
        <header class="profile-header">
          <h1>
            <User class="header-icon" />
            Mon Profil
          </h1>
          <p>Gérez vos informations personnelles et vos préférences</p>
        </header>

        <div class="profile-content">
          <!-- Formulaire de modification du profil -->
          <form @submit.prevent="saveProfile" class="profile-form">
            <!-- Section Informations personnelles -->
            <section class="profile-section">
              <h2>
                <UserCircle class="icon" />
                Informations personnelles
              </h2>

              <!-- Nom d'utilisateur -->
              <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" v-model="profile.username" placeholder="Votre nom d'utilisateur" />
                <small v-if="errors.username" class="error-text">
                  {{ errors.username }}
                </small>
              </div>

              <!-- Adresse e-mail -->
              <div class="form-group">
                <label for="email">Adresse e-mail</label>
                <input type="email" id="email" v-model="profile.email" placeholder="Votre adresse e-mail" />
                <small v-if="errors.email" class="error-text">
                  {{ errors.email }}
                </small>
                <!-- Notification si l'email a été modifié -->
                <small v-if="emailChanged" class="info-text">
                  <Info class="small-icon" />
                  Une confirmation sera envoyée à votre ancienne adresse e-mail
                  pour valider le changement.
                </small>
              </div>
            </section>

            <!-- Section Sécurité pour le changement de mot de passe -->
            <section class="profile-section">
              <h2>
                <Lock class="icon" />
                Sécurité
              </h2>

              <!-- Mot de passe actuel -->
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <div class="password-input">
                  <input :type="showCurrentPassword ? 'text' : 'password'" id="currentPassword"
                    v-model="profile.currentPassword" placeholder="Entrez votre mot de passe actuel" />
                  <button type="button" class="toggle-password" @click="toggle('current')">
                    <Eye v-if="!showCurrentPassword" class="icon" />
                    <EyeOff v-else class="icon" />
                  </button>
                </div>
                <small v-if="errors.currentPassword" class="error-text">
                  {{ errors.currentPassword }}
                </small>
              </div>

              <!-- Nouveau mot de passe -->
              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <div class="password-input">
                  <input :type="showNewPassword ? 'text' : 'password'" id="newPassword" v-model="profile.newPassword"
                    placeholder="Entrez un nouveau mot de passe" />
                  <button type="button" class="toggle-password" @click="toggle('new')">
                    <Eye v-if="!showNewPassword" class="icon" />
                    <EyeOff v-else class="icon" />
                  </button>
                </div>
                <small v-if="errors.newPassword" class="error-text">
                  {{ errors.newPassword }}
                </small>
                <!-- Barre de force du mot de passe -->
                <div v-if="profile.newPassword" class="password-strength">
                  <div class="strength-bar" :style="strengthBarStyle"></div>
                  <small>{{ strengthText }}</small>
                </div>
              </div>

              <!-- Confirmation du nouveau mot de passe -->
              <div class="form-group">
                <label for="confirmPassword">Confirmer le mot de passe</label>
                <div class="password-input">
                  <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                    v-model="profile.confirmPassword" placeholder="Confirmez votre nouveau mot de passe" />
                  <button type="button" class="toggle-password" @click="toggle('confirm')">
                    <Eye v-if="!showConfirmPassword" class="icon" />
                    <EyeOff v-else class="icon" />
                  </button>
                </div>
                <small v-if="errors.confirmPassword" class="error-text">
                  {{ errors.confirmPassword }}
                </small>
              </div>
            </section>

            <!-- Actions du formulaire -->
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="resetForm">
                <XCircle class="icon" />
                Annuler
              </button>
              <button type="submit" class="save-btn" :disabled="!isFormValid || isSaving">
                <Save class="icon" />
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>

          <!-- Section Zone de Danger (pour suppression du compte) -->
          <section class="profile-section danger-zone">
            <h2>
              <AlertTriangle class="icon" />
              Zone de danger
            </h2>
            <div class="danger-actions">
              <button class="danger" @click="showDeleteModal = true">
                <Trash2 class="icon" />
                Supprimer mon compte
              </button>
            </div>
          </section>
        </div>
      </article>

      <!-- Composant de notification -->
      <div v-if="notification.show" class="notification" :class="notification.type">
        <div class="notification-content">
          <CheckCircle2 v-if="notification.type === 'success'" class="icon" />
          <AlertCircle v-else class="icon" />
          <p>{{ notification.message }}</p>
        </div>
        <button class="close-notification" @click="notification.show = false">
          ×
        </button>
      </div>

      <!-- Modal de confirmation de suppression de compte -->
      <DeleteAccountModal :visible="showDeleteModal" @confirm="deleteAccount" @cancel="showDeleteModal = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  User,
  UserCircle,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  XCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-vue-next';
import axios from '@/axios-config';
import DeleteAccountModal from '../components/DeleteAccountModal.vue';

/**
 * @typedef {Object} Profile
 * @property {string} username - Nom d'utilisateur
 * @property {string} email - Adresse email
 * @property {string} currentPassword - Mot de passe actuel (nécessaire pour valider un changement)
 * @property {string} newPassword - Nouveau mot de passe souhaité
 * @property {string} confirmPassword - Confirmation du nouveau mot de passe
 */

const router = useRouter();

// État initial du profil
const initialProfile = {
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

// État réactif du profil
const profile = reactive({ ...initialProfile });

// Erreurs de validation
const errors = reactive({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Contrôle de l'affichage des champs de mot de passe
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Indicateurs de chargement et sauvegarde
const isSaving = ref(false);
const isLoading = ref(false);

// Notification (bandeau) pour informer l'utilisateur
const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

// Permet d'afficher/masquer le modal de suppression
const showDeleteModal = ref(false);

// Indique si l'email a été modifié
const emailChanged = computed(() => profile.email !== initialProfile.email);

/**
 * Validation globale du formulaire
 */
const isFormValid = computed(() => {
  const hasChanges = (
    profile.username !== initialProfile.username ||
    profile.email !== initialProfile.email ||
    profile.newPassword
  );

  const hasNoErrors = (
    !errors.username &&
    !errors.email &&
    !errors.currentPassword &&
    !errors.newPassword &&
    !errors.confirmPassword
  );

  // Si un nouveau mot de passe est renseigné, vérifier que le mot de passe actuel est fourni et que la confirmation correspond
  const passwordValid = (
    !profile.newPassword ||
    (profile.newPassword && profile.confirmPassword === profile.newPassword && profile.currentPassword)
  );

  return Boolean(hasChanges && hasNoErrors && passwordValid);
});

/**
 * Calcule la force du nouveau mot de passe
 */
function calculatePasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  let strength = 0;
  if (pwd.length >= 8) strength += 25;
  if (pwd.match(/[a-z]/)) strength += 25;
  if (pwd.match(/[A-Z]/)) strength += 25;
  if (pwd.match(/[0-9]/)) strength += 25;
  return strength;
}

/**
 * Style de la barre de force
 */
const strengthBarStyle = computed(() => {
  const val = calculatePasswordStrength(profile.newPassword);
  let color = 'transparent';
  if (val <= 25 && val > 0) color = '#ef4444';
  else if (val <= 50) color = '#f59e0b';
  else if (val <= 75) color = '#10b981';
  else if (val <= 100) color = '#22c55e';

  return {
    width: `${val}%`,
    backgroundColor: color
  };
});

/**
 * Texte de la force du mot de passe
 */
const strengthText = computed(() => {
  const val = calculatePasswordStrength(profile.newPassword);
  if (!profile.newPassword) return '';
  if (val <= 25) return 'Faible';
  if (val <= 50) return 'Moyen';
  if (val <= 75) return 'Bon';
  return 'Excellent';
});

/**
 * Charge les données utilisateur depuis l'API
 */
async function loadUserData(): Promise<void> {
  console.log("[loadUserData] Début du chargement de l'utilisateur.");
  isLoading.value = true;

  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error("[loadUserData] Aucun userId dans le localStorage.");
      notification.message = "ID utilisateur manquant. Veuillez vous reconnecter.";
      notification.type = 'error';
      notification.show = true;
      router.push({ name: 'login' });
      return;
    }

    console.log("[loadUserData] GET /utilisateurs/" + userId);
    const response = await axios.get(`/utilisateurs/${userId}`);
    console.log("[loadUserData] Données renvoyées :", response.data);

    profile.username = response.data.username;
    profile.email = response.data.email;

    // Met à jour le snapshot initial
    initialProfile.username = response.data.username;
    initialProfile.email = response.data.email;
  } catch (error) {
    console.error("[loadUserData] Erreur lors du chargement :", error);
    notification.message = "Erreur lors du chargement du profil. Reconnectez-vous.";
    notification.type = 'error';
    notification.show = true;
    router.push({ name: 'login' });
  } finally {
    isLoading.value = false;
  }
}

/**
 * Enregistre le profil en appelant le backend
 */
async function saveProfile(): Promise<void> {
  console.log("[saveProfile] Début de l'enregistrement du profil.");

  if (!validateForm()) {
    console.error("[saveProfile] Validation échouée:", errors);
    return;
  }

  isSaving.value = true;

  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error("[saveProfile] userId introuvable dans localStorage.");
      notification.message = "ID utilisateur manquant. Reconnectez-vous.";
      notification.type = 'error';
      notification.show = true;
      router.push({ name: 'login' });
      return;
    }

    // Construire la payload à envoyer
    const payload: { username: string; email: string; newPassword?: string; currentPassword?: string } = {
      username: profile.username,
      email: profile.email
    };

    if (profile.newPassword) {
      if (!profile.currentPassword) {
        notification.message = "Veuillez renseigner votre mot de passe actuel pour changer votre mot de passe.";
        notification.type = 'error';
        notification.show = true;
        isSaving.value = false;
        return;
      }
      payload.newPassword = profile.newPassword;
      payload.currentPassword = profile.currentPassword;
      console.log("[saveProfile] Nouveau mot de passe et mot de passe actuel ajoutés à la payload.");
    }

    console.log("[saveProfile] PUT /utilisateurs/" + userId, payload);
    const response = await axios.put(`/utilisateurs/${userId}`, payload);
    console.log("[saveProfile] Réponse du serveur:", response.data);

    if (response.data.emailChanged) {
      console.log("[saveProfile] emailChanged = true, redirection vers 'emailConfirmation'.");
      router.push({
        name: 'emailConfirmation',
        query: {
          userId: userId,
          oldEmail: initialProfile.email,
          newEmail: profile.email
        }
      });
    } else {
      notification.message = "Modifications enregistrées avec succès.";
      notification.type = 'success';
      notification.show = true;

      // Met à jour le snapshot initial
      initialProfile.username = profile.username;
      initialProfile.email = profile.email;
    }

    // Réinitialise les champs de mot de passe
    profile.currentPassword = '';
    profile.newPassword = '';
    profile.confirmPassword = '';

  } catch (error: any) {
    console.error("[saveProfile] Erreur lors de la mise à jour :", error);

    // Vérifier la réponse du serveur
    if (error.response?.status === 400) {
      const serverMsg = error.response.data?.message || '';
      // Si le message du serveur mentionne un mot de passe actuel incorrect
      if (serverMsg.includes("Mot de passe actuel incorrect")) {
        notification.message = "Votre mot de passe actuel est incorrect. Veuillez réessayer.";
      } else {
        notification.message = serverMsg || "Une erreur est survenue. Veuillez réessayer.";
      }
    } else {
      notification.message = "Erreur lors de la sauvegarde.";
    }

    notification.type = 'error';
    notification.show = true;
  } finally {
    isSaving.value = false;
  }
}

/**
 * Valide le formulaire
 */
function validateForm(): boolean {
  console.log("[validateForm] Validation du formulaire.");
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });

  // Vérifie le nom d'utilisateur
  if (profile.username.trim().length < 3) {
    errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    console.error("[validateForm] Nom d'utilisateur trop court.");
  }

  // Vérifie l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profile.email)) {
    errors.email = "Veuillez entrer une adresse e-mail valide";
    console.error("[validateForm] Email invalide.");
  }

  // Vérifie les champs de mot de passe en cas de changement
  if (profile.newPassword) {
    if (!profile.currentPassword) {
      errors.currentPassword = "Veuillez entrer votre mot de passe actuel";
      console.error("[validateForm] currentPassword manquant pour changement PW.");
    }
    if (profile.newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
      console.error("[validateForm] newPassword trop court.");
    }
    if (profile.newPassword !== profile.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
      console.error("[validateForm] confirmPassword diffère de newPassword.");
    }
  }

  const anyError = Object.values(errors).some(err => err);
  if (anyError) {
    console.log("[validateForm] Formulaire invalide");
    return false;
  }
  console.log("[validateForm] Formulaire valide");
  return true;
}

/**
 * Réinitialise le formulaire
 */
function resetForm() {
  console.log("[resetForm] Remise à zéro du formulaire.");
  Object.assign(profile, initialProfile);
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
}

/**
 * Bascule l'affichage d'un champ de mot de passe
 */
function toggle(type: 'current' | 'new' | 'confirm') {
  console.log(`[toggle] Basculement du champ password : ${type}`);
  if (type === 'current') {
    showCurrentPassword.value = !showCurrentPassword.value;
  } else if (type === 'new') {
    showNewPassword.value = !showNewPassword.value;
  } else {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
}

/**
 * deleteAccount()
 * Supprime le compte de l'utilisateur dans la base
 * puis vide le localStorage et redirige vers '/'.
 */
async function deleteAccount() {
  console.log("[deleteAccount] Début suppression du compte en BDD.");
  showDeleteModal.value = false; // Ferme le modal

  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      notification.type = 'error';
      notification.message = "ID utilisateur introuvable. Veuillez vous reconnecter.";
      notification.show = true;
      return;
    }

    // Requête DELETE vers votre API
    console.log(`[deleteAccount] DELETE /utilisateurs/${userId}`);
    await axios.delete(`/utilisateurs/${userId}`);

    // Suppression réussie, on nettoie le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // Notification
    notification.type = 'success';
    notification.message = "Votre compte a été supprimé avec succès.";
    notification.show = true;

    // Redirection vers la page d'accueil (ou /login, selon votre choix)
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (error) {
    console.error("[deleteAccount] Erreur suppression compte:", error);
    notification.type = 'error';
    notification.message = "Une erreur est survenue lors de la suppression du compte.";
    notification.show = true;
  }
}

// Chargement initial des données utilisateur
onMounted(() => {
  console.log("[onMounted] Chargement initial du profil...");
  loadUserData();
});
</script>

<style scoped>
/* Conservez tous vos styles existants (inchangés) */
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.profile-header {
  background: var(--primary-focus);
  padding: 2rem;
  text-align: center;
}

.profile-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--primary);
  margin: 0 0 0.5rem;
}

.profile-header p {
  color: var(--text-light);
  margin: 0;
}

.header-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.profile-content {
  padding: 2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  color: var(--text);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
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

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.small-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn,
.cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.save-btn {
  background: var(--primary);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--background);
  color: var(--text);
}

.cancel-btn:hover {
  background: var(--border);
}

.danger-zone {
  margin-top: 3rem;
  padding-top: 2rem;
}

.danger-zone h2 {
  color: #ef4444;
}

.danger-actions button.danger {
  background: #ef4444;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.danger-actions button.danger:hover {
  background: #dc2626;
}

.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification p {
  margin: 0;
  color: var(--text);
}

.notification.success {
  border-left: 4px solid #22c55e;
}

.notification.success .icon {
  color: #22c55e;
}

.notification.error {
  border-left: 4px solid #ef4444;
}

.notification.error .icon {
  color: #ef4444;
}

.close-notification {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .profile-header {
    padding: 1.5rem;
  }

  .profile-content {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }

  .notification {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
}
</style>