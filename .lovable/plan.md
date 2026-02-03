
# Alterar Botão do IAplicada Business

## Mudanças Solicitadas

| Antes | Depois |
|-------|--------|
| Texto: "Falar com especialista" | Texto: "Saber mais" |
| Abre WhatsApp | Abre https://iaplicada.com/business/ |
| Estilo: link simples verde | Estilo: botão destacado com cores de marca |

## Implementação

### Arquivo: `src/pages/Servicos.tsx`

**1. Criar nova função de handler:**
```tsx
const handleBusinessClick = () => {
  window.open("https://iaplicada.com/business/", "_blank");
};
```

**2. Substituir o botão na seção Business (linhas 89-94):**

De:
```tsx
<button
  onClick={handleSpecialistClick}
  className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
>
  Falar com especialista <ArrowUpRight className="w-4 h-4" />
</button>
```

Para:
```tsx
<a
  href="https://iaplicada.com/business/"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 px-6 py-3 bg-[#9EB038] text-[#1a1c19] font-semibold rounded-lg hover:bg-[#889C2D] transition-colors duration-200"
>
  Saber mais <ArrowUpRight className="w-5 h-5" />
</a>
```

## Detalhes do Novo Estilo

| Propriedade | Valor |
|-------------|-------|
| Background | `#9EB038` (verde primário da marca) |
| Texto | `#1a1c19` (escuro para contraste) |
| Hover | `#889C2D` (verde mais escuro) |
| Padding | `px-6 py-3` (mais espaçoso) |
| Fonte | `font-semibold` (mais peso) |
| Bordas | `rounded-lg` (cantos arredondados) |
| Icone | Tamanho aumentado para `w-5 h-5` |

## Resultado Visual

O botão terá destaque visual com:
- Fundo verde sólido da marca
- Texto escuro para máximo contraste
- Efeito hover suave
- Aparência de CTA (call-to-action) profissional

## Nota

Usar tag `<a>` com `target="_blank"` em vez de `window.open()` é mais seguro e evita bloqueios de pop-up do navegador.
