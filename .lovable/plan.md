

# StatusBadge semântico + integração nos 4 componentes

## 1. Novo componente: `src/components/ui/StatusBadge.tsx`
Componente que aceita `status` string e renderiza badge semântico com os estilos especificados:

| Status | Fundo | Texto | Label |
|--------|-------|-------|-------|
| ativo / concluido / aprovado | rgba(175,192,64,0.12) | #C0DD97 | Ativo / Concluído / Aprovado |
| em_andamento | rgba(74,159,224,0.12) | #85B7EB | Em andamento |
| pendente / aguardando | rgba(232,164,60,0.12) | #FAC775 | Pendente |
| cancelado / bloqueado | rgba(138,142,130,0.12) | #B4B2A9 | Bloqueado / Cancelado |
| critico / atrasado | rgba(232,104,74,0.12) | #F09595 | Crítico / Atrasado |

Estilo inline: `padding: 2px 10px`, `border-radius: 20px`, `font-size: 11px`, `font-weight: 500`, `display: inline-flex`.

Aceita prop opcional `label` para override do texto padrão.

## 2. MentoriaTarefas.tsx
Substituir a função `getStatusBadge` (linhas 91-100) por uso de `<StatusBadge>`. Mapear:
- `pendente` → status "pendente"
- `em_andamento` → status "em_andamento"
- `atrasada` → status "atrasado"
- `concluida` → status "concluido" (label "Concluída")

## 3. MentoriaValidacoes.tsx
Substituir a função `getStatusBadge` (linhas 81-91) por `<StatusBadge>`. Mapear:
- `pendente` → "pendente"
- `em_analise` → "em_andamento" (label "Em Análise")
- `aprovado` → "aprovado"
- `rejeitado` → "critico" (label "Rejeitado")
- `revisao_solicitada` → "pendente" (label "Revisão Solicitada")

## 4. MentoriaEntregas.tsx
Substituir o uso de Badge genérico no STATUS_CONFIG para usar `<StatusBadge>` no `renderEntregaCard`. O select dropdown mantém a lógica atual (não é badge de status).

## 5. MinhasDuvidas.tsx → AbaDuvidas.tsx
Substituir o Badge inline (linha 76) por `<StatusBadge>`:
- `respondida` → "concluido" (label "Respondida")
- `em_analise` → "em_andamento" (label "Em Análise")
- default → "pendente" (label "Aguardando")

## Arquivos
- **Novo**: `src/components/ui/StatusBadge.tsx`
- **Editados**: `MentoriaTarefas.tsx`, `MentoriaValidacoes.tsx`, `MentoriaEntregas.tsx`, `src/components/evolucao/AbaDuvidas.tsx`

