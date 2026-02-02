
# Plano: Migrar Criadores para Central com Opção de Visibilidade

## Contexto Atual

### Sistema Existente
1. **Sala de Aula** (`/videos-bonus`) tem 3 abas:
   - Aula (vídeos gratuitos)
   - Materiais 
   - **Criadores** (contribuições da comunidade via `CriadoresComunidadeTab`)

2. **Central** (`/central`) tem apenas conteúdos administrativos:
   - Notícias IA
   - Dicas Práticas
   - Newsletter

3. **Ferramentas Compartilhadas** - sistema legado em `MinhaEvolucaoDetalhada.tsx` com modal `CompartilharFerramentaModal` que usa tabela `ferramentas_compartilhadas`

### O que o usuário quer
- Mover a funcionalidade de "Criadores" para a página **Central**
- Membros Academy, Skills e Business podem contribuir com materiais
- Permitir escolher **visibilidade**: comunidade gratuita ou paga
- Remover o formato antigo da Sala de Aula

## Alterações Necessárias

### 1. Banco de Dados - Adicionar Campo de Visibilidade

**Migração SQL:**
```sql
ALTER TABLE materiais_comunidade 
ADD COLUMN visibilidade TEXT NOT NULL DEFAULT 'pago';
```

**Valores:**
- `gratuito` - Visível para todos (visitantes + pagantes)
- `pago` - Visível apenas para Academy, Skills, Business

### 2. Central.tsx - Adicionar Aba "Criadores"

**Arquivo:** `src/pages/Central.tsx`

**Alterações:**
- Adicionar nova aba "Criadores" ao `TabsList`
- Importar e renderizar `CriadoresComunidadeTab` no `TabsContent`
- Ajustar tabs válidas para incluir "criadores"

```tsx
const tabs = [
  { value: "todos", label: "Todos", icon: FileText },
  { value: "noticia", label: "Notícias IA", icon: Globe },
  { value: "dica", label: "Dicas Práticas", icon: Lightbulb },
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "criadores", label: "Criadores", icon: Users }, // NOVO
];
```

### 3. AdicionarMaterialModal.tsx - Adicionar Campo Visibilidade

**Arquivo:** `src/components/comunidade/AdicionarMaterialModal.tsx`

**Alterações:**
- Adicionar state `visibilidade` com valor padrão "pago"
- Adicionar Select para escolher visibilidade:
  - "Comunidade Gratuita" (`gratuito`)
  - "Comunidade Paga" (`pago`)
- Enviar campo `visibilidade` ao criar material

### 4. CriadoresComunidadeTab.tsx - Filtrar por Visibilidade

**Arquivo:** `src/components/comunidade/CriadoresComunidadeTab.tsx`

**Alterações:**
- Ajustar permissão de contribuição para incluir Skills
- Passar parâmetro de visibilidade baseado no plano do usuário

### 5. useMateriaisComunidade.tsx - Filtrar por Visibilidade

**Arquivo:** `src/hooks/useMateriaisComunidade.tsx`

**Alterações:**
- Adicionar parâmetro `visibilidade` ao options
- Filtrar materiais baseado na visibilidade permitida ao usuário:
  - Visitantes: apenas `visibilidade = 'gratuito'`
  - Pagantes (Academy/Skills/Business): todos os materiais

### 6. useMaterialComunidadeSubmit.tsx - Incluir Visibilidade

**Arquivo:** `src/hooks/useMaterialComunidadeSubmit.tsx`

**Alterações:**
- Adicionar campo `visibilidade` ao `MaterialSubmitData`
- Enviar campo ao inserir no banco

### 7. VideosBonus.tsx - Remover Aba Criadores

**Arquivo:** `src/pages/VideosBonus.tsx`

**Alterações:**
- Remover importação de `CriadoresComunidadeTab`
- Remover `TabsTrigger` e `TabsContent` de "criadores"
- Manter apenas "Aula" e "Materiais"

### 8. Limpeza - Remover Sistema Legado (Opcional)

**Arquivos afetados:**
- `src/components/evolucao/MinhaEvolucaoDetalhada.tsx` - Remover botão "Compartilhar Nova Ferramenta"
- `src/components/evolucao/CompartilharFerramentaModal.tsx` - Pode ser removido
- `src/components/evolucao/FerramentasCompartilhadasList.tsx` - Pode ser removido
- `src/hooks/useFerramentasCompartilhadas.tsx` - Pode ser removido

## Fluxo do Usuário

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        CENTRAL DE CONTEÚDO                          │
├─────────────────────────────────────────────────────────────────────┤
│  [Todos] [Notícias] [Dicas] [Newsletter] [Criadores]               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Aba "Criadores":                                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ [Filtro Tipo ▼]  [Filtro Categoria ▼]           [+ Contribuir]│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Visitantes: veem apenas materiais com visibilidade "gratuito"     │
│  Pagantes: veem todos os materiais                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Modal de Contribuição (Atualizado)

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Contribuir com a Comunidade                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Nome da Ferramenta *                                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Ex: Gerador de Headlines para LinkedIn                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                   │
│  │ Categoria *     ▼  │  │ Tipo *          ▼  │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
│                                                                     │
│  Visibilidade *                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ○ Comunidade Gratuita - Visível para todos                   │  │
│  │ ● Comunidade Paga - Apenas mentorados                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Descrição                                                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Prompt ou Orientação                                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Arquivos (PDF, PPTX, DOCX, TXT, MD)                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           [Clique para adicionar arquivos]                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│              [Cancelar]  [Enviar para Aprovação]                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Lógica de Acesso

| Usuário | Pode Contribuir | Vê Materiais |
|---------|-----------------|--------------|
| Visitante | Não | Apenas `gratuito` |
| Academy | Sim | Todos |
| Skills | Sim | Todos |
| Business | Sim | Todos |
| Admin | Sim | Todos |

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| **Banco de Dados** | Adicionar coluna `visibilidade` |
| `src/pages/Central.tsx` | Adicionar aba "Criadores" |
| `src/pages/VideosBonus.tsx` | Remover aba "Criadores" |
| `src/components/comunidade/AdicionarMaterialModal.tsx` | Adicionar campo visibilidade |
| `src/components/comunidade/CriadoresComunidadeTab.tsx` | Ajustar permissões (incluir Skills) |
| `src/hooks/useMateriaisComunidade.tsx` | Filtrar por visibilidade e plano |
| `src/hooks/useMaterialComunidadeSubmit.tsx` | Incluir visibilidade ao criar |
| `src/components/evolucao/MinhaEvolucaoDetalhada.tsx` | Remover botão legado |
| Componentes legados `ferramentas_compartilhadas` | Remover (limpeza) |

## Resultado Final

- Central terá nova aba "Criadores" para contribuições da comunidade
- Usuários Academy, Skills e Business podem contribuir
- Ao contribuir, escolhem se o material é visível para todos ou apenas pagantes
- Visitantes veem apenas materiais marcados como gratuitos
- Sistema legado de "Ferramentas Compartilhadas" será removido
- Sala de Aula manterá apenas Aula e Materiais
