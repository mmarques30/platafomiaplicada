export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * O endereço da capa de um vídeo do YouTube.
 *
 * Devolvia `maxresdefault.jpg`, que o YouTube só gera quando o arquivo
 * enviado tinha 720p ou mais. Para todo vídeo abaixo disso o endereço
 * responde 404, e como esta função também alimenta a coluna `thumbnail_url`
 * ao cadastrar um vídeo, o 404 ficava gravado no banco.
 *
 * `hqdefault.jpg` (480x360) é gerado para qualquer vídeo que exista, então é
 * o padrão seguro aqui. Onde a qualidade importa — as capas que o aluno vê —
 * quem desce a escada de tamanhos é o componente `CapaVideo`, que tenta o
 * maxres primeiro e cai para este quando ele não existe.
 *
 * Sem id não há capa: devolver `.../vi//hqdefault.jpg` seria mais um 404.
 */
export function getYouTubeThumbnail(videoId?: string | null, customThumbnail?: string | null): string {
  const personalizada = customThumbnail?.trim();
  if (personalizada) return personalizada;

  const id = videoId?.trim();
  if (!id) return '/placeholder.svg';

  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeDuration(videoId: string): Promise<number | null> {
  // Esta função poderia usar a API do YouTube para obter a duração
  // Por enquanto, retorna null (duração manual)
  return Promise.resolve(null);
}
