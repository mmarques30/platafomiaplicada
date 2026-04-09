

# Reestruturação da Seção de Documentos — Business/Business iAplicada

## Resumo

Transformar a aba "Documentos" de uma listagem simples de arquivos e links em um hub documental completo com 3 seções: **Arquivos do Projeto** (upload/download de logos, PDFs, imagens), **Anotações** (editor tipo Notion por projeto), e **Links Importantes** (já existente). Aplicar tanto no painel admin quanto na visão do mentorado.

## Novas tabelas no banco

| Tabela | Propósito |
|---|---|
| `notas_projeto_business` | Anotações estilo Notion por contrato — rich text, por projeto/seção |

```sql
CREATE TABLE public.notas_projeto_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos_business(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Sem título',
  conteudo TEXT DEFAULT '',  -- markdown/rich text
  categoria TEXT DEFAULT 'geral',  -- 'geral', 'reuniao', 'decisao', 'tecnico'
  ordem INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE notas_projeto_business ENABLE ROW LEVEL SECURITY;
-- Admin full access
CREATE POLICY "Admin full access notas" ON notas_projeto_business
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));
-- User read own notes
CREATE POLICY "User read own notas" ON notas_projeto_business
  FOR SELECT TO authenticated
  USING (contrato_id IN (SELECT id FROM contratos_business WHERE user_id = auth.uid()));
```

Atualizar `documentos_business` para aceitar novos tipos de arquivo (imagens, logos):
- Adicionar tipo `'imagem'` e `'logo'` ao campo `tipo` (já é TEXT livre, sem enum, então basta usar no código)

## Alterações no bucket de storage

O bucket `contratos-business` já existe e suporta qualquer tipo de arquivo. Ampliar os `accept` no upload para incluir `.png,.jpg,.jpeg,.gif,.svg,.webp,.zip`.

## Arquivos a criar/editar

| Arquivo | Ação |
|---|---|
| **Migration SQL** | Criar tabela `notas_projeto_business` |
| `src/hooks/useNotasProjetoBusiness.ts` | **Criar** — hook CRUD para notas |
| `src/components/admin/business/DocumentosBusinessManager.tsx` | **Editar** — reestruturar em 3 sub-abas: Arquivos, Anotações, Links |
| `src/components/admin/business/NotasProjetoSection.tsx` | **Criar** — componente de anotações estilo Notion (criar/editar/excluir notas em markdown) |
| `src/components/admin/business/ArquivosProjetoSection.tsx` | **Criar** — seção de upload/gerenciamento de arquivos expandida (aceita imagens, PDFs, logos, zip) |
| `src/pages/MentoriaDocumentos.tsx` | **Editar** — reestruturar com as mesmas 3 abas (Arquivos, Anotações, Links) na visão do mentorado |

## Detalhes da interface

### Admin (`DocumentosBusinessManager`)
Substituir as 2 tabs atuais (Documentos / Links) por 3:

1. **Arquivos** — Upload expandido aceitando PDF, DOCX, imagens (PNG/JPG/SVG), ZIP. Tipos: Contrato, Anexo, Solução, Logo, Imagem, Outro. Grid visual com preview de imagens e ícones por tipo.

2. **Anotações** — Lista de notas com título editável e conteúdo em textarea (markdown). Categorias: Geral, Reunião, Decisão, Técnico. Botão "Nova Anotação" cria uma nota vazia. Cada nota é um card expansível com editor inline.

3. **Links** — Mantém o comportamento atual sem alterações.

### Mentorado (`MentoriaDocumentos`)
Substituir as 3 tabs atuais (Downloads / Links / Reports) por 4:

1. **Arquivos** — Downloads + visualização de imagens/logos
2. **Anotações** — Leitura das notas criadas pelo admin (somente leitura)
3. **Links** — Mantém comportamento atual
4. **Reports** — Mantém comportamento atual

### Hook `useNotasProjetoBusiness`
- `useQuery` para listar notas por `contrato_id`
- `createNota` mutation
- `updateNota` mutation (título + conteúdo)
- `deleteNota` mutation

