
# Plano: Corrigir Regra de Cupom Academy15 para Visitantes Engajados

## Diagnóstico do Problema

### Por que nenhum visitante recebeu o cupom Academy15?

**Problema 1: Regra muito restritiva**
A função atual `check_visitor_engagement` verifica se o visitante acessou a plataforma em **4 dias diferentes nas últimas 2 semanas**:

```sql
-- Regra atual (muito restritiva)
SELECT COUNT(DISTINCT DATE(accessed_at)) >= 4
FROM content_access_logs
WHERE accessed_at >= NOW() - INTERVAL '14 days'
```

**Problema 2: A função não é executada automaticamente**
A função `check_visitor_engagement` só é chamada pela edge function `process-visitor-expirations`, que precisa ser acionada manualmente ou via cron job (não configurado).

---

## Dados Atuais

| Situação | Quantidade |
|----------|------------|
| Total de visitantes | 150 |
| Visitantes com Academy12 | 150 |
| Visitantes com Academy15 | 0 |
| **Visitantes com 10+ acessos** | **8** |

### Top visitantes por acessos:
| Email | Acessos |
|-------|---------|
| marcosmartinsdeoliveira75@gmail.com | 20 |
| robertocr@me.com | 19 |
| anavmguimaraes@hotmail.com | 17 |
| aarmelin@uol.com.br | 15 |
| silgoliveira06@gmail.com | 14 |
| mariana.mrcabral@gmail.com | 12 |
| wanpereira15@gmail.com | 12 |
| ellenrejo@hotmail.com | 11 |

---

## Solução Proposta

### 1. Atualizar a função `check_visitor_engagement`

**Nova regra:** Visitante é engajado se consumiu **10 ou mais conteúdos** (total, sem limite de tempo).

```sql
CREATE OR REPLACE FUNCTION check_visitor_engagement(visitor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_acessos INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO total_acessos
  FROM content_access_logs cal
  JOIN profiles p ON cal.user_email = p.email
  WHERE p.id = visitor_id;
    
  RETURN COALESCE(total_acessos, 0) >= 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### 2. Atualizar visitantes existentes que já se qualificam

```sql
-- Atualizar cupom para visitantes que já têm 10+ acessos
UPDATE public.profiles p
SET cupom_especial = 'Academy15'
WHERE p.is_visitante = true
  AND (
    SELECT COUNT(*)
    FROM content_access_logs cal
    WHERE cal.user_email = p.email
  ) >= 10;
```

### 3. Atualizar descrição do cupom na tabela

```sql
UPDATE public.cupons_visitantes
SET descricao = 'Cupom para visitantes engajados (consumiram +10 conteúdos)'
WHERE codigo = 'Academy15';
```

---

## Arquivos a Serem Modificados

| Tipo | Descrição |
|------|-----------|
| Migração SQL | Atualizar função + cupons existentes + descrição |

---

## Resultado Esperado

Após a migração:
- **8 visitantes** serão automaticamente atualizados para cupom Academy15
- Novos visitantes que atingirem 10+ acessos serão elegíveis quando a edge function rodar
- A descrição do cupom refletirá a nova regra

---

## Validação

Após a migração, a consulta deve retornar:
```
Academy12: ~142 visitantes
Academy15: 8 visitantes
```
