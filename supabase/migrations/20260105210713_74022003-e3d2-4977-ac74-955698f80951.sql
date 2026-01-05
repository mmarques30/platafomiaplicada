-- Drop table if partially created
DROP TABLE IF EXISTS public.conteudos_dashboard;

-- Criar tabela para conteúdos do dashboard (newsletters, notícias, dicas)
CREATE TABLE public.conteudos_dashboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('newsletter', 'noticia', 'dica')),
  titulo TEXT NOT NULL,
  resumo TEXT NOT NULL,
  conteudo TEXT,
  link_externo TEXT,
  imagem_url TEXT,
  destaque BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conteudos_dashboard ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read active content
CREATE POLICY "Authenticated users can read active content"
ON public.conteudos_dashboard
FOR SELECT
USING (auth.uid() IS NOT NULL AND ativo = true);

-- Policy: Admins can manage all content (using user_roles table)
CREATE POLICY "Admins can manage all content"
ON public.conteudos_dashboard
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_conteudos_dashboard_updated_at
BEFORE UPDATE ON public.conteudos_dashboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial content for demonstration
INSERT INTO public.conteudos_dashboard (tipo, titulo, resumo, destaque) VALUES
('newsletter', 'Como a IA está transformando o mercado em 2025', 'Nesta edição, exploramos as principais tendências de IA que estão redefinindo como trabalhamos e criamos valor nas organizações.', true),
('newsletter', 'Ferramentas de IA que você precisa conhecer', 'Curadoria das melhores ferramentas de IA lançadas este mês, com análise prática de como utilizá-las no dia a dia.', false),
('noticia', 'OpenAI lança novo modelo GPT-5', 'O novo modelo promete avanços significativos em raciocínio e capacidade de contexto, revolucionando aplicações empresariais.', true),
('noticia', 'Google anuncia Gemini 3.0 Pro', 'Nova versão do Gemini traz melhorias em multimodalidade e processamento de documentos complexos.', false),
('dica', 'Use prompts estruturados para resultados melhores', 'Estruture seus prompts em: Contexto, Tarefa, Formato e Exemplo. Isso aumenta a precisão das respostas em até 40%.', true),
('dica', 'Automatize tarefas repetitivas com IA', 'Identifique 3 tarefas que você faz diariamente e que podem ser automatizadas com ferramentas de IA generativa.', false);