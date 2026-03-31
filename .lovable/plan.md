

# Corrigir botão flutuante da MarIAna — usar foto/avatar

O botão flutuante atual é um retângulo com texto "✱ MarIAna". O usuário quer que seja a foto da MarIAna (avatar circular flutuante).

## Alteração: `src/components/shared/MarIAnaFloatingButton.tsx`

Importar `mariAvatar` e `mariAvatarFallback`, substituir o `<button>` de texto por um botão circular com a imagem:

```tsx
import mariAvatar from "@/assets/mariana-avatar.png";
import mariAvatarFallback from "@/assets/mari-avatar.jpg";

// Substituir o button atual por:
<button
  data-tour="mariana-button"
  onClick={() => setIsOpen(true)}
  className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform duration-150 overflow-hidden ring-2 ring-[#AFC040]/50"
>
  <img
    src={mariAvatar}
    alt="MarIAna"
    className="w-full h-full object-cover"
    onError={(e) => { e.currentTarget.src = mariAvatarFallback; }}
  />
</button>
```

## Arquivo editado
- `src/components/shared/MarIAnaFloatingButton.tsx`

