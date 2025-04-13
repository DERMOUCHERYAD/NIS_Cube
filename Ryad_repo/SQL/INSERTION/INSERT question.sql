-- Question 1 (principale)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        1, 1,
        'Avez-vous fait la liste de l’ensemble de vos activités et services ?',
        'MOYENS ACCEPTABLES DE CONFORMITE',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question 2 (dépendante de la question 1)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        1, 1,
        'Nombre de SIR ?',
        'MOYENS ACCEPTABLES DE CONFORMITE',
        'NON_BINAIRE',
        true, NULL, true, 1,
        'ENTIER', 1
);
-- Question R1_1_2
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        1, 1,
        'Avez-vous exclu des systèmes d''information de la mise en œuvre NIS ?',
        'MOYENS ACCEPTABLES DE CONFORMITE',
        'BINAIRE',
        true, NULL, true, 2,
        'BINAIRE', 10
);
-- Question R1_1_3 
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        1, 1,
        'Les SI exclus sont-ils distingués dans la liste prévue au R1_1_1 ?',
        'MOYENS ACCEPTABLES DE CONFORMITE',
        'BINAIRE',
        true, NULL, true, 3,
        'BINAIRE', 10
);

-- Question R1_1_4
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        1, 1,
        'Date de dernière révision de la liste d''exclusion ou à défaut, date de mise en place de celle-ci : ?',
        'MOYENS ACCEPTABLES DE CONFORMITE',
        'NON_BINAIRE',
        true, NULL, true, 3,
        'DATE', 10
);
-- Question R1_2_1
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Avez-vous désigné une personne en charge d’accompagner le dirigeant dans ses responsabilités de cybersécurité, et servant de point de contact avec l’ANSSI ?',
        'ROLES ET RESPONSABILITES',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question R1_2_2
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Avez-vous un document définissant l’organisation visant à assurer la sécurité informatique ?',
        'ROLES ET RESPONSABILITES',
        'BINAIRE',
        false, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question R1_2_3
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'La PSSI comporte-t-elle un chapitre présentant l’organisation de la gouvernance de la sécurité numérique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question R1_2_4
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'La PSSI comporte-t-elle un chapitre présentant les orientations et objectifs stratégiques en matière de sécurité numérique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question R1_2_5
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'La PSSI comporte-t-elle un chapitre présentant l’engagement du dirigeant exécutif de l’entité à assurer la sécurité numérique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question R1_2_6
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'La PSSI comporte-t-elle un chapitre présentant l’engagement du dirigeant exécutif à assurer la conformité aux exigences légales et réglementaires en matière de sécurité numérique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question R1_2_7
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Quelle est la date d’approbation de la PSSI ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'DATE', 0
);

-- Question R1_2_8
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Quelle est la date de dernière révision de la PSSI ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'DATE', 0
        
);

-- Question R1_2_9 
-- Question 1 (principale)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Combien de systèmes d’information sont identifiés comme devant être chiffrés ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'ENTIER', 1
);
-- Question 2 (dépendante de la question 1)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Combien de systèmes d’information identifiés ont effectivement fait l’objet d’un chiffrement ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, true, 14,
        'ENTIER', 1
);

-- Question R1_2_10
-- Question 1 (principale)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Combien de sites nécessitent la mise en place d’un contrôle d’accès physique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'ENTIER', 1
);
-- Question 2 (dépendante de la question 1)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Combien de systèmes d’information disposent effectivement d’un contrôle d’accès physique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, true, 16,
        'ENTIER', 1
);
-- Question R1_2_11
--  Question 1 (principale)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Combien de systèmes d’information nécessitent la mise en place d’un contrôle d’accès logique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'ENTIER', 1
);
-- Question 2 (dépendante de la question 1)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Combien de systèmes d’information disposent effectivement d’un contrôle d’accès logique ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'NON_BINAIRE',
        true, NULL, true, 18,
        'ENTIER', 1
);

-- Question R1_2_12
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Mettez-vous en œuvre une revue de l''application des mesures de sécurité ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question R1_2_13
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Mettez-vous en œuvre une politique en matière de maintien en condition de sécurité ?',
        'POLITIQUE DE SECURITE DES SYSTEMES D’INFORMATION',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question R1_2_14
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Nombre de SIR faisant l''objet d''une analyse de conformité :',
        'GESTION DE LA CONFORMITE',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'ENTIER', 1
);

