--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: conformite_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conformite_enum AS ENUM (
    'CONFORME',
    'PARTIELLEMENT_CONFORME',
    'NON_CONFORME'
);


ALTER TYPE public.conformite_enum OWNER TO postgres;

--
-- Name: TYPE conformite_enum; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TYPE public.conformite_enum IS 'Type pour indiquer la conformité : Conforme, partiellement conforme, non conforme';


--
-- Name: question_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.question_type_enum AS ENUM (
    'BINAIRE',
    'NON_BINAIRE'
);


ALTER TYPE public.question_type_enum OWNER TO postgres;

--
-- Name: question_type_reponse_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.question_type_reponse_enum AS ENUM (
    'BINAIRE',
    'ENTIER',
    'TEXTUEL',
    'DATE'
);


ALTER TYPE public.question_type_reponse_enum OWNER TO postgres;

--
-- Name: TYPE question_type_reponse_enum; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TYPE public.question_type_reponse_enum IS 'Type de réponse : BINAIRE (Oui/Non), ENTIER (score), TEXTUEL (texte libre), DATE (date)';


--
-- Name: type_entite_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_entite_enum AS ENUM (
    'EE',
    'EI'
);


ALTER TYPE public.type_entite_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: axe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.axe (
    axe_id integer NOT NULL,
    nom character varying(255) NOT NULL
);


ALTER TABLE public.axe OWNER TO postgres;

--
-- Name: COLUMN axe.axe_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.axe.axe_id IS 'Identifiant unique de l’axe, auto-incrémenté';


--
-- Name: COLUMN axe.nom; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.axe.nom IS 'Nom de l’axe, représentant une catégorie de conformité NIS2';


--
-- Name: axe_axe_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.axe_axe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.axe_axe_id_seq OWNER TO postgres;

--
-- Name: axe_axe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.axe_axe_id_seq OWNED BY public.axe.axe_id;


--
-- Name: evaluation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation (
    evaluation_id integer NOT NULL,
    user_id integer NOT NULL,
    nom character varying(255) NOT NULL,
    id_dernier_objectif integer,
    date_derniere_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type_entite public.type_entite_enum DEFAULT 'EE'::public.type_entite_enum NOT NULL,
    nombre_si integer DEFAULT 0
);


ALTER TABLE public.evaluation OWNER TO postgres;

--
-- Name: COLUMN evaluation.evaluation_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.evaluation_id IS 'Identifiant unique de l’évaluation, auto-incrémenté';


--
-- Name: COLUMN evaluation.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.user_id IS 'Référence à l’utilisateur ayant initié l’évaluation';


--
-- Name: COLUMN evaluation.nom; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.nom IS 'Nom ou titre donné à l’évaluation';


--
-- Name: COLUMN evaluation.id_dernier_objectif; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.id_dernier_objectif IS 'Dernier objectif sur lequel l’utilisateur s’est arrêté lors de l’évaluation';


--
-- Name: COLUMN evaluation.date_derniere_modification; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.date_derniere_modification IS 'Date et heure de la dernière modification de l’évaluation';


--
-- Name: COLUMN evaluation.type_entite; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.type_entite IS 'Type d''entité de l''évaluation : EE (Entité essentielle) ou EI (Entité importante)';


--
-- Name: COLUMN evaluation.nombre_si; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.evaluation.nombre_si IS 'Nombre de SI';


--
-- Name: evaluation_evaluation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluation_evaluation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluation_evaluation_id_seq OWNER TO postgres;

--
-- Name: evaluation_evaluation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluation_evaluation_id_seq OWNED BY public.evaluation.evaluation_id;


--
-- Name: objectif; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.objectif (
    objectif_id integer NOT NULL,
    axe_id integer NOT NULL,
    description text NOT NULL,
    justification_risques text NOT NULL
);


ALTER TABLE public.objectif OWNER TO postgres;

--
-- Name: COLUMN objectif.objectif_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.objectif.objectif_id IS 'Identifiant unique de l’objectif, auto-incrémenté';


--
-- Name: COLUMN objectif.axe_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.objectif.axe_id IS 'Référence à l’axe auquel cet objectif est rattaché';


--
-- Name: COLUMN objectif.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.objectif.description IS 'Description de l’objectif de conformité';


--
-- Name: COLUMN objectif.justification_risques; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.objectif.justification_risques IS 'Justification des risques associés si l’objectif n’est pas atteint';


--
-- Name: objectif_objectif_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.objectif_objectif_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.objectif_objectif_id_seq OWNER TO postgres;

--
-- Name: objectif_objectif_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.objectif_objectif_id_seq OWNED BY public.objectif.objectif_id;


