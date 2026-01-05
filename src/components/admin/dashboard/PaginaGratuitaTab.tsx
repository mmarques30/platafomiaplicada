import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/admin/StatsCard";
import { useContentAccessMetrics, type VisitorStat } from "@/hooks/admin/useContentAccessMetrics";
import { VisitorAccessDrawer } from "@/components/admin/VisitorAccessDrawer";
import { 
  Users, 
  Eye, 
  Calendar, 
  BarChart3,
  Video,
  FileText,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PaginaGratuitaTab() {
  const { data, isLoading } = useContentAccessMetrics();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllVisitors, setShowAllVisitors] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorStat | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-500" />;
      case "material": return <FileText className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case "video": return <Badge variant="outline" className="text-blue-500 border-blue-500">Vídeo</Badge>;
      case "material": return <Badge variant="outline" className="text-green-500 border-green-500">Material</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Filtrar visitantes por busca
  const allVisitors = data?.allVisitors || [];
  const filteredVisitors = searchTerm 
    ? allVisitors.filter(v => v.email.toLowerCase().includes(searchTerm.toLowerCase()))
    : allVisitors;

  const displayedVisitors = showAllVisitors ? filteredVisitors : filteredVisitors.slice(0, 10);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Email", "Total Acessos", "Vídeos", "Materiais", "Último Acesso"];
    const rows = allVisitors.map(v => [
      v.email,
      v.totalAccesses,
      v.videoCount,
      v.materialCount,
      format(new Date(v.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `visitantes_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleOpenDetails = (visitor: VisitorStat) => {
    setSelectedVisitor({
      ...visitor,
      email: visitor.email,
      totalAccesses: visitor.totalAccesses,
      lastAccess: visitor.lastAccess,
      videoCount: visitor.videoCount,
      materialCount: visitor.materialCount,
      contentsList: visitor.contentsList,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Métricas Resumidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Visitantes"
          value={data?.uniqueUsers ?? 0}
          description="Com acessos registrados"
          icon={Users}
        />
        <StatsCard
          title="Acessos Totais"
          value={data?.totalAccesses ?? 0}
          description="Visualizações de conteúdo"
          icon={Eye}
        />
        <StatsCard
          title="Últimos 7 dias"
          value={data?.accessesLast7Days ?? 0}
          description="Acessos recentes"
          icon={Calendar}
        />
        <StatsCard
          title="Média/Visitante"
          value={data?.averagePerUser ?? 0}
          description="Acessos por pessoa"
          icon={BarChart3}
        />
      </div>

      {/* Top Conteúdos Acessados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Top Conteúdos Acessados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.topContent && data.topContent.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-20">Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Acessos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topContent.map((content, index) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(content.type)}
                        {getContentTypeBadge(content.type)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{content.title}</TableCell>
                    <TableCell className="text-right font-medium">{content.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum acesso registrado ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Visitantes Detalhados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visitantes Detalhados
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabela */}
          {filteredVisitors.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acessos</TableHead>
                    <TableHead className="text-right">Vídeos</TableHead>
                    <TableHead className="text-right">Materiais</TableHead>
                    <TableHead className="text-right">Último Acesso</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedVisitors.map((visitor) => (
                    <TableRow key={visitor.email}>
                      <TableCell className="font-medium">{visitor.email}</TableCell>
                      <TableCell className="text-right">{visitor.totalAccesses}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Video className="h-3 w-3 text-blue-500" />
                          {visitor.videoCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <FileText className="h-3 w-3 text-green-500" />
                          {visitor.materialCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {format(new Date(visitor.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDetails(visitor)}
                        >
                          Ver detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Mostrar mais/menos */}
              {filteredVisitors.length > 10 && (
                <div className="flex justify-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllVisitors(!showAllVisitors)}
                    className="gap-2"
                  >
                    {showAllVisitors ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Mostrar todos ({filteredVisitors.length} visitantes)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "Nenhum visitante encontrado." : "Nenhum visitante registrado ainda."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Drawer de detalhes */}
      {selectedVisitor && (
        <VisitorAccessDrawer
          visitante={{
            id: selectedVisitor.email,
            email: selectedVisitor.email,
            nome_completo: selectedVisitor.email.split('@')[0],
          }}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedVisitor(null);
          }}
        />
      )}
    </div>
  );
}
