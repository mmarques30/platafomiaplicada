
# Corrigir botao "Ver todos os projetos" para ir ao Backlog

## Problema

O botao "Ver todos os projetos" na tabela de resumo tenta trocar para a aba Backlog usando `document.getElementById("backlog-tab").click()`, que nao funciona de forma confiavel com o componente Tabs do Radix.

## Solucao

Converter o componente `Tabs` de nao-controlado (`defaultValue`) para controlado (`value` + `onValueChange`), e passar um setter para o `onVerMais` que altera o estado diretamente.

## Alteracao

**Arquivo: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`**

1. Adicionar estado `const [activeTab, setActiveTab] = useState("acompanhamento")`
2. Trocar `<Tabs defaultValue="acompanhamento">` para `<Tabs value={activeTab} onValueChange={setActiveTab}>`
3. Alterar o `onVerMais` de `document.getElementById("backlog-tab").click()` para `setActiveTab("backlog")`
4. Remover o `id="backlog-tab"` do TabsTrigger (nao sera mais necessario)
