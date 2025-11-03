import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProjetoTitulo(titulo?: string) {
  if (!titulo) return "";
  return titulo.replace(/^\s*m[oó]dulo\b/i, "Projeto");
}
