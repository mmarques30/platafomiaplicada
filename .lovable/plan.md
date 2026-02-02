
# Plano: Sistema de Acesso Gratuito com Expiração em 30 Dias + Cupons Dinâmicos

## Visão Geral

Implementar um sistema completo de controle de acesso para visitantes gratuitos com:
1. **Expiração automática após 30 dias** do cadastro
2. **Notificações progressivas** estilo "cookie notice" (popup inferior) antes da expiração
3. **Cupons dinâmicos baseados em engajamento** (12% padrão, 15% para usuários engajados)
4. **Controle administrativo** no painel de gestão de visitantes
5. **Bloqueio de acesso** após expiração (usuário mantido no banco, mas sem login)

---

## Estrutura do Sistema

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE ACESSO GRATUITO                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Cadastro ─────► Acesso Livre (30 dias) ─────► Bloqueio de Acesso  │
│     ↓                     ↓                           ↓            │
│  created_at          Notificações                conta_ativa=false │
│                     (7d, 3d, 1d)                  acesso_expirado   │
│                          ↓                                         │
│                    Cupom 12% ou 15%                                │
│                   (baseado em engajamento)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Parte 1: Alterações no Banco de Dados

### 1.1 Adicionar campos na tabela `profiles`

```sql
-- Campos para controle de expiração de visitantes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS acesso_expira_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS acesso_expirado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cupom_especial VARCHAR(50);
```

- `acesso_expira_em`: Data de expiração (created_at + 30 dias para visitantes)
- `acesso_expirado`: Flag que bloqueia o login
- `cupom_especial`: Cupom personalizado do visitante (Academy12 ou Academy15)

### 1.2 Criar tabela para notificações de expiração

```sql
CREATE TABLE public.visitor_expiration_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notice_type VARCHAR(20) NOT NULL, -- '7_dias', '3_dias', '1_dia'
  shown_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notice_type)
);

-- RLS
ALTER TABLE public.visitor_expiration_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem suas notificacoes" ON public.visitor_expiration_notices
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Sistema insere notificacoes" ON public.visitor_expiration_notices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Usuarios atualizam suas notificacoes" ON public.visitor_expiration_notices
  FOR UPDATE USING (auth.uid() = user_id);
```

### 1.3 Trigger para definir data de expiração no cadastro

```sql
CREATE OR REPLACE FUNCTION set_visitor_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_visitante = true THEN
    NEW.acesso_expira_em := NEW.created_at + INTERVAL '30 days';
    NEW.cupom_especial := 'Academy12'; -- Cupom padrão
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_visitor_expiration
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_visitor_expiration();
```

### 1.4 Função para verificar engajamento e atribuir cupom especial

```sql
CREATE OR REPLACE FUNCTION check_visitor_engagement(visitor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  access_count INTEGER;
  unique_days INTEGER;
  two_weeks_ago TIMESTAMP := NOW() - INTERVAL '14 days';
BEGIN
  -- Contar acessos únicos por dia nas últimas 2 semanas
  SELECT COUNT(DISTINCT DATE(accessed_at))
  INTO unique_days
  FROM content_access_logs cal
  JOIN profiles p ON cal.user_email = p.email
  WHERE p.id = visitor_id
    AND cal.accessed_at >= two_weeks_ago;
    
  -- Engajado = mais de 4 dias únicos de acesso (média de 2x por semana)
  RETURN unique_days >= 4;
END;
$$ LANGUAGE plpgsql;
```

---

## Parte 2: Edge Function para Processar Expirações

### 2.1 `process-visitor-expirations` (CRON diário)

Esta função será executada diariamente para:
1. Marcar visitantes expirados como `acesso_expirado = true`
2. Criar notificações pendentes para 7, 3 e 1 dia antes
3. Atualizar cupom para 15% se usuário for engajado

```typescript
// supabase/functions/process-visitor-expirations/index.ts
// Executa diariamente via CRON
// 1. Busca visitantes ativos
// 2. Para cada um, verifica dias restantes
// 3. Cria notificações apropriadas
// 4. Marca como expirado se passou de 30 dias
// 5. Atualiza cupom para Academy15 se engajado
```

---

## Parte 3: Componentes Frontend

### 3.1 Componente `VisitorExpirationNotice.tsx`

Popup estilo "cookie notice" fixo no rodapé da tela (inspirado no design do link fornecido):

```text
┌────────────────────────────────────────────────────────────────────┐
│  🎁  Seu acesso gratuito expira em 7 dias!                         │
│                                                                    │
│  Garanta 12% de desconto no Academy com o cupom Academy12.        │
│  [Copiar Cupom]  [Conhecer Academy]                   [✕ Fechar]  │
└────────────────────────────────────────────────────────────────────┘
```

