import { useState } from "react";
import { 
  usePendenciasDashboard, 
  useTogglePendencia, 
  useUpdatePendencia,
  useCreatePendencia,
  useDeletePendencia,
  PendenciaDashboard 
} from "@/hooks/admin/usePendenciasDashboard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, GripVertical, FileText, ClipboardList, FormInput } from "lucide-react";
import { adminTheme } from "@/components/admin/adminTheme";

const PLANOS_DISPONIVEIS = [
  { value: "academy", label: "Academy" },
  { value: "business_parceria", label: "Builder" },
];

const TIPOS_PENDENCIA = [
  { value: "diagnostico", label: "Diagnóstico", icon: ClipboardList },
  { value: "pesquisa", label: "Pesquisa", icon: FileText },
  { value: "formulario", label: "Formulário", icon: FormInput },
];

interface PendenciaFormData {
  tipo: string;
  titulo: string;
  descricao: string;
  link: string;
  planos_aplicaveis: string[];
  ordem: number;
}

export function GerenciarPendencias() {
  const { data: pendencias, isLoading } = usePendenciasDashboard();
  const togglePendencia = useTogglePendencia();
  const updatePendencia = useUpdatePendencia();
  const createPendencia = useCreatePendencia();
  const deletePendencia = useDeletePendencia();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPendencia, setEditingPendencia] = useState<PendenciaDashboard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PendenciaFormData>({
    tipo: "formulario",
    titulo: "",
    descricao: "",
    link: "",
    planos_aplicaveis: ["academy", "business_parceria", "skills"],
    ordem: 0,
  });

  const handleOpenModal = (pendencia?: PendenciaDashboard) => {
    if (pendencia) {
      setEditingPendencia(pendencia);
      setFormData({
        tipo: pendencia.tipo,
        titulo: pendencia.titulo,
        descricao: pendencia.descricao || "",
        link: pendencia.link,
        planos_aplicaveis: pendencia.planos_aplicaveis || ["academy", "business_parceria", "skills"],
        ordem: pendencia.ordem,
      });
    } else {
      setEditingPendencia(null);
      setFormData({
        tipo: "formulario",
        titulo: "",
        descricao: "",
        link: "",
        planos_aplicaveis: ["academy", "business_parceria", "skills"],
        ordem: (pendencias?.length || 0) + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPendencia(null);
    setFormData({
      tipo: "formulario",
      titulo: "",
      descricao: "",
      link: "",
      planos_aplicaveis: ["academy", "business_parceria", "skills"],
      ordem: 0,
    });
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.link) return;

    if (editingPendencia) {
      await updatePendencia.mutateAsync({
        id: editingPendencia.id,
        ...formData,
      });
    } else {
      await createPendencia.mutateAsync({
        ...formData,
        ativo: true,
        icone: null,
        referencia_id: null,
      });
    }
    handleCloseModal();
  };

  const handleTogglePlano = (plano: string) => {
    setFormData(prev => ({
      ...prev,
      planos_aplicaveis: prev.planos_aplicaveis.includes(plano)
        ? prev.planos_aplicaveis.filter(p => p !== plano)
        : [...prev.planos_aplicaveis, plano],
    }));
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePendencia.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const tipoInfo = TIPOS_PENDENCIA.find(t => t.value === tipo);
    const Icon = tipoInfo?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando pendências...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Pendências da Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Configure quais formulários aparecem para os usuários completarem
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar Pendência
        </Button>
      </div>

      <div className="space-y-3">
        {pendencias?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            Nenhuma pendência configurada
          </div>
        ) : (
          pendencias?.map((pendencia) => (
            <div 
              key={pendencia.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="text-muted-foreground cursor-move">
                <GripVertical className="h-5 w-5" />
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                {getTipoIcon(pendencia.tipo)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {pendencia.titulo}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {pendencia.tipo}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {pendencia.link}
                </div>
                <div className="flex gap-1 mt-1">
                  {pendencia.planos_aplicaveis?.map(plano => (
                    <Badge key={plano} variant="secondary" className="text-[10px] capitalize">
                      {plano}
                    </Badge>
                  ))}
                </div>
              </div>

              <Switch
                checked={pendencia.ativo}
                onCheckedChange={(ativo) => togglePendencia.mutate({ id: pendencia.id, ativo })}
              />

              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleOpenModal(pendencia)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(pendencia.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Edição/Criação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPendencia ? "Editar Pendência" : "Nova Pendência"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PENDENCIA.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Diagnóstico Estratégico"
              />
            </div>

            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="Ex: /meu-diagnostico"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição breve da pendência"
              />
            </div>

            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={formData.ordem}
                onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label>Planos que veem esta pendência</Label>
              <div className="flex gap-4 pt-1">
                {PLANOS_DISPONIVEIS.map(plano => (
                  <div key={plano.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`plano-${plano.value}`}
                      checked={formData.planos_aplicaveis.includes(plano.value)}
                      onCheckedChange={() => handleTogglePlano(plano.value)}
                    />
                    <label 
                      htmlFor={`plano-${plano.value}`} 
                      className="text-sm cursor-pointer"
                    >
                      {plano.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.titulo || !formData.link}
            >
              {editingPendencia ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pendência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pendência? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
