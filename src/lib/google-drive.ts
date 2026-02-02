/**
 * Converte URL de compartilhamento do Google Drive para URL de embed
 * Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * Output: https://drive.google.com/file/d/FILE_ID/preview
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const match = url.match(/\/d\/([^/]+)/);
  if (!match) return null;
  
  const fileId = match[1];
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Verifica se uma URL é do Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url?.includes('drive.google.com');
}
