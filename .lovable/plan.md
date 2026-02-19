

# Remover Card externo duplicado das secoes de metricas

## Problema
As secoes "Perfil Mapeado", "Economia Potencial" e "Economia da Equipe" tem um `Card` externo envolvendo mini-cards internos, criando um efeito de "card dentro de card" visualmente redundante.

## Solucao
Remover o `Card`/`CardHeader`/`CardContent` externo e manter apenas os mini-cards internos, adicionando o titulo como texto simples acima do grid.

## Mudancas

### 1. DiagnosticoResults.tsx - Perfil Mapeado (linhas 174-190)
- Remover `Card`, `CardHeader`, `CardContent` que envolvem os ProfileItems
- Manter o titulo com icone como um `div` com `flex items-center gap-2` e subtitulo
- Manter o grid de ProfileItems (que ja sao mini-cards)

### 2. DiagnosticoResults.tsx - Economia Potencial (linhas 227-255)
- Remover `Card`, `CardHeader`, `CardContent` que envolvem os 3 mini-cards de economia
- Manter o titulo com icone como texto simples
- Manter o grid com os 3 mini-cards internos

### 3. EquipeConsolidadoView.tsx - Economia da Equipe (linhas 39-62)
- Remover `Card`, `CardHeader`, `CardContent` que envolvem os 2 mini-cards
- Manter o titulo com icone como texto simples
- Manter o grid com os 2 mini-cards internos

## Estrutura resultante (exemplo)
```text
Antes:
  Card (borda externa)
    CardHeader -> Titulo
    CardContent
      div.grid
        div.rounded-lg.border (mini-card 1)
        div.rounded-lg.border (mini-card 2)

Depois:
  div
    div -> Titulo (com icone)
    div.grid
      div.rounded-lg.border (mini-card 1)
      div.rounded-lg.border (mini-card 2)
```

## Arquivos modificados
1. `src/components/skills/diagnostico/DiagnosticoResults.tsx` - secoes Perfil Mapeado e Economia Potencial
2. `src/components/skills/diagnostico/EquipeConsolidadoView.tsx` - secao Economia da Equipe

