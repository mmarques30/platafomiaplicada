# Plano: Suporte a Google Drive como Alternativa ao YouTube

## ✅ Status: IMPLEMENTADO

### Alterações Realizadas

1. ✅ **Banco de Dados**: Coluna `google_drive_url` adicionada à tabela `videos`
2. ✅ **Vídeo 20 atualizado** com URL do Google Drive: `https://drive.google.com/file/d/12HCoZ_I_k81q5TydookcUfyO8sxaEn-V/view?usp=sharing`
3. ✅ **VideoModal.tsx**: Campo de input para URL do Google Drive no admin
4. ✅ **CustomVideoPlayer.tsx**: Nova prop `googleDriveUrl` + botão fallback no estado de erro
5. ✅ **VideoPlayer.tsx**: Passando `googleDriveUrl` para o player

### Comportamento

Quando o YouTube falha ao carregar, o player exibe:
- Botão primário "Assistir no Google Drive" (se URL configurada)
- Botão secundário "Abrir no YouTube"

