
# Reordenar Menu Lateral Admin: Skills acima de Business

## Mudanca

Alterar a ordem dos itens do submenu "Mentoria" no sidebar administrativo, movendo "Skills" para antes de "Business".

**Ordem atual:** Bonus Globais, Academy, Business, Business iAplicada, Skills, ...
**Nova ordem:** Bonus Globais, Academy, Skills, Business, Business iAplicada, ...

## Detalhe Tecnico

### Arquivo: `src/components/admin/AdminSidebar.tsx` (linhas 90-96)

Reordenar os itens do array `items` do grupo "Mentoria":

```
1. Bonus Globais
2. Academy
3. Skills          (sobe)
4. Business        (desce)
5. Business iAplicada (desce)
6. Preview Paineis
7. Diagnosticos
8. Central de Duvidas
```
