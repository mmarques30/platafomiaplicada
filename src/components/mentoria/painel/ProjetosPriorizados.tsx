import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatProjetoTitulo } from "@/lib/utils";

interface Props {
  projetos: Array<{
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    objetivo_projeto: string;
    data_entrega?: string;
  }>;
}

export const ProjetosPriorizados = ({ projetos }: Props) => {
  if (!projetos || projetos.length === 0) return null;

  const getComplexityBadge = (index: number) => {
    if (index === 0) return <Badge variant="complexity-high">Alta</Badge>;
    if (index <= 2) return <Badge variant="complexity-medium">Média</Badge>;
    return <Badge variant="complexity-low">Baixa</Badge>;
  };

  return (
    <Card className="border-aplicada-green-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-aplicada-dark">
          Projetos Priorizados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: Tabela */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-aplicada-green-900 hover:bg-aplicada-green-900">
                <TableHead className="text-white font-bold">#</TableHead>
                <TableHead className="text-white font-bold">Projeto</TableHead>
                <TableHead className="text-white font-bold">Objetivo</TableHead>
                <TableHead className="text-white font-bold">Complexidade</TableHead>
                <TableHead className="text-white font-bold">Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetos.map((projeto, index) => (
                <TableRow 
                  key={projeto.id}
                  className={index % 2 === 0 ? "bg-white hover:bg-aplicada-green-50" : "bg-aplicada-green-50 hover:bg-aplicada-green-100"}
                >
                  <TableCell className="font-bold text-aplicada-dark">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-aplicada-dark">{formatProjetoTitulo(projeto.titulo)}</TableCell>
                  <TableCell className="text-aplicada-dark">{projeto.objetivo_projeto}</TableCell>
                  <TableCell>{getComplexityBadge(index)}</TableCell>
                  <TableCell className="text-aplicada-dark font-medium">
                    {projeto.data_entrega 
                      ? new Date(projeto.data_entrega).toLocaleDateString('pt-BR')
                      : "A definir"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {projetos.map((projeto, index) => (
            <Card key={projeto.id} className="bg-white border-2 border-aplicada-green-100">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-aplicada-green-900 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-aplicada-dark flex-1">{formatProjetoTitulo(projeto.titulo)}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-aplicada-dark/70 font-medium">Objetivo:</span>
                    <p className="text-aplicada-dark mt-1">{projeto.objetivo_projeto}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-aplicada-dark/70 font-medium">Complexidade:</span>
                    {getComplexityBadge(index)}
                  </div>
                  {projeto.data_entrega && (
                    <div>
                      <span className="text-aplicada-dark/70 font-medium">Prazo:</span>
                      <p className="text-aplicada-dark mt-1 font-medium">{new Date(projeto.data_entrega).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impacto Total */}
        <Card className="mt-6 bg-gradient-to-r from-aplicada-green-100 to-aplicada-yellow border-aplicada-green-900">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-aplicada-dark mb-2">Impacto Total Estimado</h3>
            <p className="text-2xl font-bold text-aplicada-green-900">
              {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} priorizados
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
