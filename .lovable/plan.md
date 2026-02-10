
# Corrigir Imagens Quebradas: Logo do Sidebar e Avatar da MarIAna no Chat

## Problema Identificado

Duas imagens estao quebradas:

1. **Logo do sidebar** (`AppSidebar.tsx`): Usa caminho estatico `/logo-simbolo.png?v=10` referenciando o arquivo em `public/`. Este metodo e mais suscetivel a problemas de cache do PWA e pode falhar em builds de producao.

2. **Avatar da MarIAna no chat** (`Chat.tsx`): Usa import ES6 `import mariAvatar from "@/assets/mari-avatar-new.png"`. O arquivo existe mas pode estar corrompido ou o build pode nao estar processando corretamente.

## Solucao

Converter ambas as referencias para imports ES6 conforme boas praticas do Vite, garantindo que o bundler processe e inclua as imagens no build corretamente.

### Arquivo 1: `src/components/layout/AppSidebar.tsx`

**Alteracao** (linha 23): Trocar de caminho estatico para import ES6.

De:
```typescript
const logoSimbolo = "/logo-simbolo.png?v=10";
```

Para:
```typescript
import logoSimbolo from "@/assets/logo-aplicada-simbolo.png";
```

Usar o arquivo `logo-aplicada-simbolo.png` que ja existe em `src/assets/` (o `logo-simbolo.png` do `public/` pode estar com problema).

### Arquivo 2: `src/pages/Chat.tsx`

**Verificacao**: O import `import mariAvatar from "@/assets/mari-avatar-new.png"` ja esta correto. Se a imagem continua quebrada, o arquivo `mari-avatar-new.png` pode estar corrompido.

**Fallback**: Adicionar fallback para o avatar antigo caso o novo falhe:

```typescript
import mariAvatar from "@/assets/mari-avatar-new.png";
```

Adicionar `onError` handler nas tags `<img>` do avatar para usar um fallback (icone ou imagem alternativa).

### Outros arquivos afetados pelo mesmo padrao

Converter tambem os outros componentes que usam `/logo-simbolo.png?v=10` estatico:
- `src/components/shared/FormularioLayout.tsx` (linha 8)
- `src/pages/Instalar.tsx` (linha 18)
- `src/pages/CandidatarMentoria.tsx` (linha 19)
- `src/components/admin/mentoria/ProcessoRoadmap.tsx` (linha 15)

Todos serao atualizados para usar `import logoSimbolo from "@/assets/logo-aplicada-simbolo.png"`.

## Resultado esperado

- Logo do sidebar carrega corretamente via bundler do Vite
- Avatar da MarIAna no chat exibe corretamente com fallback de seguranca
- Consistencia: todos os componentes usam ES6 imports em vez de caminhos estaticos
