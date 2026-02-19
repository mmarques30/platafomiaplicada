

# Aumentar limite de upload de thumbnails de trilhas para 10MB

## Problema
O modal de criacao/edicao de trilhas (`TrilhaModal.tsx`) limita o upload de imagens a 2MB, impedindo o uso de thumbnails de alta qualidade.

## Solucao
Alterar o limite de 2MB para 10MB no arquivo `TrilhaModal.tsx`, em dois pontos:

### Arquivo: `src/components/admin/content/TrilhaModal.tsx`

1. **Linha 128** - Validacao do tamanho do arquivo:
   - De: `file.size > 2 * 1024 * 1024` / "Maximo 2MB"
   - Para: `file.size > 10 * 1024 * 1024` / "Maximo 10MB"

2. **Linha 316** - Texto informativo abaixo do campo:
   - De: "Recomendado: 1920x1080px, maximo 2MB"
   - Para: "Recomendado: 1920x1080px, maximo 10MB"

Nenhuma outra alteracao necessaria - o bucket de storage ja suporta arquivos maiores.

