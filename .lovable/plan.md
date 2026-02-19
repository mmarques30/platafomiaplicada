
# Simplificar BacklogCard - Layout mais limpo

## Alteracoes em `src/components/skills/backlog/BacklogCard.tsx`

### Remover
- Icone `BookOpen` e contagem de trilhas recomendadas (linhas 51-56)
- Import do `BookOpen` de lucide-react (linha 4)
- Bloco separado de area impactada (linhas 41-47)

### Reorganizar
- Mover o badge de area impactada para a linha inferior, ao lado dos avatares de responsavel/colaborador
- Resultado: card tera apenas titulo, descricao opcional, e uma unica linha inferior com area impactada a esquerda e avatares a direita

### Estrutura final do card

```
+---------------------------+
| Titulo do projeto         |
| Descricao opcional...     |
| [Area Impactada]  (O)(O)  |
+---------------------------+
```

- Sem nenhum icone interno
- Area impactada como badge a esquerda
- Avatares a direita
- Layout em apenas 1 linha inferior
