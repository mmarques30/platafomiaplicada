import { useState } from "react";
import { useBonusGlobais, BonusMentoria, getArquivoUrls, getPublicoAlvoLabel } from "@/hooks/useMentoriaBonus";
import { useUsers } from "@/hooks/admin/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Gift, Lock, CheckCircle, Pencil, Trash2, ExternalLink, FileDown, Users, User, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BonusModal from "./BonusModal";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { adminTheme } from "@/components/admin/adminTheme";

interface BonusGlobaisTabProps {
  showHeader?: boolean;
}

export default function BonusGlobaisTab({ showHeader = true }: BonusGlobaisTabProps) {
  const { bonusGlobais, createBonus, updateBonus, deleteBonus, toggleUserEligibility, isCreating, isUpdating, isDeleting, isTogglingEligibility } = useBonusGlobais();
  const { data: users } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusMentoria | undefined>();
  const [expandedBonus, setExpandedBonus] = useState<string | null>(null);

  const handleCreate = (data: Partial<BonusMentoria> & { usuarios_elegiveis?: { user_id: string; liberado: boolean }[] }) => {
    createBonus(data);
  };

  const handleEdit = (bonus: BonusMentoria) => {
    setEditingBonus(bonus);
    setModalOpen(true);
  };

  const handleUpdate = (data: Partial<BonusMentoria> & { usuarios_elegiveis?: { user_id: string; liberado: boolean }[] }) => {
    if (editingBonus) {
      updateBonus({ ...data, id: editingBonus.id });
      setEditingBonus(undefined);
    }
  };

  const handleDelete = (id: string) => {
    deleteBonus(id);
  };

  const getUserName = (userId?: string | null) => {
    if (!userId) return null;
    const user = users?.find(u => u.id === userId);
    return user?.nome_completo || 'Usuário não encontrado';
  };

  const getEligibilityStats = (bonus: BonusMentoria) => {
    if (bonus.publico_alvo !== 'usuarios_especificos' || !bonus.usuarios_elegiveis) {
      return null;
    }
    const total = bonus.usuarios_elegiveis.length;
    const liberados = bonus.usuarios_elegiveis.filter(u => u.liberado).length;
    return { total, liberados };
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className={adminTheme.pageHeader}>
          <div className={adminTheme.pageTitleWrapper}>
            <Gift className={adminTheme.pageIcon} />
            <h1 className={adminTheme.pageTitle}>Bônus Globais</h1>
          </div>
          <Button size="sm" className={adminTheme.buttonSm} onClick={() => { setEditingBonus(undefined); setModalOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Bônus
          </Button>
        </div>
      )}

      {!showHeader && (
        <div className="flex justify-end">
          <Button size="sm" className={adminTheme.buttonSm} onClick={() => { setEditingBonus(undefined); setModalOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Bônus
          </Button>
        </div>
      )}

      <div className="grid gap-3">
        {bonusGlobais.map((bonus) => {
          const stats = getEligibilityStats(bonus);
          const isExpanded = expandedBonus === bonus.id;

          return (
            <Card key={bonus.id} className={adminTheme.card}>
              <CardHeader className={adminTheme.cardHeader}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      bonus.publico_alvo === 'usuarios_especificos'
                        ? (stats?.liberados ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted')
                        : (bonus.liberado ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted')
                    }`}>
                      {bonus.publico_alvo === 'usuarios_especificos' ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : bonus.liberado ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className={adminTheme.cardTitle}>{bonus.nome}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {bonus.publico_alvo === 'usuario_especifico' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Users className="h-3 w-3" />
                          )}
                          {bonus.publico_alvo === 'usuario_especifico' 
                            ? getUserName(bonus.user_id) 
                            : getPublicoAlvoLabel(bonus.publico_alvo)}
                        </Badge>
                        
                        {stats && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.liberados}/{stats.total} liberado(s)
                          </Badge>
                        )}
                        
                        <Badge variant={bonus.condicao_tipo === 'sorteio' ? 'secondary' : 'outline'} className="text-xs">
                          {bonus.condicao_tipo === 'sorteio' ? 'Sorteio' : 'Preenchimento'}
                        </Badge>
                        
                        {bonus.publico_alvo !== 'usuarios_especificos' && (
                          <Badge variant={bonus.liberado ? 'default' : 'destructive'} className="text-xs">
                            {bonus.liberado ? 'Liberado' : 'Bloqueado'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => handleEdit(bonus)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className={adminTheme.buttonIcon}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir bônus?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{bonus.nome}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(bonus.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">{bonus.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  {bonus.condicao_descricao && (
                    <p className="text-xs"><strong>Condição:</strong> {bonus.condicao_descricao}</p>
                  )}
                  
                  {bonus.publico_alvo === 'usuarios_especificos' && bonus.usuarios_elegiveis && bonus.usuarios_elegiveis.length > 0 && (
                    <Collapsible open={isExpanded} onOpenChange={() => setExpandedBonus(isExpanded ? null : bonus.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
                          <span>Ver usuários elegíveis ({bonus.usuarios_elegiveis.length})</span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-1.5 p-2 bg-muted/50 rounded-lg">
                          {bonus.usuarios_elegiveis.map(u => (
                            <div 
                              key={u.user_id} 
                              className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                                u.liberado ? 'bg-green-50 dark:bg-green-950/20' : 'bg-background'
                              }`}
                            >
                              <span>{u.user?.nome_completo || 'Usuário'}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {u.liberado ? 'Liberado' : 'Bloqueado'}
                                </span>
                                <Switch
                                  checked={u.liberado}
                                  onCheckedChange={(checked) => {
                                    toggleUserEligibility({
                                      bonusId: bonus.id,
                                      userId: u.user_id,
                                      liberado: checked
                                    });
                                  }}
                                  disabled={isTogglingEligibility}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  <div className="flex flex-wrap gap-1.5">
                    {bonus.link && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <a href={bonus.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Link
                        </a>
                      </Button>
                    )}
                    {getArquivoUrls(bonus.arquivo_url).map((url, idx) => (
                      <Button key={idx} variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <FileDown className="h-3 w-3 mr-1" />
                          {getArquivoUrls(bonus.arquivo_url).length > 1 ? `Doc ${idx + 1}` : 'Documento'}
                        </a>
                      </Button>
                    ))}
                  </div>

                  {bonus.comando_uso && (
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Comando de uso:</p>
                      <p className="text-xs whitespace-pre-wrap line-clamp-3">{bonus.comando_uso}</p>
                    </div>
                  )}

                  {bonus.liberado && bonus.data_liberacao && bonus.publico_alvo !== 'usuarios_especificos' && (
                    <p className="text-xs text-muted-foreground">
                      Liberado em {format(new Date(bonus.data_liberacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {bonusGlobais.length === 0 && (
          <div className={adminTheme.emptyState}>
            <Gift className={adminTheme.emptyIcon} />
            <p className={adminTheme.emptyTitle}>Nenhum bônus cadastrado</p>
            <p className={adminTheme.emptyDescription}>
              Crie bônus globais que podem ser liberados para todos ou grupos de mentorados
            </p>
          </div>
        )}
      </div>

      <BonusModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingBonus(undefined);
        }}
        onSubmit={editingBonus ? handleUpdate : handleCreate}
        bonus={editingBonus}
        isLoading={isCreating || isUpdating}
        isGlobal={true}
        users={users || []}
      />
    </div>
  );
}
