import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiagnosticoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  diagnostico?: any;
}

export function DiagnosticoFormModal({ open, onOpenChange, userId, diagnostico }: DiagnosticoFormModalProps) {
  const { salvarDiagnostico, isSaving } = useDiagnosticoAdmin(userId);
  const [formData, setFormData] = useState({
    nome_completo: "",
    profissao: "",
    area_atuacao: "",
    objetivo_principal: "",
    experiencia_ia: "",
    nivel_ia: "",
    observacoes_admin: "",
  });

  useEffect(() => {
    if (diagnostico) {
      setFormData({
        nome_completo: diagnostico.nome_completo || "",
        profissao: diagnostico.profissao || "",
        area_atuacao: diagnostico.area_atuacao || "",
        objetivo_principal: diagnostico.objetivo_principal || "",
        experiencia_ia: diagnostico.experiencia_ia || "",
        nivel_ia: diagnostico.nivel_ia || "",
        observacoes_admin: diagnostico.observacoes_admin || "",
      });
    }
  }, [diagnostico]);

  const handleSubmit = () => {
    salvarDiagnostico(
      { userId, dados: formData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{diagnostico ? 'Editar' : 'Preencher'} Diagnóstico Manualmente</DialogTitle>
          <DialogDescription>
            Preencha os campos principais do diagnóstico do mentorado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="profissao">Profissão</Label>
              <Input
                id="profissao"
                value={formData.profissao}
                onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="area_atuacao">Área de Atuação</Label>
              <Select
                value={formData.area_atuacao}
                onValueChange={(value) => setFormData({ ...formData, area_atuacao: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="rh">Recursos Humanos</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacoes">Operações</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="objetivo_principal">Objetivo Principal</Label>
              <Textarea
                id="objetivo_principal"
                value={formData.objetivo_principal}
                onChange={(e) => setFormData({ ...formData, objetivo_principal: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="experiencia_ia">Experiência com IA</Label>
              <Select
                value={formData.experiencia_ia}
                onValueChange={(value) => setFormData({ ...formData, experiencia_ia: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nunca_usei">Nunca usei</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nivel_ia">Nível desejado em IA</Label>
              <Select
                value={formData.nivel_ia}
                onValueChange={(value) => setFormData({ ...formData, nivel_ia: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes_admin">Observações do Admin</Label>
              <Textarea
                id="observacoes_admin"
                placeholder="Adicione observações sobre o diagnóstico..."
                value={formData.observacoes_admin}
                onChange={(e) => setFormData({ ...formData, observacoes_admin: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
