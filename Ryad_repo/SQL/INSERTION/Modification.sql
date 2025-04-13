ALTER TABLE public.question
ADD COLUMN min_score integer DEFAULT 0;

ALTER TABLE public.question
ADD CONSTRAINT check_min_score CHECK (min_score >= 0 AND min_score <= 10);

COMMENT ON COLUMN public.question.min_score IS 'Score minimum requis pour déclencher l’affichage de la question dépendante';




ALTER TABLE public.question
ADD COLUMN applicable boolean DEFAULT true;

COMMENT ON COLUMN public.question.applicable IS 'Indique si la question est applicable ou non pour une évaluation donnée';
