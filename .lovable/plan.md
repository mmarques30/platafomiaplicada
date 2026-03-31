

# Link direto para reunião nas sessões de mentoria

## Resumo
Adicionar campo `link_reuniao` na tabela `sessoes_mentoria`, input no admin, e botões contextuais na listagem do mentorado e no `BusinessVisaoRapida`.

## Alterações

### 1. Migração SQL
```sql
ALTER TABLE public.sessoes_mentoria ADD COLUMN link_reuniao TEXT DEFAULT NULL;
```

### 2. Tipo TypeScript
**Arquivo: `src/hooks/useMentoriaSessoes.tsx`**
- Adicionar `link_reuniao?: string;` ao type `SessaoMentoria`

### 3. Admin — Campo no modal de sessão
**Arquivo: `src/components/admin/mentoria/SessaoModal.tsx`**
- Adicionar input `link_reuniao` com label "Link da Reunião (Zoom, Meet, Teams)" após o campo `video_url`
- Placeholder: `https://zoom.us/j/... ou https://meet.google.com/...`
- Incluir no `reset()` do useEffect

### 4. Listagem do mentorado — Botões contextuais
**Arquivo: `src/pages/MentoriaSessoes.tsx`**
- Importar `ExternalLink` e `differenceInHours`
- Adicionar coluna "Reunião" na tabela (entre Status e Recursos)
- Lógica por sessão:
  - **Sessão agendada, dentro de 24h, com link**: Botão destacado `variant="default"` "Entrar" com ícone ExternalLink, `onClick` abre `link_reuniao` em nova aba
  - **Sessão agendada, mais de 24h, com link**: Link discreto `text-xs text-primary hover:underline` "Link da reunião"
  - **Sessão sem link ou passada/cancelada**: `-`

### 5. BusinessVisaoRapida — Usar `link_reuniao` em vez de `video_url`
**Arquivo: `src/components/mentoria/business/BusinessVisaoRapida.tsx`**
- Na query de próxima sessão, o `select("*")` já traz `link_reuniao`
- Substituir a lógica que usa `video_url` pelo `link_reuniao`:
  - Se `link_reuniao` existe e sessão dentro de 24h: botão destacado "Entrar na reunião"
  - Se `link_reuniao` existe mas +24h: link discreto
  - Sem link: "Aguardando link" (como já está)

## Arquivos
- **Migração SQL**: nova coluna `link_reuniao`
- **Editados**: `useMentoriaSessoes.tsx` (tipo), `SessaoModal.tsx` (input), `MentoriaSessoes.tsx` (coluna), `BusinessVisaoRapida.tsx` (link)

