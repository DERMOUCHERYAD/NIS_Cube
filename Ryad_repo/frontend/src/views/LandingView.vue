<template>
  <div class="landing-page">
    <!-- Header -->
    <div class="header-wrapper">
      <header class="landing-header">
        <div class="logo">
          <Shield class="logo-icon" />
          <span class="logo-text">NIS CUBE</span>
        </div>
        <div class="auth-buttons">
          <RouterLink to="/login" class="login-btn">
            Se connecter
          </RouterLink>
          <RouterLink to="/register" class="register-btn">
            S'inscrire
          </RouterLink>
        </div>
      </header>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="bento-container">
        <div class="hero-content">
          <h1>Évaluez votre conformité NIS2</h1>
          <p class="hero-description">
            Mesurez le niveau de sécurité de votre entité, identifiez vos axes d'amélioration
            et suivez votre progression vers une conformité totale.
          </p>
          <RouterLink to="/register" class="cta-button">
            Démarrer l'évaluation
          </RouterLink>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Cybersécurité" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="bento-container">
        <h2 class="section-title">Pourquoi choisir NIS CUBE ?</h2>
        
        <div class="bento-grid">
          <div class="bento-card feature-card">
            <ClipboardCheck class="bento-icon" />
            <h3>Évaluation rapide</h3>
            <p>Diagnostic complet de votre niveau de conformité NIS2 en quelques minutes.</p>
          </div>
          
          <div class="bento-card feature-card">
            <BarChart3 class="bento-icon" />
            <h3>Visualisation claire</h3>
            <p>Graphiques intuitifs pour comprendre immédiatement vos résultats.</p>
          </div>
          
          <div class="bento-card feature-card">
            <Lightbulb class="bento-icon" />
            <h3>Recommandations</h3>
            <p>Conseils personnalisés pour améliorer votre niveau de sécurité.</p>
          </div>
          
          <div class="bento-card feature-card">
            <FileText class="bento-icon" />
            <h3>Rapports détaillés</h3>
            <p>Exportez vos résultats et suivez votre progression dans le temps.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="bento-container">
        <h2 class="section-title">Ce que nos utilisateurs disent</h2>
        
        <div class="bento-grid testimonials-grid">
          <div class="bento-card testimonial-card">
            <div class="testimonial-content">
              <Quote class="quote-icon" />
              <p>
                "NIS CUBE nous a permis d'identifier rapidement nos faiblesses en matière de cybersécurité et d'établir un plan d'action efficace."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Avatar" />
                </div>
                <div class="author-info">
                  <h4>Thomas Durand</h4>
                  <p>RSSI, Entreprise Tech</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bento-card testimonial-card">
            <div class="testimonial-content">
              <Quote class="quote-icon" />
              <p>
                "L'interface intuitive et les recommandations précises nous ont fait gagner un temps précieux dans notre mise en conformité."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Avatar" />
                </div>
                <div class="author-info">
                  <h4>Marie Lefort</h4>
                  <p>Directrice IT, Secteur Santé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="bento-container">
        <div class="bento-card cta-card">
          <h2>Prêt à améliorer votre conformité NIS2 ?</h2>
          <p>Rejoignez les entreprises qui sécurisent leur avenir numérique avec NIS CUBE.</p>
          <RouterLink to="/register" class="cta-button">
            Découvrir la plateforme
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="bento-container">
        <div class="footer-content">
          <div class="footer-logo">
            <Shield class="logo-icon" />
            <span class="logo-text">NIS CUBE</span>
          </div>
          <div class="footer-links">
            <RouterLink to="/a-propos">À propos</RouterLink>
            <RouterLink to="/login">Se connecter</RouterLink>
            <RouterLink to="/register">S'inscrire</RouterLink>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 NIS CUBE. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Shield, ClipboardCheck, BarChart3, Lightbulb, FileText, Quote } from 'lucide-vue-next';
</script>

<style scoped>
/* Variables */
:root {
  --primary: #3498DB;
  --primary-hover: #2980B9;
  --text-dark: #333333;
  --text-light: #666666;
  --white: #FFFFFF;
  --light-bg: #F8FAFC;
  --border: #E2E8F0;
  --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  --radius: 16px;
}

/* Global Styles */
.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text-dark);
  background-color: var(--light-bg);
  overflow-x: hidden;
  max-width: 100vw;
}

.bento-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.bento-grid {
  display: grid;
  gap: 1.5rem;
}

.bento-card {
  background-color: var(--white);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow);
}

.bento-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
}

/* Header */
.header-wrapper {
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--light-bg);
}

.landing-header {
  background-color: var(--white);
  border-radius: var(--radius);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  max-width: 1280px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary);
}

.logo-icon {
  width: 2rem;
  height: 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.login-btn, .register-btn {
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-btn {
  background-color: var(--primary);
  color: white;
}

.login-btn:hover {
  background-color: var(--primary-hover);
}

.register-btn {
  border: 1px solid var(--primary);
  color: var(--primary);
  background-color: transparent;
}

.register-btn:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

/* Hero Section */
.hero-section {
  padding: 5rem 0;
}

.hero-section .bento-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.2;
  margin: 0;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-light);
  line-height: 1.6;
  margin: 0;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: var(--primary);
  color: white;
  border-radius: var(--radius);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  max-width: fit-content;
  text-align: center;
}

.cta-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.hero-image {
  overflow: hidden;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  height: 100%;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 3rem;
  margin-top: 0;
}

.features-section .bento-grid {
  grid-template-columns: repeat(2, 1fr);
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.feature-card p {
  line-height: 1.6;
  margin: 0;
  color: var(--text-light);
}

/* Testimonials Section */
.testimonials-section {
  padding: 6rem 0;
}

.testimonials-grid {
  grid-template-columns: repeat(2, 1fr);
}

.testimonial-card {
  display: flex;
  flex-direction: column;
}

.testimonial-content {
  position: relative;
  flex: 1;
}

.quote-icon {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 2.5rem;
  height: 2.5rem;
  color: rgba(52, 152, 219, 0.2);
}

.testimonial-content p {
  font-style: italic;
  color: var(--text-dark);
  line-height: 1.6;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.author-info p {
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0.25rem 0 0;
  font-style: normal;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
}

.cta-card {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(52, 152, 219, 0.05));
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.cta-card h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-dark);
}

.cta-card p {
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
  color: var(--text-light);
}

/* Footer */
.landing-footer {
  background-color: var(--white);
  color: var(--text-dark);
  padding: 3rem 0 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary);
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--text-light);
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 500;
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .hero-content h1 {
    font-size: 3rem;
  }
  
  .section-title, .cta-card h2 {
    font-size: 2rem;
  }
}

@media (max-width: 992px) {
  .hero-section .bento-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-content {
    text-align: center;
    align-items: center;
  }
  
  .features-section .bento-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-wrapper {
    padding: 1rem;
  }
  
  .landing-header {
    padding: 1rem;
  }
  
  .bento-container {
    padding: 0 1.5rem;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.125rem;
  }
  
  .section-title, .cta-card h2 {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
  
  .features-section,
  .testimonials-section,
  .cta-section {
    padding: 4rem 0;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}

@media (max-width: 576px) {
  .landing-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .auth-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .login-btn, .register-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .cta-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  }
  
  .bento-card {
    padding: 1.5rem;
  }
  
  .cta-card {
    padding: 2rem 1.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>