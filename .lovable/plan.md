

# Plano: Corrigir Rota do Chat MarIAna (404)

## Problema Identificado

O usuário está recebendo erro 404 ao acessar `/chat-mariana` porque a rota correta definida no sistema é `/chat`.

Existem inconsistências entre os componentes:

| Componente | Rota usada | Status |
|------------|-----------|--------|
| App.tsx (rota) | `/chat` | ✅ Correto |
| MarIAnaFloatingButton | `/chat` | ✅ Correto |
| TopHeader (link) | `/chat-mariana` | ❌ Errado |
| TopHeader (isActive) | `/chat-mariana` | ❌ Errado |

## Solução

Corrigir o arquivo `TopHeader.tsx` para usar a rota correta `/chat`.

## Arquivo a Modificar

**`src/components/layout/TopHeader.tsx`**

### Correção 1: Linha 58 - Verificação de rota ativa

```tsx
// Antes
const isComunicacoesActive = ['/chat-mariana', '/notificacoes', '/avisos'].some(path => location.pathname.startsWith(path));

// Depois
const isComunicacoesActive = ['/chat', '/notificacoes', '/avisos'].some(path => location.pathname.startsWith(path));
```

### Correção 2: Linha 204 - Link do menu dropdown

```tsx
// Antes
<Link to="/chat-mariana" className="cursor-pointer">
  Chat MarIAna
</Link>

// Depois
<Link to="/chat" className="cursor-pointer">
  Chat MarIAna
</Link>
```

## Resultado Esperado

Após a correção:
- Clicar em "Chat MarIAna" no menu navegará corretamente para `/chat`
- O menu "Comunicações" ficará destacado quando o usuário estiver na página do chat
- Não haverá mais erro 404

