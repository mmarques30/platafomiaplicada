-- Fix critical security findings before publish

-- 1) materiais_comunidade: hide paid content from anonymous users
DROP POLICY IF EXISTS materiais_comunidade_select_policy ON public.materiais_comunidade;
CREATE POLICY materiais_comunidade_select_policy
  ON public.materiais_comunidade
  FOR SELECT
  USING (
    ativo = true
    AND (
      visibilidade <> 'pago'
      OR auth.uid() IS NOT NULL
    )
  );

-- 2) webhook_lia_logs: restrict SELECT to admins
DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON public.webhook_lia_logs;
DROP POLICY IF EXISTS webhook_lia_logs_select_policy ON public.webhook_lia_logs;
DROP POLICY IF EXISTS "Users can view webhook logs" ON public.webhook_lia_logs;
CREATE POLICY webhook_lia_logs_admin_select
  ON public.webhook_lia_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) avaliacoes_materiais_comunidade: require auth for SELECT
DROP POLICY IF EXISTS avaliacoes_materiais_select_policy ON public.avaliacoes_materiais_comunidade;
CREATE POLICY avaliacoes_materiais_select_policy
  ON public.avaliacoes_materiais_comunidade
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 4) video_ratings: require auth for SELECT
DROP POLICY IF EXISTS "Users can view all ratings" ON public.video_ratings;
CREATE POLICY video_ratings_authenticated_select
  ON public.video_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 5) entregas-equipe-skills storage bucket: restrict to team members
DROP POLICY IF EXISTS "Members can read entregas equipe files" ON storage.objects;
DROP POLICY IF EXISTS "Members can upload entregas equipe files" ON storage.objects;
DROP POLICY IF EXISTS "Members can delete entregas equipe files" ON storage.objects;

CREATE POLICY "Team members can read entregas equipe files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'entregas-equipe-skills'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.membros_equipe_skills m
        WHERE m.user_id = auth.uid()
          AND m.equipe_id::text = split_part(name, '/', 1)
      )
    )
  );

CREATE POLICY "Team members can upload entregas equipe files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'entregas-equipe-skills'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.membros_equipe_skills m
        WHERE m.user_id = auth.uid()
          AND m.equipe_id::text = split_part(name, '/', 1)
      )
    )
  );

CREATE POLICY "Team members can delete entregas equipe files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'entregas-equipe-skills'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.membros_equipe_skills m
        WHERE m.user_id = auth.uid()
          AND m.equipe_id::text = split_part(name, '/', 1)
      )
    )
  );
