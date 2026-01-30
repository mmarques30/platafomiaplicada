
# Plano: Redesenhar página Sobre conforme referência 21st.dev

## Objetivo
Redesenhar completamente a página `/sobre` para seguir o layout da referência `about-section-1` do 21st.dev, mantendo consistência de background com o restante do projeto e ocupando todo o espaço disponível.

---

## Design de Referência (21st.dev/ui-layouts/about-section-1)

O layout original possui:
- Fundo limpo ocupando 100% da tela
- Label "ABOUT" em verde acima do título
- Grande letra "A" estilizada com sublinhado ondulado antes do título
- Título em múltiplas linhas com tipografia grande e bold
- Parágrafo de descrição centralizado
- Botão CTA "Explore Our Services" estilo pill
- 4 fotos de pessoas com fundo transparente/recortado em disposição diagonal

---

## Solução Proposta

### Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│  [Voltar]                                               │
│                                                         │
│                        SOBRE                            │
│                                                         │
│              A  Legado de Excelência,                   │
│                 Como Nossa Dedicação                    │
│                 Move Tudo o que Fazemos                 │
│                                                         │
│    A IAplicada nasceu da experiência prática em         │
│    operações complexas de empresas como Mercado Livre,  │
│    Suzano e AngloGold Ashanti...                        │
│                                                         │
│              [Conheça nossos serviços →]                │
│                                                         │
│         [Foto1]  [Foto2]  [Foto3]  [Foto4]              │
│            (dispostas em grid diagonal)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Especificações Técnicas

1. **Background e Layout**
   - Usar o mesmo fundo escuro do projeto (`bg-[#2a2c28]` ou `bg-background` no modo escuro)
   - Ocupar `min-h-screen` com flexbox centralizado
   - Garantir consistência visual com as outras páginas públicas

2. **Conteúdo Principal**
   - Label "SOBRE" em verde (`text-aplicada-green-700`)
   - Título grande com letra "A" decorativa e sublinhado ondulado SVG
   - Texto adaptado para IAplicada:
     - "Legado de Excelência," (primeira linha)
     - "Como Nossa Dedicação Move" (segunda linha)  
     - "Tudo o que Fazemos" (terceira linha)
   - Descrição: Manter o texto atual sobre Mercado Livre, Suzano, AngloGold Ashanti
   - Botão CTA arredondado navegando para `/servicos`

3. **Grid de Fotos**
   - 4 imagens de equipe/profissionais com fundo transparente
   - Usar placeholders do Unsplash similares à referência (ou imagens locais se disponíveis)
   - Efeito de hover com escala sutil
   - Disposição diagonal com rotações leves (-6°, 6°, -6°, 6°)

4. **Animações (Framer Motion)**
   - Fade-in sequencial para cada elemento
   - Animação de entrada das fotos com delay escalonado

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ui/about-section.tsx` | Reescrever completamente seguindo o novo layout |
| `src/pages/Sobre.tsx` | Ajustar estilos de container para full-screen |

---

## Detalhes de Implementação

### 1. about-section.tsx - Novo Layout

```tsx
// Elementos principais:
- Container full-screen com flex center
- Label "SOBRE" animado
- Título com letra "A" grande e sublinhado SVG ondulado
- Parágrafos de descrição
- Botão CTA estilo pill
- Grid de 4 fotos com rotação alternada
```

### 2. Sobre.tsx - Ajustes

```tsx
// Mudanças:
- Remover pt-16 e usar layout full-screen
- Manter botão Voltar posicionado absolutamente
- Aplicar background consistente (escuro)
```

### 3. Imagens de Equipe

Usar imagens do Unsplash (como na referência):
- Foto 1: https://images.unsplash.com/photo-1539571696357-5a69c17a67c6
- Foto 2: https://images.unsplash.com/photo-1609179242555-1d7b4b0a568c
- Foto 3: https://images.unsplash.com/photo-1611695434398-4f4b330623e6
- Foto 4: https://images.unsplash.com/photo-1567934872913-aacea74458b7

---

## Resultado Esperado

- Página `/sobre` com layout moderno e elegante idêntico à referência
- Ocupando 100% do espaço disponível da tela
- Background escuro consistente com o resto do projeto
- Animações suaves de entrada
- 4 fotos de equipe em disposição diagonal
- Botão CTA levando para `/servicos`
- Responsivo para mobile e desktop
