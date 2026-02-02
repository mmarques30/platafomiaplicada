export const getFileNameFromUrl = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const withoutQuery = decodedUrl.split("?")[0];
    const parts = withoutQuery.split("/");
    return parts[parts.length - 1] || "arquivo";
  } catch {
    const withoutQuery = url.split("?")[0];
    return withoutQuery.split("/").pop() || "arquivo";
  }
};

/**
 * Faz download de arquivos com fallback para diferentes estratégias.
 * Para arquivos do Supabase Storage, usa link direto (mais confiável).
 * Para outros arquivos, tenta fetch + blob com fallback para link direto.
 */
export async function downloadUrl(url: string, filename?: string) {
  const finalName = filename || getFileNameFromUrl(url);

  // Detectar se é URL do Supabase Storage
  const isSupabaseStorage = url.includes('supabase.co/storage');

  // Para Supabase Storage: usar link direto (mais confiável)
  if (isSupabaseStorage) {
    const a = document.createElement("a");
    a.href = url;
    a.download = finalName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Para outros arquivos: tentar fetch + blob
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao baixar: ${res.status}`);

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = finalName;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Pequeno delay para evitar revogar cedo em alguns navegadores
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Fallback: link direto
    const a = document.createElement("a");
    a.href = url;
    a.download = finalName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
