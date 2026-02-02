
# Plano: Ajustes na Visão Gratuita - Cards, Materiais e Navegação

## Resumo das Correções
Três ajustes serão implementados para melhorar a experiência dos usuários com acesso gratuito (visitantes):

1. **Cards maiores na Sala de Aula** - Aumentar o tamanho dos cards de vídeo na aba "Aula"
2. **Materiais com preview e download funcional** - Corrigir erros de download e permitir visualização do conteúdo
3. **"Início" redireciona para Central** - Visitantes devem ir para `/central` (não `/trilhas`)

---

## Problema 1: Cards de Vídeo Pequenos

### Situação Atual
O componente `VideosVisitante` usa um grid com muitas colunas (`grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7`), resultando em cards muito pequenos.

### Solução
Reduzir o número de colunas para que cada card tenha mais espaço:

| Breakpoint | Antes | Depois |
|------------|-------|--------|
| Mobile (base) | 3 colunas | 2 colunas |
| sm (640px) | 4 colunas | 3 colunas |
| md (768px) | 5 colunas | 4 colunas |
| lg (1024px) | 6 colunas | 5 colunas |
| xl (1280px) | 7 colunas | 6 colunas |

### Arquivo: `src/components/dashboard/VideosVisitante.tsx`
- Alterar grid de `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7`
- Para: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`

---

## Problema 2: Erro ao Baixar Materiais

### Situação Atual
A função `downloadUrl` em `src/lib/download.ts` usa `fetch()` que pode falhar com arquivos do Supabase Storage por:
- Problemas de CORS
- O arquivo não permitir download via fetch

### Solução
Melhorar a função de download para tentar múltiplas estratégias:
1. Tentar download via fetch + blob (método atual)
2. Se falhar, usar um link direto com `download` attribute
3. Como fallback final, abrir em nova aba

### Arquivo: `src/lib/download.ts`
Adicionar lógica de fallback para arquivos do Supabase Storage:

```typescript
export async function downloadUrl(url: string, filename?: string) {
  const finalName = filename || getFileNameFromUrl(url);
  
  // Detectar se é URL do Supabase Storage
  const isSupabaseStorage = url.includes('supabase.co/storage');
  
  // Para Supabase Storage: usar link direto (mais confiável)
  if (isSupabaseStorage) {
    const a = document.createElement("a");
    a.href = url;
    a.download = finalName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Para outros arquivos: tentar fetch + blob
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha: ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Fallback: link direto
    const a = document.createElement("a");
    a.href = url;
    a.download = finalName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
```

---

## Problema 3: "Início" Redireciona para Trilhas

### Situação Atual
Quando visitante clica em "Início" na sidebar:
1. Navega para `/` (Dashboard.tsx)
2. Dashboard detecta `isVisitante` e redireciona para `/trilhas`
3. `/trilhas` mostra conteúdo gratuito mas o usuário quer ir para a "Central"

### Solução
Alterar o redirecionamento no Dashboard de `/trilhas` para `/central`:

### Arquivo: `src/pages/Dashboard.tsx`
Linha 23: Alterar de `navigate("/trilhas", { replace: true })` para `navigate("/central", { replace: true })`

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/dashboard/VideosVisitante.tsx` | Reduzir colunas do grid (2 lugares) |
| `src/lib/download.ts` | Adicionar lógica de fallback para Supabase Storage |
| `src/pages/Dashboard.tsx` | Mudar redirect de `/trilhas` para `/central` |

---

## Impacto
- **Cards maiores**: Melhor visualização em mobile e desktop
- **Downloads funcionando**: Materiais do Supabase Storage serão baixados corretamente
- **Navegação correta**: Visitantes terão experiência consistente ao clicar em "Início"
