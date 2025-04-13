--  -----------------------------------------------OBJECTIF 1 --------------------------------------------------


INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (1, 'R1_1 - Recenser les SI : L’entité recense ses systèmes d’information et cartographie ses activités critiques.',
        'Se concentrer sur les SI critiques permet de limiter les risques de dégradation des services, de fuites d’informations ou d’altération des données sensibles.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (1, 'R1_2 - Cadre de gouvernance : L’entité dispose d’un cadre de gouvernance de la sécurité numérique.',
        'Sans gouvernance, les actions de cybersécurité sont désorganisées, incohérentes, et les incidents mal gérés.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (1, 'R1_3 - Approche par les risques : L’entité met en œuvre une analyse des risques sur ses activités critiques.',
        'Sans cette approche, les vulnérabilités majeures peuvent être ignorées, augmentant les risques d’incidents graves.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (1, 'R1_4 - Maîtrise de l’écosystème : L’entité connaît et contrôle son environnement numérique (prestataires, interconnexions).',
        'Un manque de maîtrise de l’écosystème peut entraîner des attaques indirectes via des partenaires non sécurisés.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (1, 'R1_5 - Organiser l’audit : L’entité planifie des audits de cybersécurité réguliers sur ses SI réglementés.',
        'Sans audit, des failles peuvent passer inaperçues et compromettre la sécurité globale de l’entité.');

--  -----------------------------------------------OBJECTIF 2 --------------------------------------------------
INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (2, 'R2_1 - Prise en compte de la cybersécurité dans la gestion RH : L’entité intègre la sécurité numérique dans ses processus de gestion des ressources humaines (sensibilisation, formations, gestion des arrivées/départs).',
        'Sans sensibilisation et encadrement RH, les utilisateurs peuvent adopter des comportements à risque (ex : connecter un support infecté), menaçant la sécurité des systèmes d’information.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (2, 'R2_2 - Maîtrise des accès physiques : L’entité contrôle les accès physiques aux locaux et équipements sensibles en fonction de leur criticité.',
        'Un accès non autorisé à un local peut permettre un sabotage, un vol de données ou l’introduction de matériel malveillant.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (2, 'R2_3 - Sécurisation de l’architecture des SIR : L’entité conçoit une architecture sécurisée pour ses systèmes d’information réglementés avec segmentation et filtrages adaptés.',
        'Une architecture non segmentée facilite les déplacements d’un attaquant dans le système et augmente les risques en cas de compromission.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (2, 'R2_4 - Sécurisation des accès distants aux SIR : L’entité sécurise les connexions distantes avec authentification forte, chiffrement et journalisation.',
        'Des accès distants mal sécurisés peuvent permettre à un attaquant d’infiltrer le système sans être détecté.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (2, 'R2_5 - Prise d’information : L’entité supervise ses systèmes d’information pour détecter les événements de sécurité et réagir rapidement.',
        'Sans prise d’information, les incidents peuvent passer inaperçus, retardant la réponse et augmentant les dégâts.');

--  -----------------------------------------------OBJECTIF 3 --------------------------------------------------

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (3, 'R3_1 - Maîtrise des SIR : L’entité cartographie précisément ses systèmes d’information réglementés et assure leur mise à jour régulière (MCO).',
        'Sans cartographie ni MCO, des composants obsolètes ou mal identifiés peuvent être vulnérables, facilitant les attaques ou les erreurs d’administration.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (3, 'R3_2 - Protection contre le code malveillant : L’entité met en place des mesures de protection contre les codes malveillants (antivirus, filtrage, sandboxing...).',
        'L’absence de protection augmente les risques d’intrusions, de ransomware, ou de fuite de données sensibles.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (3, 'R3_3 - Sécurisation des ressources : L’entité applique des configurations durcies à ses ressources en supprimant les composants inutiles et en suivant les bonnes pratiques.',
        'Des ressources mal configurées ou superflues peuvent exposer des vulnérabilités exploitables, entraînant compromission ou indisponibilité des services.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (3, 'R3_4 - Gestion des identités et des accès : L’entité gère strictement les identités et les droits d’accès aux SIR avec authentification forte et contrôle des privilèges.',
        'Une mauvaise gestion des accès permet l’usurpation d’identité, la fuite d’informations ou des perturbations dans les services.');

INSERT INTO public.objectif
    (axe_id, description, justification_risques)
VALUES
    (3, 'R3_5 - Maîtrise de l’administration des SIR : L’entité contrôle les accès d’administration aux SIR avec des postes dédiés, une séparation des rôles et une journalisation.',
        'Une administration non maîtrisée peut être détournée pour réaliser des actions malveillantes sur l’ensemble du système.');


