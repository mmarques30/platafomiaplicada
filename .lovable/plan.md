

# Corrigir botões de "Minha Trajetória" no Business Parceria

## Problema

No sidebar, o grupo "Minha Trajetória" (meu_progresso) para Business Parceria mostra 4 sub-menus:
- **Visão Geral** → `/mentoria` ✓ funciona
- **Roadmap** → `/mentoria?tab=roadmap` ✗ roadmap foi removido da página
- **Evolução Aprendizado** → `/mentoria?tab=evolucao-aprendizado` ✗ Business Parceria usa scroll contínuo, não abas
- **Entregas** → `/mentoria/entregas` ✓ funciona

Os sub-menus "Roadmap" e "Evolução Aprendizado" usam query params de tabs, mas o layout Business Parceria substituiu as tabs por scroll contínuo. Ao clicar, a página não responde porque o parâmetro `tab` não é processado no branch do scroll.

## Solução

**Arquivo**: `src/hooks/useMenuConfig.tsx`

Adicionar `meu_progresso_roadmap` à lista `hiddenByEnvironment.business_parceria` (linha 77), já que a seção Roadmap foi removida.

Manter `meu_progresso_conteudo` (Evolução Aprendizado) visível, mas corrigir a navegação.

**Arquivo**: `src/pages/Mentoria.tsx`

Adicionar um `useEffect` que detecta `?tab=evolucao-aprendizado` quando `isBusinessParceria` e faz scroll automático para `#sec-evolucao`, removendo o param da URL. Assim o link do sidebar funciona corretamente com o layout de scroll contínuo.

```
useEffect(() => {
  if (isBusinessParceria && searchParams.get("tab") === "evolucao-aprendizado") {
    searchParams.delete("tab");
    setSearchParams(searchParams, { replace: true });
    setTimeout(() => {
      document.getElementById("sec-evolucao")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}, [isBusinessParceria, searchParams]);
```

