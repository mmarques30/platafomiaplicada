import { useFormularios } from "@/hooks/admin/useFormularios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function VisualizarFormularios() {
  const { data: formularios, isLoading } = useFormularios();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Formulários de Diagnóstico</h1>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formularios?.map((form: any) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.profiles?.nome_completo}</TableCell>
                <TableCell>{format(new Date(form.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={form.completado ? "default" : "secondary"}>
                    {form.completado ? "Completo" : "Incompleto"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
