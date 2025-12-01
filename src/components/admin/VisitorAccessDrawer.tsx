import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useVisitorAccessDetails } from "@/hooks/admin/useVisitorAccessDetails";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Visitante {
  id: string;
  nome_completo: string;
  email: string | null;
}

interface VisitorAccessDrawerProps {
  visitante: Visitante | null;
  open: boolean;
  onClose: () => void;
}

export function VisitorAccessDrawer({ visitante, open, onClose }: VisitorAccessDrawerProps) {
  const { data: accessDetails, isLoading } = useVisitorAccessDetails(visitante?.email || null);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[650px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes de Acesso</SheetTitle>
          <SheetDescription>
            {visitante?.nome_completo} ({visitante?.email})
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 gap-4 my-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-foreground">
                    {accessDetails?.totalAccesses || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total de Acessos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-foreground">
                    {accessDetails?.uniqueContents || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Conteúdos Diferentes</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela: Conteúdos acessados por este visitante */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-foreground">Conteúdos Acessados</h4>
              {accessDetails?.contentDetails && accessDetails.contentDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Vezes</TableHead>
                      <TableHead>Último Acesso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessDetails.contentDetails.map((content) => (
                      <TableRow key={content.content_id}>
                        <TableCell className="max-w-[200px] truncate">
                          {content.content_title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={content.content_type === 'video' ? 'default' : 'secondary'}>
                            {content.content_type === 'video' ? 'Vídeo' : 'Material'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {content.access_count}x
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(content.last_access), "dd/MM/yy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum acesso registrado ainda.
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
