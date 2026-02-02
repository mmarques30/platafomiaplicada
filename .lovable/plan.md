

# Plano: Consolidar Conteúdos de Criadores na Central

## Resumo

Unificar a gestão de conteúdos de "Criadores" em um único local: **Gerenciar Conteúdo > Central**. Remover a duplicidade de administração que existe atualmente entre "Gerenciar Comunidade > Criadores" e a Central.

## Situação Atual

| Local | Tabela | Tipos de Conteúdo |
|-------|--------|-------------------|
| Gerenciar Conteúdo > Central | `conteudos_dashboard` | Newsletter, Notícia, Dica, Material |
| Gerenciar Comunidade > Criadores | `materiais_comunidade` | Prompt, Imagem, Documento, Template, Outro |

## Solução Proposta

### 1. Expandir Tipos na Central

Adicionar um novo tipo `criador` à tabela `conteudos_dashboard` para unificar a gestão. Assim os tipos ficam:
- Newsletter
- Notícia  
- Dica
- Material
- **Criador** (novo)

### 2. Adicionar Categorias à Central

Criar um novo campo `categoria` na tabela `conteudos_dashboard` que só será obrigatório quando o tipo for `criador`:
- ChatGPT
- Claude
- Midjourney
- Canva
- Notion
- Excel
- Outro

### 3. Editor de Formatação Automática

Adicionar botão "Formatar com IA" no modal de conteúdo que:
1. Envia o texto bruto para uma edge function
2. A IA aplica formatação Markdown (títulos, listas, negrito, parágrafos)
3. Retorna o texto formatado **sem excluir conteúdo**
4. Usa o Gemini Flash (já disponível no projeto)

### 4. Remover Aba Criadores da Comunidade Gratuita

Simplificar o painel `GerenciarComunidade.tsx` removendo a sub-aba "Criadores".

---

## Mudanças Técnicas

### Banco de Dados

```sql
-- 1. Adicionar coluna categoria à tabela conteudos_dashboard
ALTER TABLE public.conteudos_dashboard 
ADD COLUMN categoria TEXT DEFAULT NULL;

-- 2. Adicionar coluna criador_id para vincular ao perfil do criador
ALTER TABLE public.conteudos_dashboard 
ADD COLUMN criador_id UUID REFERENCES public.profiles(id);

-- 3. Adicionar coluna arquivos_url para múltiplos arquivos
ALTER TABLE public.conteudos_dashboard 
ADD COLUMN arquivos_url JSONB DEFAULT '[]'::jsonb;
```

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/admin/useConteudosDashboardAdmin.tsx` | Adicionar tipo `criador`, campos `categoria`, `criador_id`, `arquivos_url` |
| `src/components/admin/content/ConteudoModal.tsx` | Adicionar seletor de categoria (visível só para tipo `criador`), seletor de criador, upload de múltiplos arquivos, botão "Formatar com IA" |
| `src/components/admin/content/CentralTab.tsx` | Adicionar filtro por categoria, exibir criador na tabela |
| `src/pages/admin/GerenciarComunidade.tsx` | Remover sub-aba "Criadores" da Comunidade Gratuita |
| Nova edge function: `formatar-texto-conteudo` | Formatar texto bruto com IA mantendo todo o conteúdo |

### Arquivos a Remover (manter para histórico)

Os arquivos do antigo sistema de Criadores podem ser mantidos mas não serão mais usados na interface admin:
- `src/components/admin/comunidade/CriadoresTab.tsx` (remover do import)
- `src/components/admin/comunidade/MaterialCriadoresModal.tsx` (pode manter para referência)

---

## Fluxo do Editor com Formatação

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Modal de Conteúdo                           │
├─────────────────────────────────────────────────────────────────┤
│  Tipo: [Criador ▼]         Categoria: [ChatGPT ▼]               │
│                                                                  │
│  Título: [________________________________]                      │
│                                                                  │
│  Resumo: [________________________________]                      │
│                                                                  │
│  Conteúdo:                                                       │
│  ┌──────────────────────────────────────────┐  ┌──────────────┐ │
│  │ Texto bruto ou formatado...              │  │ Formatar     │ │
│  │                                          │  │ com IA       │ │
│  │                                          │  └──────────────┘ │
│  │                                          │                    │
│  └──────────────────────────────────────────┘                    │
│                                                                  │
│  Arquivos: [+ Adicionar arquivos]                               │
│    📄 documento.pdf  [X]                                         │
│    📄 template.docx  [X]                                         │
│                                                                  │
│  Criador: [Selecione um membro ▼]                               │
│                                                                  │
│  ☐ Destaque  ☑ Ativo  ☑ Visível para Gratuitos                  │
│                                                                  │
│                              [Cancelar] [Salvar]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Edge Function: formatar-texto-conteudo

Função para formatar texto mantendo todo o conteúdo original:

**Comportamento:**
- Recebe texto bruto
- Aplica formatação Markdown:
  - Identifica títulos e aplica `#`, `##`, `###`
  - Converte listas para `-` ou `1.`
  - Aplica **negrito** para termos importantes
  - Separa parágrafos com quebras de linha
  - Mantém **100% do conteúdo original**
- Retorna texto formatado

---

## Resultado Final

### Antes
```text
Admin > Comunicação > Comunidade > Gratuita > Criadores
Admin > Conteúdo > Central
```

### Depois  
```text
Admin > Conteúdo > Central (unificado com tipo "Criador")
```

### Tipos na Central (após mudança)

| Tipo | Descrição | Categoria |
|------|-----------|-----------|
| Newsletter | Newsletters periódicas | - |
| Notícia | Notícias do mercado | - |
| Dica | Dicas rápidas | - |
| Material | Materiais de aulas ao vivo | - |
| **Criador** | Contribuições da comunidade | ChatGPT, Claude, Midjourney, etc. |

