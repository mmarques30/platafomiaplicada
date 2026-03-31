

# Remover emojis restantes da plataforma

## Escopo
Arquivos nas áreas `/mentoria`, `/dashboard`, `/skills` e componentes compartilhados usados por essas áreas. Excluir áreas admin e comunidade (fora do escopo solicitado).

## Alterações

### 1. `src/components/mentoria/MateriaisExclusivos.tsx` (linha 132)
- `🔒 Bloqueado` → Adicionar `<Lock className="h-3 w-3" />` + texto "Bloqueado" (importar Lock de lucide-react)

### 2. `src/components/mentoria/business/BusinessEvolucaoAprendizado.tsx` (linha 207)
- `⭐ Favoritos` → Adicionar `<Star className="h-3 w-3" />` antes de "Favoritos" (importar Star de lucide-react)
- Nota: é um SelectItem, então usar string com ícone inline via custom render ou simplesmente remover emoji e manter texto "Favoritos"

### 3. `src/pages/Cupons.tsx` (linha 75)
- `🎁 Você tem um cupom especial...` → Adicionar `<Gift className="h-4 w-4 inline" />` (importar Gift de lucide-react)

### 4. `src/components/shared/ModuloCard.tsx` (linha 33)
- `🔒 PRO` → `<Lock className="h-3.5 w-3.5" /> PRO` (importar Lock)

### 5. `src/components/shared/TrilhaCard.tsx` (linha 22)
- `🔒 PRO` → `<Lock className="h-4 w-4" /> PRO` (importar Lock)

### 6. `src/components/shared/TrilhaCardBloqueavel.tsx` (linhas 72, 112)
- Ambas instâncias de `🔒 PRO` → `<Lock className="h-3.5 w-3.5" /> PRO` (importar Lock)

### 7. `src/hooks/useInstrucaoRecursos.tsx` (linhas 145-153)
- Mudar `getRecursoIcon` para retornar nomes de ícone (string) em vez de emojis: `'file-text'`, `'image'`, `'video'`, `'clipboard'`, `'link'`, `'paperclip'`
- Ou remover a função se não for usada no escopo (verificado: usado em RecursosPassoManager admin — fora do escopo, mas a função está no hook compartilhado)
- Manter a função mas substituir emojis por text labels curtas: `'PDF'`, `'IMG'`, `'VID'`, `'DOC'`, `'LINK'`, `'FILE'`

### 8. `src/components/layout/TopHeader.tsx` (linha 87)
- `👁️ Visualizando como:` → Adicionar `<Eye className="h-4 w-4 inline" />` (importar Eye de lucide-react)

## Fora do escopo (não alterar)
- `src/components/admin/*` — área admin
- `src/components/comunidade/CreatePostModal.tsx` — emoji picker funcional
- Console logs com emojis (`GerenciarMentoria.tsx`)

## Arquivos editados: 8

