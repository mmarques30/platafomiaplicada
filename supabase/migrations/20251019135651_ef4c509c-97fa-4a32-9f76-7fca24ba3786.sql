-- =====================================================
-- PLANO DE SEGURANÇA COMPLETO
-- =====================================================

-- 1. POLÍTICA: Apenas perfis com conta ativa podem ser acessados
CREATE POLICY "Only active accounts can be accessed"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  conta_ativa = true OR
  auth.uid() = id OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 2. ATUALIZAR POLÍTICAS RLS: Exigir roles em tabelas principais

-- Videos: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active videos" ON public.videos;
CREATE POLICY "Users with roles can view active videos" 
ON public.videos
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Trilhas: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active trilhas" ON public.trilhas;
CREATE POLICY "Users with roles can view active trilhas" 
ON public.trilhas
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Módulos: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active modulos" ON public.modulos;
CREATE POLICY "Users with roles can view active modulos" 
ON public.modulos
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Exercícios: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active exercicios" ON public.exercicios_praticos;
CREATE POLICY "Users with roles can view active exercicios" 
ON public.exercicios_praticos
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Biblioteca de Prompts: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active prompts" ON public.biblioteca_prompts;
CREATE POLICY "Users with roles can view active prompts" 
ON public.biblioteca_prompts
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Métodos Aplicar: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active metodos" ON public.metodos_aplicar;
CREATE POLICY "Users with roles can view active metodos" 
ON public.metodos_aplicar
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- IA Copie e Use: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active ia_copie_use" ON public.ia_copie_use;
CREATE POLICY "Users with roles can view active ia_copie_use" 
ON public.ia_copie_use
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Ferramentas IA: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active ferramentas_ia" ON public.ferramentas_ia;
CREATE POLICY "Users with roles can view active ferramentas_ia" 
ON public.ferramentas_ia
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- Categorias: Exigir role válida
DROP POLICY IF EXISTS "Authenticated users can view active categorias" ON public.categorias_modulos;
CREATE POLICY "Users with roles can view active categorias" 
ON public.categorias_modulos
FOR SELECT
TO authenticated
USING (
  ativo = true AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'mentorado'::app_role) OR
    has_role(auth.uid(), 'aluno_trilha'::app_role)
  )
);

-- 3. CRIAR TABELA DE AUDITORIA DE ACESSOS NÃO AUTORIZADOS
CREATE TABLE IF NOT EXISTS public.tentativas_acesso_nao_autorizado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  ip_address text,
  user_agent text,
  tentativa_acesso_a text,
  timestamp timestamptz DEFAULT now()
);

-- RLS na tabela de auditoria (apenas admins podem ver)
ALTER TABLE public.tentativas_acesso_nao_autorizado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view access attempts"
ON public.tentativas_acesso_nao_autorizado
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. COMENTÁRIOS EXPLICATIVOS
COMMENT ON POLICY "Only active accounts can be accessed" ON public.profiles IS 
  'Garante que apenas contas ativas podem acessar dados. Admins e o próprio usuário podem ver mesmo se inativo.';

COMMENT ON TABLE public.tentativas_acesso_nao_autorizado IS 
  'Registra tentativas de acesso de usuários sem autorização (sem roles ou conta inativa).';