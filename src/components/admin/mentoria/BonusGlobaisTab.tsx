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

export default function BonusGlobaisTab() {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Bônus Globais
          </h2>
          <p className="text-muted-foreground">
            Gerencie bônus para todos ou grupos específicos de mentorados
          </p>
        </div>
        <Button onClick={() => { setEditingBonus(undefined); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Bônus
        </Button>
      </div>

      <div className="grid gap-4">
        {bonusGlobais.map((bonus) => {
          const stats = getEligibilityStats(bonus);
          const isExpanded = expandedBonus === bonus.id;

          return (
            <Card key={bonus.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      bonus.publico_alvo === 'usuarios_especificos'
                        ? (stats?.liberados ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted')
                        : (bonus.liberado ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted')
                    }`}>
                      {bonus.publico_alvo === 'usuarios_especificos' ? (
                        <Users className="h-5 w-5 text-blue-600" />
                      ) : bonus.liberado ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bonus.nome}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Público-alvo badge */}
                        <Badge variant="outline" className="flex items-center gap-1">
                          {bonus.publico_alvo === 'usuario_especifico' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Users className="h-3 w-3" />
                          )}
                          {bonus.publico_alvo === 'usuario_especifico' 
                            ? getUserName(bonus.user_id) 
                            : getPublicoAlvoLabel(bonus.publico_alvo)}
                        </Badge>
                        
                        {/* Stats para usuarios_especificos */}
                        {stats && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {stats.liberados}/{stats.total} liberado(s)
                          </Badge>
                        )}
                        
                        <Badge variant={bonus.condicao_tipo === 'sorteio' ? 'secondary' : 'outline'}>
                          {bonus.condicao_tipo === 'sorteio' ? 'Sorteio' : 'Preenchimento'}
                        </Badge>
                        
                        {bonus.publico_alvo !== 'usuarios_especificos' && (
                          <Badge variant={bonus.liberado ? 'default' : 'destructive'}>
                            {bonus.liberado ? 'Liberado' : 'Bloqueado'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(bonus)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
                <CardDescription>{bonus.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {bonus.condicao_descricao && (
                    <p><strong>Condição:</strong> {bonus.condicao_descricao}</p>
                  )}
                  
                  {/* Lista expandível de usuários elegíveis */}
                  {bonus.publico_alvo === 'usuarios_especificos' && bonus.usuarios_elegiveis && bonus.usuarios_elegiveis.length > 0 && (
                    <Collapsible open={isExpanded} onOpenChange={() => setExpandedBonus(isExpanded ? null : bonus.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span>Ver usuários elegíveis ({bonus.usuarios_elegiveis.length})</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                          {bonus.usuarios_elegiveis.map(u => (
                            <div 
                              key={u.user_id} 
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                u.liberado ? 'bg-green-50 dark:bg-green-950/20' : 'bg-background'
                              }`}
                            >
                              <span className="text-sm">{u.user?.nome_completo || 'Usuário'}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
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
                  
                  <div className="flex flex-wrap gap-2">
                    {bonus.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={bonus.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Link
                        </a>
                      </Button>
                    )}
                    {getArquivoUrls(bonus.arquivo_url).map((url, idx) => (
                      <Button key={idx} variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <FileDown className="h-3 w-3 mr-1" />
                          {getArquivoUrls(bonus.arquivo_url).length > 1 ? `Doc ${idx + 1}` : 'Documento'}
                        </a>
                      </Button>
                    ))}
                  </div>

                  {bonus.comando_uso && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Comando de uso:</p>
                      <p className="text-sm whitespace-pre-wrap line-clamp-3">{bonus.comando_uso}</p>
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
          <Card>
            <CardContent className="py-8 text-center">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum bônus cadastrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie bônus globais que podem ser liberados para todos ou grupos de mentorados
              </p>
            </CardContent>
          </Card>
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
