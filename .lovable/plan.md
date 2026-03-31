
# Comunicação do InsightIA no fluxo de diagnóstico

## Resumo
Dois pontos de comunicação: (1) card explicativo antes do último step do wizard, (2) tela pós-envio com loading animado + exibição dos insights antes de redirecionar.

## Alterações

### 1. Card explicativo antes do último step
**Arquivo: `src/components/mentoria/steps/academy/AcademyStep4Desafios.tsx`**
- Adicionar no final do step 4 (penúltimo) um card informativo com ícone Sparkles:
  - "Ao finalizar, nossa IA vai gerar um diagnóstico personalizado com seus principais gaps e recomendações de onde começar."
  - Estilo: `bg-primary/5 border border-primary/20 rounded-xl` com ícone Sparkles

### 2. Tela pós-envio com InsightIA inline
**Arquivo: `src/components/mentoria/FormularioWizard.tsx`**
- Adicionar estado `submitted` (boolean) e `insightReady` (boolean)
- No `onSubmit`, após `finalizarFormulario` e `gerar-insight-mentoria`:
  - Setar `submitted = true` (mostra tela de loading)
  - Quando a edge function retorna com sucesso, chamar `refetch()` do formulário e setar `insightReady = true`
- Quando `submitted && !insightReady`: renderizar card animado "Seu InsightIA está sendo gerado..." com Loader2 spinning + texto motivacional
- Quando `submitted && insightReady`: renderizar o componente `<InsightIA />` diretamente + botão "Ir para o Dashboard"
- Remover o `setTimeout` com `navigate` e o toast simples de "Gerando sua análise"

## Arquivos alterados
- `src/components/mentoria/steps/academy/AcademyStep4Desafios.tsx` (card explicativo)
- `src/components/mentoria/FormularioWizard.tsx` (tela pós-envio com insight inline)
