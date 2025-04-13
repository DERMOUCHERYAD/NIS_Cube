<template>
  <div class="about-page">
    <article class="main-card">
      <header>
        <h1>À propos de NIS CUBE</h1>
      </header>

      <section class="content">
        <div class="section">
          <h2>Qu'est-ce que NIS2 ?</h2>
          <p>
            La directive NIS2 (Network and Information Systems) est la nouvelle réglementation européenne 
            sur la cybersécurité. Elle vise à renforcer la sécurité des réseaux et des systèmes d'information 
            dans l'Union européenne, en imposant des obligations aux entreprises et organisations considérées 
            comme essentielles ou importantes.
          </p>
        </div>

        <div class="section">
          <h2>Notre outil d'évaluation</h2>
          <p>Cet outil d'auto-évaluation vous permet de :</p>
          <ul class="feature-list">
            <li>
              <CheckCircle2 class="icon" />
              <span>Évaluer votre niveau de conformité actuel avec NIS2</span>
            </li>
            <li>
              <Search class="icon" />
              <span>Identifier les domaines nécessitant des améliorations</span>
            </li>
            <li>
              <ListChecks class="icon" />
              <span>Obtenir des recommandations pratiques</span>
            </li>
            <li>
              <FileText class="icon" />
              <span>Générer un rapport détaillé de votre évaluation</span>
            </li>
          </ul>
        </div>

        <div class="info-box">
          <h3>Comment utiliser l'outil ?</h3>
          <ol class="steps-list">
            <li>
              <span class="step-number">1</span>
              <span>Répondez aux questions d'évaluation</span>
            </li>
            <li>
              <span class="step-number">2</span>
              <span>Consultez vos résultats et recommandations</span>
            </li>
            <li>
              <span class="step-number">3</span>
              <span>Téléchargez votre certificat d'évaluation</span>
            </li>
            <li>
              <span class="step-number">4</span>
              <span>Mettez en œuvre les améliorations suggérées</span>
            </li>
          </ol>
        </div>

        <div class="section">
          <h2>Confidentialité</h2>
          <p>
            Vos réponses et résultats sont strictement confidentiels. Aucune donnée n'est partagée 
            avec des tiers. L'évaluation est réalisée localement dans votre navigateur.
          </p>
        </div>

        <div class="notice">
          <Info class="icon" />
          <p>
            Cette auto-évaluation est un outil d'aide à la conformité. Pour une évaluation 
            officielle, nous vous recommandons de faire appel à un auditeur certifié.
          </p>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Info, CheckCircle2, Search, ListChecks, FileText } from 'lucide-vue-next';
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
}

.main-card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.main-card header {
  background: var(--primary-focus);
  padding: 2rem;
  text-align: center;
}

.main-card header h1 {
  color: var(--primary);
  margin: 0;
}

.content {
  padding: 2rem;
}

.section {
  margin-bottom: 2.5rem;
}

.section h2 {
  color: var(--text);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-focus);
}

.section p {
  color: var(--text);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  color: var(--text);
}

.feature-list .icon {
  color: var(--primary);
  width: 1.25rem;
  height: 1.25rem;
}

.info-box {
  background: var(--primary-focus);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin: 2rem 0;
}

.info-box h3 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.steps-list {
  list-style: none;
  padding: 0;
  counter-reset: step;
}

.steps-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  color: var(--text);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--primary);
  color: var(--white);
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--primary-focus);
  border-radius: var(--radius);
  margin-top: 2rem;
}

.notice .icon {
  color: var(--primary);
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.notice p {
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .content {
    padding: 1.5rem;
  }

  .main-card header {
    padding: 1.5rem;
  }

  .main-card header h1 {
    font-size: 1.5rem;
  }

  .section h2 {
    font-size: 1.25rem;
  }
}
</style>