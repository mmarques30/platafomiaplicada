
# Plano: Remover Card de Ferramentas Compartilhadas da Visão Ranking

## Problema Identificado

A página de Evolução (`/evolucao`) na aba "Ranking" (comunidade) exibe dois sistemas duplicados:

1. **Card "Ferramentas Compartilhadas"** (`FerramentasCompartilhadasList`) - usa tabela `ferramentas_compartilhadas`
2. **Aba "Criadores"** em `/videos-bonus` (`AdicionarMaterialModal`) - usa tabela `materiais_comunidade`

O usuário deseja que a funcionalidade de compartilhamento de ferramentas fique **apenas** na aba Criadores da Comunidade.

---

## Solução

Remover o componente `FerramentasCompartilhadasList` e o modal `CompartilharFerramentaModal` da página Evolução.

---

## Mudanças Necessárias

### Arquivo: `src/pages/Evolucao.tsx`

**Remover:**
1. Import do `FerramentasCompartilhadasList`
2. Import do `CompartilharFerramentaModal`
3. Estado `modalFerramentaOpen`
4. Renderização do `FerramentasCompartilhadasList` na aba comunidade
5. Renderização do `CompartilharFerramentaModal`

**Código atual (linhas 6-8, 26, 82-88):**
```typescript
import { FerramentasCompartilhadasList } from "@/components/evolucao/FerramentasCompartilhadasList";
import { CompartilharFerramentaModal } from "@/components/evolucao/CompartilharFerramentaModal";
...
const [modalFerramentaOpen, setModalFerramentaOpen] = useState(false);
...
{/* Ferramentas Mais Compartilhadas */}
<FerramentasCompartilhadasList onCompartilhar={() => setModalFerramentaOpen(true)} />

<CompartilharFerramentaModal 
  open={modalFerramentaOpen} 
  onOpenChange={setModalFerramentaOpen} 
/>
```

**Código após remoção:**
- Aba "Ranking" mostrará apenas `HeroComunidade` e `RankingComunidade`
- Sem referência a ferramentas compartilhadas

---

## Resultado Esperado

| Localização | Antes | Depois |
|-------------|-------|--------|
| `/evolucao` (aba Ranking) | Card de ferramentas + botão compartilhar | Apenas Ranking da Comunidade |
| `/videos-bonus?tab=criadores` | Botão "Contribuir" para Academy/Business | Mantido (única forma de contribuir) |

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Evolucao.tsx` | Remover imports, estado e componentes de ferramentas compartilhadas |

---

## Observação

Os arquivos `FerramentasCompartilhadasList.tsx` e `CompartilharFerramentaModal.tsx` podem ser mantidos no código (para eventual uso futuro) ou removidos completamente. A recomendação é apenas remover as referências da página Evolução para manter o código limpo.
