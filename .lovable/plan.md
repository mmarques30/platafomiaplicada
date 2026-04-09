

# Elevar MentoriaDocumentos ao mesmo nível de MeuSistemaDocumentos

## Situação atual

A página `MentoriaDocumentos.tsx` (Business Parceria) é básica: tem apenas tabs de Arquivos, Anotações, Links e Reports, sem stat cards, sem aba Contrato, sem seção de Evolução/Atividade/Insights. Já a página `MeuSistemaDocumentos.tsx` (Business Sistemas) tem tudo isso.

## Solução

Reescrever `MentoriaDocumentos.tsx` trazendo todas as seções que existem em `MeuSistemaDocumentos.tsx`, mantendo a funcionalidade de CRUD de links que já foi adicionada:

1. **Stat cards** no topo (Arquivos, Anotações, Links, Reports) com o padrão verde da marca
2. **Aba Contrato** com dados da empresa, detalhes do contrato, módulos e garantias (3 cards organizados)
3. **Aba Reports** com cards de visualizar/baixar (igual ao Sistemas)
4. **Seção inferior** com 3 cards: Evolução das Entregas (progress bars), Atividade Recente (timeline), Insights do Projeto
5. **Manter** todo o CRUD de links já implementado (criar, editar, excluir)
6. **Remover** botão "Voltar para Mentoria" e usar `PageTitle` consistente

## Arquivo

| Arquivo | Acao |
|---|---|
| `src/pages/MentoriaDocumentos.tsx` | Reescrever com a mesma estrutura do MeuSistemaDocumentos |

## Detalhes tecnicos

- Importar `reports`, `progresso` do `useContratosBusiness` (atualmente so usa `contrato` e `isLoading`)
- Adicionar `useDocumentosBusiness` para contagem de arquivos
- Reutilizar componentes: `PageTitle`, `ProgressBar`, `Badge`, `ScrollArea`
- Adicionar aba "Contrato" com `InfoItem` local (mesmo pattern do Sistemas)
- Adicionar seção de 3 cards abaixo das tabs: Evolução, Atividade Recente, Insights
- Cronograma calculado com `differenceInDays` (mesmo do Sistemas)
- Dialog de visualização de report HTML (mesmo do Sistemas)
- Manter link CRUD intacto (dialog, alertdialog, mutations)

