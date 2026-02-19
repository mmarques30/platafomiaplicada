

# Tornar o Calendario visivel nos ambientes Skills e Business

## Problema

No arquivo `src/hooks/useMenuConfig.tsx`, o menu "Calendario" esta sendo explicitamente ocultado nos ambientes Skills (linha 67) e Business (linha 78). Isso impede que usuarios desses planos vejam a opcao de Calendario no menu lateral, dentro do grupo "Aprender".

## Solucao

Remover `'calendario'` da lista `hiddenByEnvironment` dos ambientes `skills` e `business`.

O ambiente `business_iaplicada` continuara ocultando o calendario, pois esse plano e focado apenas em acompanhamento de projeto.

### Arquivo: `src/hooks/useMenuConfig.tsx`

**Ambiente Skills (linha 67):**
- Remover `'calendario'` da lista de menus ocultos

**Ambiente Business (linha 78):**
- Remover `'calendario'` da lista de menus ocultos

### Resultado

O menu Calendario aparecera para usuarios nos ambientes Academy, Skills e Business, dentro do grupo "Aprender" (Trilhas, Central, Calendario).

