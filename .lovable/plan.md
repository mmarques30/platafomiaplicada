
# Plano: Corrigir Simulação Business iAplicada

## Problema Identificado

Ao analisar o sistema de simulação, identifiquei que as views "Visão Geral" e "Roadmap" do Business iAplicada **já estão funcionando corretamente** - os componentes `IAplicadaVisaoGeral` e `IAplicadaRoadmap` são renderizados quando um admin simula como usuário `business_iaplicada`.

**Confirmação via teste no browser:**
- ✅ Ao simular como "Quadra" (business_iaplicada), a aba Visão Geral mostra "Visão Geral do Projeto" e "Em Construção"
- ✅ A aba Roadmap mostra "Roadmap do Projeto" com as 3 fases placeholder

**Porém**, encontrei um bug no hook `useBusinessUserId` que pode causar problemas de **carregamento de dados**:

```typescript
// ATUAL - ignora business_iaplicada
if (viewAs === 'business' && impersonatedUserId) {
  return impersonatedUserId;
}
```

Isso significa que ao simular como `business_iaplicada`, os dados carregados são do admin (não do usuário simulado).

---

## Solução

Corrigir o hook `useBusinessUserId` para incluir `business_iaplicada`:

```typescript
// CORRIGIDO - inclui ambos os tipos
if ((viewAs === 'business' || viewAs === 'business_iaplicada') && impersonatedUserId) {
  return impersonatedUserId;
}
```

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useBusinessUserId.tsx` | Adicionar `viewAs === 'business_iaplicada'` na condição (linha 14) |

---

## Resultado Esperado

| Cenário | Antes | Depois |
|---------|-------|--------|
| Admin simula como Business | ✅ Carrega dados do usuário simulado | ✅ Mantém igual |
| Admin simula como Business iAplicada | ❌ Carrega dados do admin | ✅ Carrega dados do usuário simulado |

---

## Seção Técnica

### useBusinessUserId.tsx (linha 14)

```typescript
// ANTES
if (viewAs === 'business' && impersonatedUserId) {
  return impersonatedUserId;
}

// DEPOIS
if ((viewAs === 'business' || viewAs === 'business_iaplicada') && impersonatedUserId) {
  return impersonatedUserId;
}
```

---

## Observação

Os componentes `IAplicadaVisaoGeral` e `IAplicadaRoadmap` já estão sendo renderizados corretamente. Eles são placeholders com:
- Cards de status ("Entregas Concluídas", "Em Andamento", "Próxima Entrega")
- Timeline de fases (Diagnóstico, Implementação, Entrega Final)
- Mensagens "Em Construção"

Para tornar a experiência iAplicada completa, será necessário conectar esses componentes aos dados reais do projeto (via hub administrativo `/admin/mentoria/business-iaplicada`).