-- Question R1_2_15
-- Question 1 (principale)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Existe-t-il des alternatives par rapport à la règle précédente (R1_2_14) ?',
        'GESTION DE LA CONFORMITE',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question 2 (dépendante de la question 1)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Chapitre de la mise en conformité justifiant de ces alternatives :',
        'GESTION DE LA CONFORMITE',
        'NON_BINAIRE',
        true, NULL, true, 23,
        'TEXTUEL', 0
);
-- Question R1_2_16
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        2, 1,
        'Disposez-vous d’un répertoire des dépôts de preuve de respect de la réglementation ?',
        'GESTION DE LA CONFORMITE',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question R1_3_1
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        3, 1,
        'Disposez-vous d’un document définissant la gouvernance par les risques ?',
        NULL,
        'BINAIRE',
        false, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question R1_3_2
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        3, 1,
        'Combien de SIR ont fait l''objet d''une analyse de risque ?',
        NULL,
        'NON_BINAIRE',
        false, NULL, false, NULL,
        'ENTIER', 9
);
-- Question R1_3_3
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        3, 1,
        'Nombre d''analyses de risques validées :',
        NULL,
        'NON_BINAIRE',
        false, NULL, false, NULL,
        'ENTIER', 10
);
-- Question R1_3_4
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        3, 1,
        'Nombre de plans d''actions mis en œuvre pour maîtriser les risques (au maximum, un par analyse de risques) ;',
        NULL,
        'NON_BINAIRE',
        false, NULL, false, NULL,
        'ENTIER', 4
);
-- Question R1_3_5
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        3, 1,
        'Date des derniers réexamens des analyses de risques :',
        NULL,
        'NON_BINAIRE',
        false, NULL, false, NULL,
        'DATE', 0
);

-- Question R1_4_1
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        4, 1,
        'Disposez-vous d''un document de cartographie de l''écosystème dans lequel sont mis en œuvre vos systèmes d''information réglementés ?',
        'CARTOGRAPHIE DE L’ECOSYSTEME',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);
-- Question R1_4_2
--  Question 1 (principale)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        4, 1,
        'Combien d’entrées figurent dans la cartographie de votre écosystème ?',
        'SECURITE NUMERIQUE DANS LES CONTRATS',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'ENTIER', 1
);

-- Question 2 (dépendante de la question 1)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        4, 1,
        'Avez-vous identifié un ou plusieurs points de contact pour chaque entrée de votre cartographie ?',
        'SECURITE NUMERIQUE DANS LES CONTRATS',
        'NON_BINAIRE',
        true, NULL, false, NULL,
        'ENTIER', 1
);

--Question R1_4_3
--Question 1 (principale)
-- Question 1 : Faites-vous appel à un prestataire ?
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        4, 1,
        'Faites-vous appel à un ou plusieurs prestataires ?',
        'SECURITE NUMERIQUE DANS LES CONTRATS',
        'BINAIRE',
        true, NULL, false, NULL,
        'BINAIRE', 10
);

-- Question 2 (dépendante de la question 1)
-- Question 2 : Nombre de prestataires (dépend de la question 1, ID supposé 34)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        4, 1,
        'Combien de prestataires avez-vous identifiés ?',
        'SECURITE NUMERIQUE DANS LES CONTRATS',
        'NON_BINAIRE',
        true, NULL, true, 34,
        'ENTIER', 1
);

-- Question 3 (dépendante de la question 1)
-- Question 3 : Nombre de documents contractuels (dépend aussi de la question 1, ID supposé 34)
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        4, 1,
        'Combien de documents contractuels d’assurance de conformité des prestataires avez-vous ?',
        'SECURITE NUMERIQUE DANS LES CONTRATS',
        'NON_BINAIRE',
        true, NULL, true, 34,
        'ENTIER', 1
);

-- Question R1_5_1
-- Question 1 : Nombre de SIR ayant fait l'objet d'un audit ces trois dernières années
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        5, 1,
        'Combien de SIR ont fait l’objet d’un audit ces trois dernières années ?',
        NULL,
        'NON_BINAIRE',
        false, NULL, false, NULL,
        'ENTIER', 1
);
-- Question 2 : Date à laquelle cette information est pertinente
INSERT INTO public.question
    (
    objectif_id, axe_id, intitule, nom_mesure, type_question,
    pour_ei, recommandation, is_dependent, depends_on_question_id,
    answer_type, min_score
    )
VALUES
    (
        5, 1,
        'Quelle est la date de réponse à cette question (pertinente pour le calcul de la période des 3 ans) ?',
        NULL,
        'NON_BINAIRE',
        false, NULL, true, 37,
        'DATE', 0
);
--Question R1_5_2