--
-- Name: question; Type: TABLE; Schema: public; Owner: postgres
--

    CREATE TABLE public.question (
        question_id integer NOT NULL,
        objectif_id integer NOT NULL,
        axe_id integer NOT NULL,
        intitule text NOT NULL,
        nom_mesure character varying(255),
        type_question public.question_type_enum NOT NULL,
        pour_ei boolean NOT NULL,
        recommandation text,
        is_dependent boolean DEFAULT false NOT NULL,
        depends_on_question_id integer,
        answer_type public.question_type_reponse_enum DEFAULT 'BINAIRE'::public.question_type_reponse_enum NOT NULL,
        CONSTRAINT question_dependency_check CHECK ((((is_dependent = false) AND (depends_on_question_id IS NULL)) OR ((is_dependent = true) AND (depends_on_question_id IS NOT NULL))))
    );


    ALTER TABLE public.question OWNER TO postgres;

    --
    -- Name: COLUMN question.question_id; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.question_id IS 'Identifiant unique de la question, auto-incrémenté';


    --
    -- Name: COLUMN question.objectif_id; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.objectif_id IS 'Référence à l’objectif auquel est rattachée cette question';


    --
    -- Name: COLUMN question.axe_id; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.axe_id IS 'Référence à l’axe associé à la question';


    --
    -- Name: COLUMN question.intitule; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.intitule IS 'Texte de la question posée à l’utilisateur';


    --
    -- Name: COLUMN question.nom_mesure; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.nom_mesure IS 'Nom de la mesure de conformité associée, si applicable';


    --
    -- Name: COLUMN question.type_question; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.type_question IS 'Type de la question : BINAIRE (Oui/Non) ou NON_BINAIRE (score 0-10)';


    --
    -- Name: COLUMN question.pour_ei; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.pour_ei IS 'Indique si la question s’applique aux Entités Importantes (EI)';


    --
    -- Name: COLUMN question.recommandation; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.recommandation IS 'Recommandation affichée à l’utilisateur en fonction de sa réponse';


    --
    -- Name: COLUMN question.is_dependent; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.is_dependent IS 'Indique si la question dépend d’une réponse précédente';


    --
    -- Name: COLUMN question.depends_on_question_id; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.depends_on_question_id IS 'Identifiant de la question parent dont dépend l’affichage';


    --
    -- Name: COLUMN question.answer_type; Type: COMMENT; Schema: public; Owner: postgres
    --

    COMMENT ON COLUMN public.question.answer_type IS 'Définit le format de la réponse : BINAIRE, ENTIER ou TEXTUEL';


    --
    -- Name: question_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
    --

    CREATE SEQUENCE public.question_question_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;


    ALTER SEQUENCE public.question_question_id_seq OWNER TO postgres;

    --
    -- Name: question_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
    --

    ALTER SEQUENCE public.question_question_id_seq OWNED BY public.question.question_id;


    --
    -- Name: reponse; Type: TABLE; Schema: public; Owner: postgres
    --

CREATE TABLE public.reponse (
    reponse_id integer NOT NULL,
    evaluation_id integer NOT NULL,
    user_id integer NOT NULL,
    question_id integer NOT NULL,
    score integer NOT NULL,
    donnee_boolean boolean,
    donnee_entiere integer,
    donnee_textuelle text,
    conformite public.conformite_enum,
    answer_type public.question_type_reponse_enum DEFAULT 'BINAIRE'::public.question_type_reponse_enum NOT NULL,
    is_dynamic boolean DEFAULT false NOT NULL,
    expires_at timestamp without time zone,
    donnee_date date,
    CONSTRAINT reponse_answer_type_check CHECK ((((answer_type = 'BINAIRE'::public.question_type_reponse_enum) AND (donnee_boolean IS NOT NULL) AND (donnee_entiere IS NULL) AND (donnee_textuelle IS NULL) AND (donnee_date IS NULL)) OR ((answer_type = 'ENTIER'::public.question_type_reponse_enum) AND (donnee_entiere IS NOT NULL) AND (donnee_boolean IS NULL) AND (donnee_textuelle IS NULL) AND (donnee_date IS NULL)) OR ((answer_type = 'TEXTUEL'::public.question_type_reponse_enum) AND (donnee_textuelle IS NOT NULL) AND (donnee_boolean IS NULL) AND (donnee_entiere IS NULL) AND (donnee_date IS NULL)) OR ((answer_type = 'DATE'::public.question_type_reponse_enum) AND (donnee_date IS NOT NULL) AND (donnee_boolean IS NULL) AND (donnee_entiere IS NULL) AND (donnee_textuelle IS NULL)))),
    CONSTRAINT reponse_score_check CHECK (((score >= 0) AND (score <=4 )))
);


ALTER TABLE public.reponse OWNER TO postgres;

