
# Plano: Corrigir Favoritos e Adicionar Avaliação de Ferramentas

## Problema 1: Erro ao Favoritar Ferramentas

### Diagnóstico
As políticas RLS da tabela `favoritos` estão configuradas para `roles: {public}` em vez de `roles: {authenticated}`. Isso pode causar problemas de autenticação dependendo do estado da sessão do usuário.

### Solução
Recriar as políticas RLS com target role correto (`authenticated`):

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own favoritos" ON favoritos;
DROP POLICY IF EXISTS "Users can create their own favoritos" ON favoritos;
DROP POLICY IF EXISTS "Users can delete their own favoritos" ON favoritos;

-- Criar novas políticas para usuários autenticados
CREATE POLICY "Users can view their own favoritos"
ON favoritos FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favoritos"
ON favoritos FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favoritos"
ON favoritos FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

---

## Problema 2: Membros Pagantes Não Podem Avaliar Ferramentas

### Diagnóstico
- A tabela `ferramentas_ia` possui campos `avaliacao_comunidade` e `total_avaliacoes_comunidade`
- **Não existe uma tabela para armazenar avaliações individuais** (similar a `video_ratings`)
- Não há componente de UI para os usuários avaliarem ferramentas

### Solução
Criar estrutura completa de avaliação de ferramentas similar ao sistema de avaliação de vídeos:

#### 1. Criar tabela `avaliacoes_ferramentas_ia`

```sql
CREATE TABLE avaliacoes_ferramentas_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta_id UUID NOT NULL REFERENCES ferramentas_ia(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ferramenta_id, user_id)
);

-- Habilitar RLS
ALTER TABLE avaliacoes_ferramentas_ia ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas mentorados e admins podem avaliar (não visitantes)
CREATE POLICY "Usuarios podem ver todas as avaliacoes"
ON avaliacoes_ferramentas_ia FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Mentorados podem criar avaliacoes"
ON avaliacoes_ferramentas_ia FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  (has_role(auth.uid(), 'mentorado') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Usuarios podem atualizar suas avaliacoes"
ON avaliacoes_ferramentas_ia FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar suas avaliacoes"
ON avaliacoes_ferramentas_ia FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

#### 2. Criar trigger para atualizar média na tabela `ferramentas_ia`

```sql
CREATE OR REPLACE FUNCTION update_ferramenta_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ferramentas_ia
  SET 
    avaliacao_comunidade = (
      SELECT AVG(nota) FROM avaliacoes_ferramentas_ia 
      WHERE ferramenta_id = COALESCE(NEW.ferramenta_id, OLD.ferramenta_id)
    ),
    total_avaliacoes_comunidade = (
      SELECT COUNT(*) FROM avaliacoes_ferramentas_ia 
      WHERE ferramenta_id = COALESCE(NEW.ferramenta_id, OLD.ferramenta_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.ferramenta_id, OLD.ferramenta_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_avaliacao_ferramenta_change
AFTER INSERT OR UPDATE OR DELETE ON avaliacoes_ferramentas_ia
FOR EACH ROW EXECUTE FUNCTION update_ferramenta_rating_stats();
```

#### 3. Criar hook `useFerramentaRating` 

Arquivo: `src/hooks/useFerramentaRating.tsx`

Similar ao `useVideoRating.tsx`, mas para ferramentas:
- Buscar média de avaliação da ferramenta
- Buscar avaliação do usuário atual
- Mutation para criar/atualizar avaliação

#### 4. Criar componente de avaliação no modal de detalhes

Arquivo: `src/components/bibliotecas/FerramentaDetalhesModal.tsx`

Adicionar seção de avaliação:
- Mostrar média atual e total de avaliações
- Permitir que mentorados (não visitantes) avaliem com 1-5 estrelas
- Mostrar mensagem para visitantes indicando que precisam de plano ativo

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabela, políticas e trigger |
| `src/hooks/useFerramentaRating.tsx` | **CRIAR** - Hook para gerenciar avaliações |
| `src/components/bibliotecas/FerramentaDetalhesModal.tsx` | **MODIFICAR** - Adicionar UI de avaliação |

---

## Fluxo para Usuários

```text
Mentorado (Academy, Lab, Skills, Club):
  ├─ Acessa Biblioteca de Ferramentas
  ├─ Clica em "Ver Detalhes" de uma ferramenta
  ├─ Vê seção "Avaliar esta ferramenta"
  ├─ Clica nas estrelas (1-5)
  └─ Sistema salva e atualiza média automaticamente

Visitante:
  ├─ Acessa Biblioteca de Ferramentas
  ├─ Clica em "Ver Detalhes"
  └─ Vê mensagem: "Adquira um plano para avaliar ferramentas"
```

---

## Resultado Esperado

- Erro de favoritos resolvido com políticas RLS corrigidas
- Mentorados podem avaliar ferramentas de 1 a 5 estrelas
- Média de avaliação da comunidade calculada automaticamente
- Visitantes veem as avaliações mas não podem avaliar
- Admins podem avaliar normalmente
