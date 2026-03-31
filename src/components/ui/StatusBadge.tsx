import { cn } from "@/lib/utils";

type StatusType =
  | "ativo" | "concluido" | "aprovado"
  | "em_andamento"
  | "pendente" | "aguardando"
  | "cancelado" | "bloqueado"
  | "critico" | "atrasado";

const STATUS_STYLES: Record<string, { bg: string; text: string; defaultLabel: string }> = {
  ativo:        { bg: "rgba(175,192,64,0.12)", text: "#C0DD97", defaultLabel: "Ativo" },
  concluido:    { bg: "rgba(175,192,64,0.12)", text: "#C0DD97", defaultLabel: "Concluído" },
  aprovado:     { bg: "rgba(175,192,64,0.12)", text: "#C0DD97", defaultLabel: "Aprovado" },
  em_andamento: { bg: "rgba(74,159,224,0.12)",  text: "#85B7EB", defaultLabel: "Em andamento" },
  pendente:     { bg: "rgba(232,164,60,0.12)",  text: "#FAC775", defaultLabel: "Pendente" },
  aguardando:   { bg: "rgba(232,164,60,0.12)",  text: "#FAC775", defaultLabel: "Aguardando" },
  cancelado:    { bg: "rgba(138,142,130,0.12)", text: "#B4B2A9", defaultLabel: "Cancelado" },
  bloqueado:    { bg: "rgba(138,142,130,0.12)", text: "#B4B2A9", defaultLabel: "Bloqueado" },
  critico:      { bg: "rgba(232,104,74,0.12)",  text: "#F09595", defaultLabel: "Crítico" },
  atrasado:     { bg: "rgba(232,104,74,0.12)",  text: "#F09595", defaultLabel: "Atrasado" },
};

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pendente;

  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{
        padding: "2px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 500,
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {label || style.defaultLabel}
    </span>
  );
}