--
-- Name: COLUMN reponse.reponse_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.reponse_id IS 'Identifiant unique de la réponse, auto-incrémenté';


--
-- Name: COLUMN reponse.evaluation_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.evaluation_id IS 'Référence à l’évaluation dans laquelle cette réponse a été donnée';


--
-- Name: COLUMN reponse.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.user_id IS 'Référence à l’utilisateur qui a répondu';


--
-- Name: COLUMN reponse.question_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.question_id IS 'Référence à la question concernée';


--
-- Name: COLUMN reponse.score; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.score IS 'Score attribué à la réponse (entre 0 et 10)';


--
-- Name: COLUMN reponse.donnee_boolean; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.donnee_boolean IS 'Valeur booléenne pour une question binaire (Oui/Non)';


--
-- Name: COLUMN reponse.donnee_entiere; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.donnee_entiere IS 'Valeur numérique saisie pour une question non binaire (comprise entre 0 et 10)';


--
-- Name: COLUMN reponse.donnee_textuelle; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.donnee_textuelle IS 'Réponse textuelle donnée par l''utilisateur lors de sa réponse à une question qui nécessite une réponse textuelle';


--
-- Name: COLUMN reponse.conformite; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.conformite IS 'Indicateur de conformité (conforme, partiellement conforme, non conforme)';


--
-- Name: COLUMN reponse.answer_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.answer_type IS 'Type de réponse (BINAIRE, ENTIER, TEXTUEL), doit correspondre à la question associée';


--
-- Name: COLUMN reponse.is_dynamic; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.is_dynamic IS 'TRUE si le score peut évoluer dans le temps';


--
-- Name: COLUMN reponse.expires_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.expires_at IS 'Date à laquelle la réponse devient invalide (score = 0)';


--
-- Name: COLUMN reponse.donnee_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reponse.donnee_date IS 'Donnée de type date, renseignée si answer_type = ''DATE''';


--
-- Name: reponse_reponse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reponse_reponse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reponse_reponse_id_seq OWNER TO postgres;

--
-- Name: reponse_reponse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reponse_reponse_id_seq OWNED BY public.reponse.reponse_id;


--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateur (
    user_id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_verified boolean DEFAULT false,
    verification_code character varying(10),
    reset_password_token text,
    reset_password_expires timestamp without time zone,
    last_login timestamp without time zone,
    pending_email character varying(255)
);


ALTER TABLE public.utilisateur OWNER TO postgres;

--
-- Name: COLUMN utilisateur.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.user_id IS 'Identifiant unique de l’utilisateur, auto-incrémenté';


--
-- Name: COLUMN utilisateur.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.username IS 'Nom d’utilisateur unique';


--
-- Name: COLUMN utilisateur.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.email IS 'Adresse e-mail unique, utilisée pour l’authentification';


--
-- Name: COLUMN utilisateur.password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.password IS 'Mot de passe haché de l’utilisateur';


--
-- Name: COLUMN utilisateur.reset_password_token; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.reset_password_token IS 'Token de réinitialisation du mot de passe (haché).';


--
-- Name: COLUMN utilisateur.reset_password_expires; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.reset_password_expires IS 'Date et heure d’expiration du token de réinitialisation.';


--
-- Name: COLUMN utilisateur.last_login; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.last_login IS 'Dernière connexion de l''utilisateur.';


--
-- Name: COLUMN utilisateur.pending_email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.utilisateur.pending_email IS 'Nouvelle adresse email en attente de confirmation';


--
-- Name: utilisateur_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilisateur_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utilisateur_user_id_seq OWNER TO postgres;

--
-- Name: utilisateur_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilisateur_user_id_seq OWNED BY public.utilisateur.user_id;


--
-- Name: axe axe_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.axe ALTER COLUMN axe_id SET DEFAULT nextval('public.axe_axe_id_seq'::regclass);


--
-- Name: evaluation evaluation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation ALTER COLUMN evaluation_id SET DEFAULT nextval('public.evaluation_evaluation_id_seq'::regclass);


--
-- Name: objectif objectif_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objectif ALTER COLUMN objectif_id SET DEFAULT nextval('public.objectif_objectif_id_seq'::regclass);


--
-- Name: question question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question ALTER COLUMN question_id SET DEFAULT nextval('public.question_question_id_seq'::regclass);


--
-- Name: reponse reponse_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponse ALTER COLUMN reponse_id SET DEFAULT nextval('public.reponse_reponse_id_seq'::regclass);


--
-- Name: utilisateur user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur ALTER COLUMN user_id SET DEFAULT nextval('public.utilisateur_user_id_seq'::regclass);


