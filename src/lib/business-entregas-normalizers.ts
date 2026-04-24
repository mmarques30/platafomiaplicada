export type EntregaPrioridadeNormalizada = "baixa" | "media" | "alta" | "urgente";
export type EntregaStatusNormalizado = "pendente" | "em_andamento" | "concluida" | "cancelada";

const normalizeText = (value?: string | null) =>
  (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

export function normalizeEntregaPrioridade(value?: string | null): EntregaPrioridadeNormalizada {
  const normalized = normalizeText(value);

  if (normalized === "baixa" || normalized === "low") return "baixa";
  if (normalized === "alta" || normalized === "high") return "alta";
  if (
    normalized === "urgente" ||
    normalized === "urgent" ||
    normalized === "critica" ||
    normalized === "critical"
  ) {
    return "urgente";
  }

  return "media";
}

export function normalizeEntregaStatus(value?: string | null): EntregaStatusNormalizado {
  const normalized = normalizeText(value);

  if (normalized === "em_andamento" || normalized === "em-andamento" || normalized === "in_progress") {
    return "em_andamento";
  }
  if (normalized === "concluida" || normalized === "concluido" || normalized === "done") {
    return "concluida";
  }
  if (normalized === "cancelada" || normalized === "cancelado" || normalized === "canceled") {
    return "cancelada";
  }

  return "pendente";
}