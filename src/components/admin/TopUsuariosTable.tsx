import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TopUsuario {
  userId: string;
  nome: string;
  videosAssistidos: number;
  videosConcluidos: number;
  ultimoAcesso: string;
}

interface TopUsuariosTableProps {
  usuarios: TopUsuario[];
}

export function TopUsuariosTable({ usuarios }: TopUsuariosTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Usuários Mais Engajados</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posição</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-center">Vídeos Assistidos</TableHead>
              <TableHead className="text-center">Concluídos</TableHead>
              <TableHead>Último Acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario, index) => (
              <TableRow key={usuario.userId}>
                <TableCell>
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {index + 1}º
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell className="text-center font-bold">
                  {usuario.videosAssistidos}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {usuario.videosConcluidos}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(usuario.ultimoAcesso), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
