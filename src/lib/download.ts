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
 * Faz download real (blob + download attribute), evitando problemas de preview/nova aba.
 * Lança erro se não conseguir baixar.
 */
export async function downloadUrl(url: string, filename?: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar: ${res.status}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename || getFileNameFromUrl(url);
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Pequeno delay para evitar revogar cedo em alguns navegadores
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
