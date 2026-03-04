import { format } from "date-fns";

interface ExportableUser {
  nome_completo: string;
  email?: string | null;
  roles: string[];
  plano_mentoria?: string | null;
  conta_ativa?: boolean | null;
  data_expiracao_acesso?: string | null;
  created_at?: string | null;
  email_acesso_enviado?: boolean | null;
  adicionado_grupo_whatsapp?: boolean | null;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportUsersToCSV(users: ExportableUser[]) {
  const headers = [
    "Nome",
    "Email",
    "Roles",
    "Plano",
    "Status",
    "Data Expiração",
    "Data Cadastro",
    "Email Enviado",
    "WhatsApp",
  ];

  const rows = users.map((u) => [
    escapeCSV(u.nome_completo),
    escapeCSV(u.email || ""),
    escapeCSV(u.roles.length > 0 ? u.roles.join("; ") : "Sem role"),
    escapeCSV(u.plano_mentoria || "Sem plano"),
    u.conta_ativa === false ? "Inativo" : "Ativo",
    u.data_expiracao_acesso
      ? format(new Date(u.data_expiracao_acesso), "dd/MM/yyyy")
      : "Sem limite",
    u.created_at ? format(new Date(u.created_at), "dd/MM/yyyy") : "-",
    u.email_acesso_enviado ? "Sim" : "Não",
    u.adicionado_grupo_whatsapp ? "Sim" : "Não",
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `usuarios_${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
