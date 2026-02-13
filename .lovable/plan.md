
# Remover icone do titulo "Business iAplicada" no painel admin

## Mudanca

Remover o icone de chave inglesa (Wrench) que aparece antes do titulo "Business iAplicada" na pagina administrativa.

## Detalhe Tecnico

### Arquivo: `src/pages/admin/mentoria/MentoriaBusinessIAplicadaPage.tsx`

- Linha 130: Remover `<Wrench className="h-5 w-5 text-amber-500" />`
- Remover a import de `Wrench` de lucide-react (se nao for usada em outro lugar do arquivo)
- O titulo "Business iAplicada" permanece como esta
