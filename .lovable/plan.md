
# Plano: Excluir páginas Aplique e Avance

## Resumo
Remover completamente as páginas `/aplique` e `/avance` do projeto, incluindo todos os arquivos e referências a elas.

---

## Impacto da Remoção

### Arquivos a EXCLUIR
1. `src/pages/Aplique.tsx` (~456 linhas)
2. `src/pages/Avance.tsx` (~400 linhas)

### Arquivos a EDITAR (remover referências)

| Arquivo | O que mudar |
|---------|------------|
| `src/App.tsx` | Remover imports e rotas `/aplique` e `/avance` |
| `src/pages/Servicos.tsx` | Substituir links `/aplique` e `/avance` por alternativa (ex: `/servicos` ou remover) |
| `src/pages/CandidatarMentoria.tsx` | Alterar navegação "Voltar para Aplique" para `/servicos` |
| `src/pages/Trilhas.tsx` | Remover ou alterar botão CTA que vai para `/aplique` |
| `src/components/dashboard/CentralConteudoGratuito.tsx` | Alterar link "Ter acesso completo" de `/aplique` para alternativa |
| `src/components/shared/TrilhaCardBloqueavel.tsx` | Alterar link do cadeado de `/aplique` para alternativa |
| `src/components/layout/AppSidebar.tsx` | Remover item CTA "Aplique/Avance" do menu lateral |

---

## Decisões Necessárias

Antes de implementar, preciso confirmar para onde direcionar os links que atualmente vão para `/aplique` ou `/avance`:

1. **Página de Serviços (`Servicos.tsx`)**: Os cards "Academy", "Skills" e "Business" apontam para essas páginas
   - **Opção A**: Redirecionar todos para `/servicos` (a própria página atual)
   - **Opção B**: Abrir link externo (WhatsApp ou checkout)
   - **Opção C**: Remover os links "Saiba mais"

2. **Candidatura Mentoria**: Botão "Voltar para Aplique"
   - **Sugestão**: Alterar para `/servicos`

3. **Trilhas (visitantes bloqueados)**: Cadeado leva para `/aplique`
   - **Sugestão**: Alterar para `/servicos` ou `/auth`

4. **Dashboard Central (visitantes)**: CTA "Ter acesso completo"
   - **Sugestão**: Alterar para `/servicos`

5. **Sidebar (menu lateral)**: Item CTA "Aplique" ou "Avance"
   - **Sugestão**: Remover completamente ou alterar para `/servicos`

---

## Detalhes Técnicos

### 1. Excluir arquivos
```
src/pages/Aplique.tsx
src/pages/Avance.tsx
```

### 2. App.tsx - Remover imports e rotas
```tsx
// Remover:
import Aplique from "./pages/Aplique";
import Avance from "./pages/Avance";

// Remover rotas:
<Route path="/aplique" element={<Aplique />} />
<Route path="/avance" element={<Avance />} />
```

### 3. Servicos.tsx - Atualizar links
```tsx
// Alterar de:
href="/aplique"
href="/avance"

// Para (sugestão):
href="https://wa.me/5511950566101" // WhatsApp ou
href="/servicos" // Scroll na própria página
```

### 4. CandidatarMentoria.tsx - Alterar navegação
```tsx
// Alterar de:
onClick={() => navigate("/aplique")}
// Para:
onClick={() => navigate("/servicos")}
```

### 5. Trilhas.tsx - Remover/alterar CTA
```tsx
// Remover ou alterar:
<Link to="/aplique">
```

### 6. CentralConteudoGratuito.tsx - Alterar link
```tsx
// Alterar de:
<Link to="/aplique">
// Para:
<Link to="/servicos">
```

### 7. TrilhaCardBloqueavel.tsx - Alterar link do cadeado
```tsx
// Alterar de:
<Link to="/aplique">
// Para:
<Link to="/servicos">
```

### 8. AppSidebar.tsx - Remover item CTA
```tsx
// Remover todo o bloco (linhas 299-324):
{!isBusiness && !isSkills && !isAcademy && (
  <SidebarMenuItem>
    // ... item Aplique/Avance
  </SidebarMenuItem>
)}
```

---

## Resultado Esperado

- Páginas `/aplique` e `/avance` deixam de existir
- Todas as referências redirecionam para `/servicos` (ou alternativa escolhida)
- Nenhum erro 404 ou link quebrado
- Menu lateral sem o item CTA "Aplique/Avance"
