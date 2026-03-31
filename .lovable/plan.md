

# Eliminar duplicatas no sidebar Business

## Problema encontrado

**Business Parceria**: O grupo `meu_progresso` (renderizado como "Minha Trajetória") e seus 4 submenus (`visao_geral`, `roadmap`, `conteudo`, `entregas`) vêm do `menu_config` e aparecem no sidebar. Os hardcoded Business Groups já cobrem essas rotas — em especial `meu_progresso_roadmap` (/mentoria?tab=roadmap) é idêntico ao "Roadmap" no grupo MINHA JORNADA.

**Business Sistemas**: `meu_sistema` e seus filhos (`sistema`, `entregas`, `documentos`) aparecem do `menu_config` com labels "Entregas" e "Documentos" que conflitam com os mesmos labels nos hardcoded groups, embora apontem para rotas diferentes (/meu-sistema/* vs /mentoria/*).

## Alterações

### 1. `src/hooks/useMenuConfig.tsx` — Ocultar entradas duplicadas

Adicionar ao array `business_parceria` (linha 77-83):
```
'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
'meu_progresso_conteudo', 'meu_progresso_entregas',
```

Adicionar ao array `business_sistemas` (linha 87-97):
```
'meu_sistema', 'meu_sistema_sistema', 'meu_sistema_entregas', 'meu_sistema_documentos',
```

### 2. `src/components/layout/AppSidebar.tsx` — Comentários de demarcação

Adicionar comentários claros marcando início e fim dos Business Groups hardcoded (em torno das linhas 107-143 e 550-630):
```
// ========== BUSINESS GROUPS (hardcoded) — START ==========
// Estes grupos têm prioridade sobre menu_config para Business.
// Se adicionar rotas aqui, ocultar no hiddenByEnvironment do useMenuConfig.
```
e
```
// ========== BUSINESS GROUPS (hardcoded) — END ==========
```

## Resultado
- Business Parceria: desaparece o grupo "Minha Trajetória" (menu_config) — ficam apenas os 3 grupos hardcoded
- Business Sistemas: desaparece o grupo "Meu Sistema" (menu_config) — ficam apenas os 3 grupos hardcoded
- Zero duplicatas visíveis

## Arquivos
- **Editado**: `src/hooks/useMenuConfig.tsx` (2 arrays de hiddenByEnvironment)
- **Editado**: `src/components/layout/AppSidebar.tsx` (apenas comentários)

