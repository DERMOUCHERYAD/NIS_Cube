/**
 * @file src/types/evaluation.ts
 * Types et interfaces pour représenter l'évaluation,
 * basés sur la structure de la base de données SQL.
 */

// Énumération pour la conformité : conforme, partiellement conforme, non conforme.
export enum Conformite {
  CONFORME = 'CONFORME',
  PARTIELLEMENT_CONFORME = 'PARTIELLEMENT_CONFORME',
  NON_CONFORME = 'NON_CONFORME',
}

// Énumération pour le type de question (BINAIRE vs NON_BINAIRE).
export enum QuestionType {
  BINAIRE = 'BINAIRE',
  NON_BINAIRE = 'NON_BINAIRE',
}

// Énumération pour le format de réponse (BINAIRE, ENTIER, TEXTUEL).
export enum AnswerType {
  BINAIRE = 'BINAIRE',
  ENTIER = 'ENTIER',
  TEXTUEL = 'TEXTUEL',
}

// Énumération pour le type d'entité (Entité Essentielle / Entité Importante).
export enum TypeEntite {
  EE = 'EE',
  EI = 'EI',
}

/**
 * Représente un axe de conformité (catégorie).
 * Correspond à la table "axe" (axe_id, nom).
 */
export interface Axe {
  axe_id: number;
  nom: string;
  // Liste d'objectifs associés, éventuellement
  objectifs?: Objectif[];
}

/**
 * Représente un objectif lié à un axe,
 * Correspond à la table "objectif".
 */
export interface Objectif {
  objectif_id: number;
  axe_id: number;
  description: string;
  justification_risques: string;
}

/**
 * Représente une question posée à l'utilisateur,
 * Correspond à la table "question".
 */
export interface Question {
  question_id: number;
  objectif_id: number;
  axe_id: number;
  intitule: string;            // ex. "Avez-vous défini une politique de sécurité ?"
  nom_mesure?: string;         // éventuellement la mesure normative associée
  type_question: QuestionType; // BINAIRE / NON_BINAIRE
  pour_ei: boolean;            // indique si c'est spécifique aux EI
  recommandation?: string;     // conseil ou recommandation
  is_dependent: boolean;       // question dépendante ?
  depends_on_question_id?: number; // ID de la question parent
  answer_type: AnswerType;     // BINAIRE, ENTIER ou TEXTUEL
}

/**
 * Représente la réponse à une question,
 * Correspond à la table "reponse".
 */
export interface Reponse {
  reponse_id: number;
  evaluation_id: number;
  user_id: number;
  question_id: number;
  score: number;                 // 0..10
  donnee_boolean?: boolean;      // si answer_type = BINAIRE
  donnee_entiere?: number;       // si answer_type = ENTIER
  donnee_textuelle?: string;     // si answer_type = TEXTUEL
  conformite?: Conformite;       // éventuellement CONFORME / PARTIELLEMENT_CONFORME / NON_CONFORME
  answer_type: AnswerType;       // doit correspondre à la question
  is_dynamic: boolean;           // si la réponse peut changer dans le temps
  expires_at?: Date;             // date d’expiration
}

/**
 * Représente une évaluation au sens large,
 * Correspond à la table "evaluation".
 */
export interface Evaluation {
  evaluation_id: number;
  user_id: number;
  nom: string;
  id_dernier_objectif?: number;
  date_derniere_modification?: Date;
  type_entite: TypeEntite; // EE ou EI
}

/**
 * Représente une section (dans l’UI) qui peut regrouper des questions.
 * Ce type n’existe pas directement dans la BDD, mais sert pour structurer
 * l'affichage (front-end). Vous pouvez l’adapter.
 */
export interface Section {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  score: number;
  objective?: {
    id: string;
    title: string;
    description: string;
    importance: string;
  };
  questions: Array<{
    id: number;
    objective: string;
    text: string;
    help?: string;
    recommendation?: string;
  }>;
}
