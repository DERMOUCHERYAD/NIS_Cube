<template>
    <div class="auth-container">
        <article class="auth-card">
            <header>
                <h1>Réactivation du compte</h1>
                <p>Entrez le code de réactivation que vous avez reçu par email.</p>
            </header>

            <!-- Bandeau de notification (pour afficher les erreurs ou infos) -->
            <div v-if="notification" class="notification-banner">
                <p>{{ notification }}</p>
                <button class="close-btn" @click="closeNotification">×</button>
            </div>

            <form @submit.prevent="handleReactivation" class="auth-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" required placeholder="votre@email.com" />
                </div>

                <div class="form-group">
                    <label for="code">Code de réactivation</label>
                    <input type="text" id="code" v-model="code" required placeholder="Code à 6 chiffres" />
                </div>

                <button type="submit" class="submit-btn" :disabled="!isFormValid">
                    Réactiver
                </button>
            </form>

            <footer>
                <p>
                    Vous n'avez pas reçu le code ?
                    <button class="link-like" @click.prevent="resendReactivation">
                        Renvoyez-le
                    </button>.
                </p>
            </footer>
        </article>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const email = ref('');
const code = ref('');
const notification = ref('');

const router = useRouter();
const route = useRoute();

/**
 * Préremplir l'email s'il est passé dans la query string (facultatif).
 */
if (route.query.email) {
    email.value = String(route.query.email);
}

/**
 * Le formulaire est valide si l'email et le code sont non vides.
 */
const isFormValid = computed(() => {
    return email.value.trim() !== '' && code.value.trim().length === 6;
});

/**
 * Fermer le bandeau de notification.
 */
function closeNotification(): void {
    notification.value = '';
}

/**
 * Gère la réactivation : on envoie email + code au backend.
 */
async function handleReactivation(): Promise<void> {
    try {
        const response = await axios.post('http://localhost:5000/utilisateurs/verify-reactivation', {
            email: email.value,
            reactivationCode: code.value
        });
        notification.value = response.data.message || "Compte réactivé avec succès.";
        // Redirection après 2 secondes vers la connexion
        setTimeout(() => {
            router.push({ name: 'login' });
        }, 2000);
    } catch (error: any) {
        console.error("Erreur lors de la réactivation :", error.response?.data || error.message);
        notification.value = error.response?.data?.message || "Erreur lors de la réactivation.";
    }
}

/**
 * Permet de renvoyer le code de réactivation si besoin.
 */
async function resendReactivation(): Promise<void> {
    try {
        const response = await axios.post('http://localhost:5000/utilisateurs/resend-reactivation', {
            email: email.value
        });
        notification.value = response.data.message || "Nouveau code envoyé.";
    } catch (error: any) {
        console.error("Erreur lors du renvoi du code :", error.response?.data || error.message);
        notification.value = error.response?.data?.message || "Erreur lors du renvoi du code.";
    }
}
</script>

<style scoped>
/* Styles similaires à vos autres pages d'auth */
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

.link-like {
    background: none;
    border: none;
    color: var(--primary);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
}

/* Bandeau de notification */
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
</style>