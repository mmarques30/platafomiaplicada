-- Atualizar visibilidade dos vídeos da trilha "Aulas Semanais" para mentorados
UPDATE videos
SET visivel_mentorados = true
WHERE trilha_id = 'eb103a22-6730-48b5-984e-e788c561eb4c'
AND ativo = true;