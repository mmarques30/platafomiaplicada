import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "concluido":
    case "aprovada":
      return <Badge className="bg-[hsl(72,50%,35%)] text-white border-transparent hover:bg-[hsl(72,50%,30%)]">Concluído</Badge>;
    case "em_andamento":
      return <Badge className="bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)] border-transparent hover:bg-[hsl(68,35%,65%)]">Em andamento</Badge>;
    case "atrasado":
      return <Badge variant="destructive">Atrasado</Badge>;
    default:
      return <Badge variant="outline">Pendente</Badge>;
  }
}
