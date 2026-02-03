
# Plano: Restaurar Botão "Contribuir" na Aba Materiais

## Contexto

O botão de contribuição (para compartilhar materiais) está funcionando corretamente na aba "Criadores" da Sala de Aula (`/videos-bonus?tab=criadores`), porém **nunca foi implementado** na aba "Materiais" da página Métodos para Aplicar (`/metodos-aplicar?tab=materiais`).

O componente `MateriaisBibliotecaTab.tsx` atualmente exibe apenas os materiais da comunidade, sem permitir que os membros contribuam com novos materiais.

## Requisitos Confirmados

1. **Quem pode contribuir**: Usuários autenticados dos planos Academy, Skills e Business (não visitantes)
2. **Tipos permitidos**: Vários tipos (Prompt, Documento, Template, Imagem, Ferramenta, etc.)
3. **Visibilidade configurável pelo membro**: O usuário escolhe se o material será visível para:
   - **"Comunidade Gratuita"** (visibilidade = "gratuito"): Visitantes E membros veem
   - **"Comunidade Paga"** (visibilidade = "pago"): Apenas membros veem
4. **Moderação**: Materiais enviados precisam de aprovação do admin antes de ficarem visíveis (`ativo = false`)

## Solução

Reutilizar o modal `AdicionarMaterialModal` que já existe e funciona perfeitamente na aba Criadores. Este modal já possui:
- Seleção de tipo e categoria
- Opção de visibilidade (Gratuito ou Pago) com ícones e descrições claras
- Upload de múltiplos arquivos
- Campo de descrição e prompt/orientação
- Envio para aprovação (`ativo = false`)

## Alterações Técnicas

### Arquivo: `src/components/biblioteca/MateriaisBibliotecaTab.tsx`

1. **Adicionar imports necessários**:
   - `Button` de `@/components/ui/button`
   - `Plus` de `lucide-react`
   - `AdicionarMaterialModal` de `@/components/comunidade/AdicionarMaterialModal`
   - `useAuth` de `@/hooks/useAuth`
   - `useUserRole` de `@/hooks/useUserRole`
   - `useState` (já importado)

2. **Adicionar estado para controlar o modal**:
   ```typescript
   const [showAddModal, setShowAddModal] = useState(false);
   ```

3. **Adicionar lógica de permissão**:
   ```typescript
   const { user } = useAuth();
   const { isVisitante, isLoading: isPlanLoading } = useUserRole();
   
   // Apenas membros autenticados (não visitantes) podem contribuir
   const canContribute = !!user && !isPlanLoading && !isVisitante;
   ```

4. **Adicionar botão "Contribuir" na área de filtros**:
   - Posicionado à direita dos dropdowns de filtro
   - Visível apenas quando `canContribute` é verdadeiro
   - Estilo consistente com o resto da interface

5. **Renderizar o modal ao final do componente**:
   ```tsx
   <AdicionarMaterialModal
     open={showAddModal}
     onOpenChange={setShowAddModal}
   />
   ```

## Layout Visual

```text
┌────────────────────────────────────────────────────────────────────┐
│  ANTES (atual)                                                     │
├────────────────────────────────────────────────────────────────────┤
│  [Buscar materiais...] [Tipo ▼] [Categoria ▼]                      │
│                                                                    │
│  Cards de materiais...                                             │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  DEPOIS (com botão)                                                │
├────────────────────────────────────────────────────────────────────┤
│  [Buscar materiais...] [Tipo ▼] [Categoria ▼]   [+ Contribuir]     │
│                                                                    │
│  Cards de materiais...                                             │
│                                                                    │
│  + AdicionarMaterialModal (renderizado quando showAddModal=true)   │
└────────────────────────────────────────────────────────────────────┘
```

## Fluxo do Usuário

1. Membro (Academy/Skills/Business) acessa `/metodos-aplicar?tab=materiais`
2. Vê o botão "Contribuir" à direita dos filtros
3. Clica no botão → abre o modal `AdicionarMaterialModal`
4. Preenche os campos:
   - Nome da ferramenta/material
   - Tipo e Categoria
   - **Visibilidade**: "Comunidade Gratuita" (todos veem) ou "Comunidade Paga" (só membros)
   - Descrição (opcional)
   - Prompt/Orientação (opcional)
   - Arquivos (PDF, PPTX, DOCX, TXT, MD)
5. Envia → material fica com `ativo = false` aguardando aprovação
6. Toast de sucesso: "Material enviado para aprovação!"
7. Admin aprova no painel → material aparece para a comunidade

## Reutilização de Código

O modal `AdicionarMaterialModal` já implementa:
- Validação de campos obrigatórios
- Upload de arquivos para o storage `materiais-comunidade`
- Inserção na tabela `materiais_comunidade` com `ativo = false`
- Seleção de visibilidade com RadioGroup
- Feedback visual durante envio

Não é necessário criar nenhum componente ou hook novo.

## Resultado Esperado

Após a implementação, membros dos planos Academy, Skills e Business poderão compartilhar ferramentas e materiais diretamente pela aba Materiais, escolhendo se querem que visitantes também vejam ou apenas outros membros.
