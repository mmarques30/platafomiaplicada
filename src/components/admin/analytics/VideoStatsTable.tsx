import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VideoStatsTableProps {
  data: any[];
}

export function VideoStatsTable({ data }: VideoStatsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas Detalhadas por Vídeo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Trilha</TableHead>
              <TableHead className="text-right">Visualizações</TableHead>
              <TableHead className="text-right">Tempo Médio (min)</TableHead>
              <TableHead className="text-right">Taxa Conclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.titulo}</TableCell>
                <TableCell>{video.trilha}</TableCell>
                <TableCell className="text-right">{video.visualizacoes}</TableCell>
                <TableCell className="text-right">{video.tempoMedio}min</TableCell>
                <TableCell className="text-right">{video.taxaConclusao}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
