import { useState } from "react";
import { useVisitantes } from "@/hooks/useVisitantes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditVisitanteModal } from "@/components/admin/EditVisitanteModal";
import { VisitorAccessDrawer } from "@/components/admin/VisitorAccessDrawer";
import { useContentAccessMetrics } from "@/hooks/admin/useContentAccessMetrics";
import { useAcademyPurchaseClicks } from "@/hooks/admin/useButtonClickLogs";
import { StatsCard } from "@/components/admin/StatsCard";
import { Users, UserCheck, Trash2, Pencil, Eye, TrendingUp, Video, FileText, MousePointerClick } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarVisitantes() {
  const { visitantes, isLoading, convertToMentorado, deleteVisitante } = useVisitantes();
  const { data: metrics, isLoading: isLoadingMetrics } = useContentAccessMetrics();
  const { data: academyClicks, isLoading: isLoadingClicks } = useAcademyPurchaseClicks();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedVisitante, setSelectedVisitante] = useState<typeof visitantes[0] | null>(null);

  const handleEdit = (visitante: typeof visitantes[0]) => {
    setSelectedVisitante(visitante);
    setEditModalOpen(true);
  };

  const handleViewAccess = (visitante: typeof visitantes[0]) => {
    setSelectedVisitante(visitante);
    setDrawerOpen(true);
  };

  const handleConvert = (userId: string) => {
    setSelectedUserId(userId);
    setConvertDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmConvert = () => {
    if (selectedUserId) {
      convertToMentorado.mutate(selectedUserId);
      setConvertDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      deleteVisitante.mutate(selectedUserId);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const totalVisitantes = visitantes.length;
  const visitantesAtivos = visitantes.filter(v => v.conta_ativa).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Visitantes</h1>
        <p className="text-muted-foreground">
          Gerencie contas de visitantes e converta para mentorados
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Visitantes"
          value={totalVisitantes}
          description={`${visitantesAtivos} ativos`}
          icon={Users}
        />
        <StatsCard
          title="Total de Acessos"
          value={metrics?.totalAccesses || 0}
          description={`${metrics?.accessesLast7Days || 0} nos últimos 7 dias`}
          icon={Eye}
        />
        <StatsCard
          title="Visitantes Únicos com Acesso"
          value={metrics?.uniqueUsers || 0}
          description="Que acessaram conteúdo"
          icon={UserCheck}
        />
        <StatsCard
          title="Média de Acessos/Visitante"
          value={metrics?.averagePerUser || 0}
          description="Por visitante ativo"
          icon={TrendingUp}
        />
      </div>

      {/* Top 10 Conteúdos Mais Acessados */}
      {!isLoadingMetrics && metrics && metrics.topContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Conteúdos Mais Acessados por Visitantes</CardTitle>
            <CardDescription>
              Conteúdos gratuitos com maior engajamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Total de Acessos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topContent.map((content, index) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {content.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={content.type === 'video' ? 'default' : 'secondary'}>
                        {content.type === 'video' ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            Vídeo
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            Material
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {content.count}x
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Top 10 Visitantes por Engajamento */}
      {!isLoadingMetrics && metrics && metrics.topVisitors && metrics.topVisitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Visitantes por Engajamento</CardTitle>
            <CardDescription>
              Visitantes com mais acessos a conteúdos gratuitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Vídeos</TableHead>
                  <TableHead className="text-center">Materiais</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead>Último Acesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topVisitors.map((visitor, index) => (
                  <TableRow key={visitor.email}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{visitor.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        <Video className="h-3 w-3 mr-1" />
                        {visitor.videoCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {visitor.materialCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {visitor.totalAccesses}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(visitor.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Cliques no Botão Academy */}
      {!isLoadingClicks && academyClicks && academyClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cliques no Botão "Quero Aplicar na Academy"</CardTitle>
            <CardDescription>
              Visitantes que demonstraram interesse em comprar Academy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <StatsCard
                title="Total de Cliques"
                value={academyClicks.length}
                description={`${academyClicks.filter(c => new Date(c.clicked_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} nos últimos 7 dias`}
                icon={MousePointerClick}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Data/Hora do Clique</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academyClicks.slice(0, 20).map((click) => {
                  const visitante = visitantes.find(v => v.email === click.user_email);
                  const converteu = visitante && !visitante.is_visitante;
                  
                  return (
                    <TableRow key={click.id}>
                      <TableCell className="font-medium">{click.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {click.page_origin}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(click.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {converteu ? (
                          <Badge className="bg-green-500 text-white">✓ Converteu</Badge>
                        ) : visitante ? (
                          <Badge className="bg-yellow-500 text-white">Visitante</Badge>
                        ) : (
                          <Badge variant="secondary">Não cadastrado</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Visitantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Visitantes</CardTitle>
          <CardDescription>
            Gerencie todas as contas de visitantes cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : visitantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum visitante cadastrado
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Acessos</TableHead>
                    <TableHead className="text-right w-[300px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitantes.map((visitante) => (
                    <TableRow key={visitante.id}>
                      <TableCell className="font-medium">
                        {visitante.nome_completo}
                      </TableCell>
                      <TableCell>{visitante.email}</TableCell>
                      <TableCell>{visitante.telefone || "-"}</TableCell>
                      <TableCell>
                        {visitante.created_at
                          ? format(new Date(visitante.created_at), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {visitante.conta_ativa ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAccess(visitante)}
                          className="font-semibold"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {metrics?.accessesByUser?.[visitante.email || ''] || 0}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(visitante)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvert(visitante.id)}
                            disabled={!visitante.conta_ativa}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Converter
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(visitante.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Conversão */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter para Mentorado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja converter este visitante em mentorado? Isso dará acesso completo à plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvert}>
              Converter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edição */}
      <EditVisitanteModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        visitante={selectedVisitante}
      />

      {/* Drawer de Detalhes de Acesso */}
      <VisitorAccessDrawer
        visitante={selectedVisitante}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Dialog de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Visitante Permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-destructive font-semibold">
                Esta ação é IRREVERSÍVEL. O visitante será excluído completamente do sistema.
              </p>
              <p>
                Tem certeza que deseja continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