**Variações por tempo restante:**
| Dias | Título | Urgência |
|------|--------|----------|
| 7 | "Seu acesso gratuito expira em 7 dias!" | Normal |
| 3 | "⏰ Restam apenas 3 dias de acesso gratuito!" | Moderada |
| 1 | "🚨 Último dia! Seu acesso expira amanhã" | Alta |

**Cupom dinâmico:**
- Usuário padrão: `Academy12` (12% desconto)
- Usuário engajado (+2x/semana): `Academy15` (15% desconto)

### 3.2 Hook `useVisitorExpiration.tsx`

```typescript
// Verifica status de expiração do visitante
// Retorna: diasRestantes, cupomEspecial, notificacaoPendente, isEngajado
// Marca notificação como vista quando popup é fechado
```

### 3.3 Integração no `MainLayout.tsx`

Adicionar o componente de notificação apenas para visitantes:

```tsx
{isVisitante && <VisitorExpirationNotice />}
```

---

## Parte 4: Bloqueio de Acesso

### 4.1 Modificar `useAuth.tsx` ou criar guard

Quando `acesso_expirado = true`:
1. Não permitir login
2. Redirecionar para página especial `/acesso-expirado`
3. Mostrar opção de upgrade para Academy com cupom

### 4.2 Página `/acesso-expirado`

```text
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│        ⏳ Seu período de acesso gratuito expirou               │
│                                                                │
│   Você aproveitou 30 dias explorando a comunidade IAplicada.  │
│   Para continuar sua jornada de aprendizado em IA, conheça    │
│   o Academy com desconto exclusivo!                            │
│                                                                │
│   Seu cupom especial: [Academy12]  📋                          │
│                                                                │
│   [Conhecer Academy] [Falar com Suporte]                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Parte 5: Painel Administrativo

### 5.1 Melhorias em `GerenciarVisitantes.tsx`

Adicionar colunas/informações:
- **Dias Restantes**: Countdown visual (badge verde/amarelo/vermelho)
- **Status**: Ativo / Expirando / Expirado
- **Cupom Atual**: Academy12 ou Academy15
- **Engajamento**: Baixo / Alto

Adicionar ações:
- **Estender Acesso**: +X dias (input)
- **Reativar Acesso**: Para usuários expirados
- **Alterar Cupom**: Manual override

### 5.2 Filtros adicionais

- Por status de expiração
- Por nível de engajamento
- Por cupom atribuído

---

## Parte 6: Atualização da Página de Cupons

### 6.1 Remover cupom de 10% e organizar

Cupons disponíveis:
- `Academy12` - 12% de desconto (padrão)
- `Academy15` - 15% de desconto (usuários engajados)

### 6.2 Exibição dinâmica do cupom correto

Se o visitante tem cupom especial (`Academy15`), mostrar esse em vez do padrão.

---

## Arquivos a Serem Criados/Modificados

### Novos arquivos:
1. `src/components/shared/VisitorExpirationNotice.tsx` - Popup de expiração
2. `src/hooks/useVisitorExpiration.tsx` - Hook de controle de expiração
3. `src/pages/AcessoExpirado.tsx` - Página para usuários bloqueados
4. `supabase/functions/process-visitor-expirations/index.ts` - Edge function CRON

### Arquivos modificados:
1. `src/pages/Cupons.tsx` - Cupons dinâmicos + remover 10%
2. `src/components/layout/MainLayout.tsx` - Adicionar notice de expiração
3. `src/pages/admin/GerenciarVisitantes.tsx` - Controles de expiração
4. `src/hooks/useAuth.tsx` - Verificação de acesso expirado
5. `src/App.tsx` - Rota para `/acesso-expirado`

### Migrações de banco:
1. Adicionar campos em `profiles`
2. Criar tabela `visitor_expiration_notices`
3. Criar triggers e functions

---

## Fluxo de Notificações

```text
Dia 1 (cadastro)     → Acesso liberado
...
Dia 23 (7 dias antes) → Popup: "Expira em 7 dias" + Cupom
Dia 27 (3 dias antes) → Popup: "Restam 3 dias" + Cupom  
Dia 29 (1 dia antes)  → Popup: "Último dia!" + Cupom
Dia 30               → conta_ativa = false, acesso_expirado = true
Dia 31+              → Redirect para /acesso-expirado
```

---

## Considerações Técnicas

### Segurança
- Cupons são definidos no backend, não podem ser manipulados pelo frontend
- A verificação de engajamento usa dados do servidor
- O bloqueio de acesso é feito via flag no banco (não apenas frontend)

### Performance
- Edge function CRON roda 1x/dia (baixo custo)
- Notificações são cacheadas no localStorage após dismissal
- Hook de expiração usa React Query com stale time alto

### UX
- Popup não é intrusivo (pode ser fechado)
- Reaparece em sessões diferentes até ser resolvido
- Cores e urgência aumentam conforme prazo diminui