--
-- Data for Name: axe; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.axe VALUES (1, 'Structurer');
INSERT INTO public.axe VALUES (2, 'Protection externe');
INSERT INTO public.axe VALUES (3, 'Protection interne');
INSERT INTO public.axe VALUES (4, 'Défense');
INSERT INTO public.axe VALUES (5, 'Résilience');


--
-- Data for Name: evaluation; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: objectif; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reponse; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.utilisateur VALUES (1, 'NICOLAS', 'abdouseba4@gmail.com', '$2b$10$Kubki0H1Z5VvGlk.v62fMe110tWDZjwVcDCXQeB0kEEFt/pdZXdZa', true, NULL, 'c5ec37adfe34dd98ed6b90c7085dde5c3be116353cbf8b473e8fbc2e3bc10999', '2025-03-26 17:20:38.608', '2025-03-19 18:39:25.783', NULL);


--
-- Name: axe_axe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.axe_axe_id_seq', 5, true);


--
-- Name: evaluation_evaluation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluation_evaluation_id_seq', 13, true);


--
-- Name: objectif_objectif_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.objectif_objectif_id_seq', 1, false);


--
-- Name: question_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_question_id_seq', 1, false);


--
-- Name: reponse_reponse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reponse_reponse_id_seq', 1, false);


--
-- Name: utilisateur_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilisateur_user_id_seq', 10, true);


--
-- Name: axe axe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.axe
    ADD CONSTRAINT axe_pkey PRIMARY KEY (axe_id);


--
-- Name: evaluation evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_pkey PRIMARY KEY (evaluation_id, user_id);


--
-- Name: objectif objectif_objectif_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objectif
    ADD CONSTRAINT objectif_objectif_id_key UNIQUE (objectif_id);


--
-- Name: objectif objectif_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objectif
    ADD CONSTRAINT objectif_pkey PRIMARY KEY (objectif_id, axe_id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (question_id, objectif_id, axe_id);


--
-- Name: question question_question_id_answer_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_question_id_answer_type_key UNIQUE (question_id, answer_type);


--
-- Name: CONSTRAINT question_question_id_answer_type_key ON question; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT question_question_id_answer_type_key ON public.question IS 'Contrainte unique sur le couple (question_id, answer_type) afin de permettre une clé étrangère composite.';


--
-- Name: question question_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_question_id_key UNIQUE (question_id);


--
-- Name: reponse reponse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponse
    ADD CONSTRAINT reponse_pkey PRIMARY KEY (reponse_id, evaluation_id, user_id, question_id);


--
-- Name: reponse reponse_unique_eval_question; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponse
    ADD CONSTRAINT reponse_unique_eval_question UNIQUE (evaluation_id, user_id, question_id);


--
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (user_id);


--
-- Name: utilisateur utilisateur_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_username_key UNIQUE (username);


--
-- Name: evaluation evaluation_id_dernier_objectif_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_id_dernier_objectif_fkey FOREIGN KEY (id_dernier_objectif) REFERENCES public.objectif(objectif_id);


--
-- Name: evaluation evaluation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.utilisateur(user_id);


--
-- Name: objectif objectif_axe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objectif
    ADD CONSTRAINT objectif_axe_id_fkey FOREIGN KEY (axe_id) REFERENCES public.axe(axe_id);


--
-- Name: question question_depends_on_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_depends_on_question_id_fkey FOREIGN KEY (depends_on_question_id) REFERENCES public.question(question_id);


--
-- Name: question question_objectif_id_axe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_objectif_id_axe_id_fkey FOREIGN KEY (objectif_id, axe_id) REFERENCES public.objectif(objectif_id, axe_id);


--
-- Name: reponse reponse_evaluation_id_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponse
    ADD CONSTRAINT reponse_evaluation_id_user_id_fkey FOREIGN KEY (evaluation_id, user_id) REFERENCES public.evaluation(evaluation_id, user_id);


--
-- Name: reponse reponse_question_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponse
    ADD CONSTRAINT reponse_question_fkey FOREIGN KEY (question_id, answer_type) REFERENCES public.question(question_id, answer_type) ON DELETE CASCADE;


--
-- Name: CONSTRAINT reponse_question_fkey ON reponse; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT reponse_question_fkey ON public.reponse IS 'Clé étrangère composite garantissant que le couple (question_id, answer_type) de la réponse correspond à celui de la question référencée.';


--
-- PostgreSQL database dump complete
--

ALTER TABLE public.question
ADD COLUMN min_score integer DEFAULT 0;

ALTER TABLE public.question
ADD CONSTRAINT check_min_score
CHECK (min_score >= 0 AND min_score <= 10);

COMMENT ON COLUMN public.question.min_score IS 'Score minimum requis pour déclencher l’affichage de la question dépendante';

