

## Corrigir crash "Algo deu errado" ao sair da simulação

### Causa raiz

Em `src/pages/MentoriaDocumentos.tsx` e `src/pages/MeuSistemaDocumentos.tsx`, o hook:

```tsx
const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
```

está declarado **na linha 152**, ou seja, **depois** dos dois `return` antecipados (`if (allLoading)` na linha 127 e `if (!contrato)` na linha 135).

Isso viola as **Rules of Hooks** do React: o número e a ordem de hooks deve ser idêntico em todos os renders.

### Por que só quebra ao sair da simulação

- Durante a simulação como Business: `contrato` está carregado, os early-returns não disparam, o `useState` da linha 152 roda normalmente.
- Ao clicar em **"Sair da Simulação"**: `useBusinessUserId` muda → `useContratosBusiness` refaz a query → `isLoading = true` → componente entra no early-return da linha 127 → o `useState` da linha 152 **não é chamado nesse render** → React detecta divergência na ordem de hooks → exceção → `ErrorBoundary` mostra "Algo deu errado".

### Correção

Mover o `useState` de `downloadingReportId` para **junto dos outros `useState`**, antes dos early-returns. Mesma correção, idêntica, em ambos os arquivos.

**Antes** (linha ~152, depois dos returns):
```tsx
if (allLoading) { return <Spinner/>; }
if (!contrato)  { return <Empty/>; }
// ...
const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null); // ❌ hook depois de return
```

**Depois** (junto aos outros estados, linha ~58):
```tsx
const [viewingReport, setViewingReport] = useState(...);
const [linkDialogOpen, setLinkDialogOpen] = useState(false);
const [editingLink, setEditingLink] = useState(...);
const [linkForm, setLinkForm] = useState(...);
const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null); // ✅ antes dos returns
```

A linha 152 fica removida (a função `handleDownloadReport` e os usos de `downloadingReportId` permanecem inalterados — só a declaração do estado muda de lugar).

### Arquivos editados

1. `src/pages/MentoriaDocumentos.tsx` — mover `useState` de `downloadingReportId` para junto dos demais `useState` (após linha 57).
2. `src/pages/MeuSistemaDocumentos.tsx` — mesma alteração idêntica.

### Resultado esperado

- Clicar em "Sair da Simulação" deixa de disparar o ErrorBoundary "Algo deu errado".
- A página de Documentos volta corretamente ao estado de loading e depois renderiza a visão do admin (sem contrato), exibindo "Nenhum contrato ativo encontrado".
- Nenhuma outra funcionalidade afetada (download de reports continua funcionando exatamente como antes).

