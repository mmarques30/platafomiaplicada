import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { useState, useEffect } from "react";
import { Loader2, Video, FileText, Target } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
    // Novos campos de Feedback Mentora
    video_call_url: "",
    transcricao_call_url: "",
    link_plano_execucao: "",
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
        video_call_url: diagnostico.video_call_url || "",
        transcricao_call_url: diagnostico.transcricao_call_url || "",
        link_plano_execucao: diagnostico.link_plano_execucao || "",
      });
    }
  }, [diagnostico]);

  const handleSubmit = () => {
    // Se algum campo de feedback foi preenchido, adiciona timestamp
    const hasFeedback = formData.video_call_url || formData.transcricao_call_url || formData.link_plano_execucao;
    const payload = {
      ...formData,
      ...(hasFeedback && !diagnostico?.feedback_mentora_em ? { feedback_mentora_em: new Date().toISOString() } : {}),
    };

    salvarDiagnostico(
      { userId, dados: payload },
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

            {/* Seção de Feedback da Mentora (Academy) */}
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Video className="h-5 w-5" />
                <h3 className="font-semibold">Feedback da Mentora (Academy)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Preencha os campos abaixo após realizar a call de diagnóstico com o mentorado.
              </p>

              <div>
                <Label htmlFor="video_call_url" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  URL do Vídeo da Call
                </Label>
                <Input
                  id="video_call_url"
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                  value={formData.video_call_url}
                  onChange={(e) => setFormData({ ...formData, video_call_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="transcricao_call_url" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  URL da Transcrição
                </Label>
                <Input
                  id="transcricao_call_url"
                  placeholder="https://docs.google.com/... ou https://notion.so/..."
                  value={formData.transcricao_call_url}
                  onChange={(e) => setFormData({ ...formData, transcricao_call_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="link_plano_execucao" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Link do Plano de Execução
                </Label>
                <Input
                  id="link_plano_execucao"
                  placeholder="https://notion.so/... ou https://docs.google.com/..."
                  value={formData.link_plano_execucao}
                  onChange={(e) => setFormData({ ...formData, link_plano_execucao: e.target.value })}
                />
              </div>
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
