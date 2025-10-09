import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuditoria } from "@/hooks/admin/useAuditoria";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, User, Calendar, FileEdit } from "lucide-react";

interface HistoricoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabela: string;
  registroId: string;
  titulo: string;
}

export function HistoricoDrawer({ open, onOpenChange, tabela, registroId, titulo }: HistoricoDrawerProps) {
  const { data: historico, isLoading } = useAuditoria(tabela, registroId);

  const getOperacaoBadge = (operacao: string) => {
    switch (operacao) {
      case 'INSERT':
        return <Badge variant="default" className="bg-green-500">Criado</Badge>;
      case 'UPDATE':
        return <Badge variant="default" className="bg-blue-500">Atualizado</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">Deletado</Badge>;
      default:
        return <Badge variant="secondary">{operacao}</Badge>;
    }
  };

  const formatCampo = (campo: string) => {
    return campo
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValor = (valor: any) => {
    if (valor === null || valor === undefined) return '—';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    if (typeof valor === 'object') return JSON.stringify(valor, null, 2);
    return String(valor);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{titulo}</p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
          ) : !historico || historico.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma alteração registrada
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {historico.map((registro: any) => (
                <div key={registro.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      {getOperacaoBadge(registro.operacao)}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{registro.profiles?.nome_completo || 'Sistema'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(registro.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {registro.operacao === 'UPDATE' && registro.campos_alterados?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileEdit className="h-4 w-4" />
                        Campos Alterados ({registro.campos_alterados.length})
                      </div>
                      <div className="space-y-2">
                        {registro.campos_alterados.map((campo: string) => (
                          <div key={campo} className="bg-muted/50 rounded p-2 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              {formatCampo(campo)}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground mb-1">Anterior:</p>
                                <p className="font-mono bg-background p-1 rounded break-words">
                                  {formatValor(registro.dados_anteriores?.[campo])}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Novo:</p>
                                <p className="font-mono bg-background p-1 rounded break-words">
                                  {formatValor(registro.dados_novos?.[campo])}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {registro.operacao === 'INSERT' && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Registro criado com sucesso</p>
                    </div>
                  )}

                  {registro.operacao === 'DELETE' && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Registro deletado</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
