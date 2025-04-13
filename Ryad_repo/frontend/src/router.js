/**
 * @fileoverview Configuration des routes de l'application Vue.
 * Chaque route est associée à son composant correspondant.
 */

import { createRouter, createWebHistory } from 'vue-router';

// Import des vues
import HomeView from './views/HomeView.vue';
import AboutView from './views/AboutView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import VerificationView from './views/VerificationView.vue';
import ForgotPasswordView from './views/ForgotPasswordView.vue';
import ResetPasswordView from './views/ResetPasswordView.vue';
import ProfileView from './views/ProfileView.vue';
import EvaluationView from './views/EvaluationView.vue';
import HistoryView from './views/HistoryView.vue';
import LandingView from './views/LandingView.vue';
import ReactivationView from './views/ReactivationView.vue';
import EmailModificationVerificationView from './views/EmailModificationVerificationView.vue';
import EvaluationQuestionView from './views/EvaluationQuestionView.vue'
const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { title: 'Accueil' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: HomeView,
    meta: { title: 'Tableau de bord', requiresAuth: true }
  },
  {
    path: '/a-propos',
    name: 'about',
    component: AboutView,
    meta: { title: 'À propos' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Connexion' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Inscription' }
  },
  {
    path: '/verify',
    name: 'verify',
    component: VerificationView,
    meta: { title: 'Vérification du compte' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { title: 'Mot de passe oublié' }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: { title: 'Réinitialiser le mot de passe' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: 'Profil', requiresAuth: true }
  },
  {
    path: '/evaluation',
    name: 'evaluation',
    component: EvaluationView,
    meta: { title: 'Évaluation' }
  },
  {
    path: '/historique',
    name: 'history',
    component: HistoryView,
    meta: { title: 'Historique' }
  },
  {
    path: '/reactivation',
    name: 'reactivation',
    component: ReactivationView,
    meta: { title: 'Réactivation du compte' }
  },
  {
    path: '/email-confirmation',
    name: 'emailConfirmation',
    component: EmailModificationVerificationView,
    meta: { title: 'Confirmation d\'email' }
  },
  {
    path: '/evaluation-question',
    name: 'evaluationQuestion',
    component: EvaluationQuestionView,
    meta: { title: 'Evaluation - Question' }
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

// Guard global pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem("token");
    if (!token) {
      next({ name: 'login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;