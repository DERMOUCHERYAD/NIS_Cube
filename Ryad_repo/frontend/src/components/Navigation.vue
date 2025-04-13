<template>
  <!-- La navigation s'affiche uniquement si isAuth est true -->
  <div v-if="isAuth">
    <nav class="modern-nav">
      <div class="nav-brand">
        <span class="brand-text">NIS CUBE</span>
      </div>
      <div class="nav-links">
        <router-link to="/dashboard" :class="{ active: $route.path === '/dashboard' }">
          <Home class="nav-icon" />
          <span>Tableau de bord</span>
        </router-link>
        <router-link to="/historique" :class="{ active: $route.path === '/historique' }">
          <History class="nav-icon" />
          <span>Historique</span>
        </router-link>
        <router-link to="/profile" :class="{ active: $route.path === '/profile' }">
          <User class="nav-icon" />
          <span>Mon Profil</span>
        </router-link>
        <router-link to="/a-propos" :class="{ active: $route.path === '/a-propos' }">
          <Info class="nav-icon" />
          <span>À propos</span>
        </router-link>
        <!-- Bouton Déconnexion -->
        <a href="#" class="logout" @click.prevent="logout">
          <LogOut class="nav-icon" />
          <span>Déconnexion</span>
        </a>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Home, Info, User, LogOut, History } from 'lucide-vue-next';

/**
 * Accès au routeur pour la navigation.
 */
const router = useRouter();
/**
 * Accès à la route courante pour détecter les changements de route.
 */
const route = useRoute();

/**
 * Variable réactive qui stocke l'état d'authentification.
 * Elle est initialisée à partir du localStorage.
 * @type {import('vue').Ref<boolean>}
 */
const isAuth = ref(!!localStorage.getItem('token') && !!localStorage.getItem('userId'));

/**
 * Watcher sur le chemin de la route pour mettre à jour isAuth.
 * Cela permet de détecter si le token et l'ID utilisateur ont été ajoutés (exemple après login)
 * ou supprimés (lors de la déconnexion) sans recharger la page.
 */
watch(
  () => route.path,
  () => {
    isAuth.value = !!localStorage.getItem('token') && !!localStorage.getItem('userId');
  }
);

/**
 * Fonction de déconnexion.
 * Supprime le token et l'ID utilisateur du localStorage et met isAuth à false,
 * puis redirige l'utilisateur vers la page de connexion.
 *
 * @returns {void}
 */
function logout(): void {
  console.log("[Navigation] Déconnexion demandée – suppression du token et de l'ID utilisateur.");
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  isAuth.value = false;
  router.push({ name: 'login' });
}
</script>

<style scoped>
.modern-nav {
  background: var(--card-background-color);
  border-radius: var(--border-radius);
  padding: 0.75rem 1.25rem;
  margin: 1rem 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--h1-color);
}

.brand-text {
  font-weight: 600;
  font-size: 1.125rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

/* Styles généraux pour les liens de navigation */
.nav-links a,
.nav-links router-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  color: var(--muted-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-links a:hover:not(.logout),
.nav-links router-link:hover {
  color: var(--primary);
  background: var(--primary-focus);
}

.nav-links a.active,
.nav-links router-link.active {
  color: var(--primary);
  background: var(--primary-focus);
}

/* Style spécifique pour le lien de déconnexion */
.nav-links a.logout:hover {
  background: #ef4444; /* Rouge utilisé pour l'affichage */
  color: white;
}

.nav-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .nav-links span {
    display: none;
  }

  .nav-links a,
  .nav-links router-link {
    padding: 0.5rem;
  }

  .nav-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>