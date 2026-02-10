
# Corrigir Processamento de Documento Multi-Projeto

## Problema Identificado

O documento "Guia Business Livia Projetos" contém **3 projetos distintos**, cada um com suas próprias entregas numeradas:

- **Projeto Family Office** (Seção 3): FASE 1-3, Entregas 1-4
- **Projeto JOMIG** (Seção 4): Entregas 1-3 (numeração reinicia)
- **Projeto Fotografia** (Seção 5): Módulos 1-4 (usa "Módulo" em vez de "Entrega")

O parser atual falha em 3 pontos:

1. **Deduplicação por número**: Linha 684 rejeita entregas com número duplicado. JOMIG tem Entrega 1, 2, 3 - iguais ao Family Office - então são descartadas.
2. **"Módulo" não é reconhecido**: O regex só busca "ENTREGA", ignorando os 4 módulos do projeto Fotografia.
3. **Sem detecção de projeto**: Trata tudo como um projeto só, sem criar etapas/fases para JOMIG e Fotografia.

## Solução

Alterar a função `extrairAncorasLiterais` no edge function `processar-documentos-business` para:

### 1. Detectar seções de projeto (PROJETO X)
Adicionar regex para capturar "PROJETO FAMILY OFFICE", "PROJETO JOMIG", "PROJETO FOTOGRAFIA" como **fases/etapas** adicionais, cada uma representando um projeto.

### 2. Reconhecer "Módulo" como entrega
Expandir o regex de entregas (linha 663) de:
```
/ENTREGA\s*(\d+)/
```
para:
```
/(?:ENTREGA|MÓDULO|MODULO)\s*(\d+)/
```

### 3. Renumerar entregas globalmente
Em vez de deduplicar por número, manter um contador global que incrementa para cada entrega encontrada, evitando colisão. Exemplo:
- Family Office: Entregas 1-4
- JOMIG: Entregas 5-7 (renumeradas)
- Fotografia: Entregas 8-11 (renumeradas a partir dos módulos)

### 4. Criar fases para cada projeto
Detectar headers como "PROJETO FAMILY OFFICE", "PROJETO JOMIG", "PROJETO FOTOGRAFIA" e convertê-los em fases/etapas quando não há FASE explícita para aquele projeto.

## Detalhes Técnicos

### Arquivo: `supabase/functions/processar-documentos-business/index.ts`

**Alteração 1 - Detectar projetos** (antes da extração de fases, ~linha 635):

```typescript
// 0. PROJETOS - Detectar seções de projeto como agrupadores
const regexProjeto = /(?:^|\n)\s*#*\s*(?:\d+\.\s*)?PROJETO\s+(.+?)(?:\s*[-–]\s*(.+?))?(?=\n|$)/gi;
```

Cada projeto detectado se torna uma FASE adicional se não houver FASE explícita naquela seção.

**Alteração 2 - Expandir regex de entregas** (linha 663):

```typescript
const regexEntrega = /(?:^|\n)\s*(?:ENTREGA|MÓDULO|MODULO)\s*(\d+)\s*[:\-–.]\s*(.+?)(?=\n|$)/gi;
```

**Alteração 3 - Remover deduplicação por número, usar contador global** (linha 684):

```typescript
// Antes: if (!ancoras.entregas.some(e => e.numero === numero))
// Depois: usar numeração global
let contadorEntrega = 1;
// ...
ancoras.entregas.push({
  numero: contadorEntrega++, // número global único
  titulo,
  faseNumero: faseAtual,
  numero_original: numero // manter original para referência
});
```

**Alteração 4 - Vincular entregas ao projeto/fase correto**:

Determinar a qual projeto/fase cada entrega pertence baseado na posição no texto, usando os boundaries dos projetos detectados.

## Resultado Esperado

O documento processará:
- **3 fases/etapas** (uma por projeto)
- **~11 entregas** (4 Family Office + 3 JOMIG + 4 Fotografia)
- Todas as instruções/passos vinculados às entregas corretas
- Checklists associados ao projeto correto

## Arquivo alterado
- `supabase/functions/processar-documentos-business/index.ts` - Função `extrairAncorasLiterais` (regex de fases, entregas, e lógica de numeração)
