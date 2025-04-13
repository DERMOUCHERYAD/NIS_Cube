/**
 * @file src/data/evaluation.ts
 * Exporte un ensemble de sections pour la démonstration
 * (inspiré du contenu fourni lors des questions précédentes).
 */

import type { Section } from '@/types/evaluation';

export const sectionsData: Section[] = [
  {
    id: 1,
    title: "Structurer",
    description: "Organisation et gouvernance de la sécurité",
    completed: false,
    score: 0,
    objective: {
      id: "1",
      title: "Gouvernance de la sécurité",
      description: "Établir une structure organisationnelle claire pour la sécurité.",
      importance: "Une gouvernance efficace de la sécurité est fondamentale pour assurer que les responsabilités sont clairement définies."
    },
    questions: [
      {
        id: 1,
        objective: "1.1",
        text: "Avez-vous défini une politique de sécurité des systèmes d'information ?",
        help: "La politique doit définir les objectifs, les rôles et les responsabilités en matière de sécurité.",
        recommendation: "Établissez une politique de sécurité documentée et validée par la direction."
      },
      {
        id: 2,
        objective: "1.2",
        text: "Existe-t-il un responsable de la sécurité des systèmes d'information (RSSI) ?",
        help: "Le RSSI coordonne la mise en œuvre de la politique de sécurité.",
        recommendation: "Désignez un RSSI ou attribuez cette responsabilité à un membre de l'équipe."
      }
    ]
  },
  {
    id: 2,
    title: "Protection externe",
    description: "Sécurisation des accès et des communications externes",
    completed: false,
    score: 0,
    objective: {
      id: "2",
      title: "Sécurisation du périmètre réseau",
      description: "Protéger les frontières du réseau contre les intrusions.",
      importance: "La protection du périmètre réseau constitue votre première ligne de défense contre les menaces externes."
    },
    questions: [
      {
        id: 3,
        objective: "2.1",
        text: "Disposez-vous d'un pare-feu pour protéger votre réseau ?",
        help: "Le pare-feu filtre les communications entre votre réseau et l'extérieur.",
        recommendation: "Installez et configurez un pare-feu professionnel."
      }
    ]
  },
  // Ajoutez d’autres sections selon vos besoins...
];
