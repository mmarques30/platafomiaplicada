
# Liberar "Sala de Aula" para Academy, Business e Skills

## Problema

No arquivo `src/components/layout/AppSidebar.tsx` (linha 574), o menu "Sala de Aula" esta restrito apenas a visitantes com a condicao `{isVisitante && (`. Isso impede que usuarios Academy, Skills e Business vejam esse item no menu lateral.

## Solucao

Remover a restricao `isVisitante` na linha 574 do `AppSidebar.tsx`, tornando o submenu "Sala de Aula" visivel para todos os usuarios autenticados (visitante, academy, skills e business).

A mudanca e de uma unica linha: trocar `{isVisitante && (` por renderizacao incondicional (sempre mostrar o item).

## Secao Tecnica

### Arquivo modificado

| Arquivo | Linha | Mudanca |
|---|---|---|
| `src/components/layout/AppSidebar.tsx` | 573-591 | Remover a condicao `isVisitante &&` que envolve o `SidebarMenuItem` da Sala de Aula |

### Antes
```text
{/* Sala de Aula - exclusivo para visitantes (gratuito) */}
{isVisitante && (
  <SidebarMenuItem>
    ...
  </SidebarMenuItem>
)}
```

### Depois
```text
{/* Sala de Aula - visivel para todos os ambientes */}
<SidebarMenuItem>
  ...
</SidebarMenuItem>
```

Nenhuma outra alteracao necessaria -- a rota `/videos-bonus` ja esta acessivel a todos os usuarios no roteamento (`App.tsx`), e o conteudo da pagina (`VideosBonus.tsx`) nao tem restricao de role.
