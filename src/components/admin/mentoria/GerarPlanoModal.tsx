import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Target, CheckCircle2 } from "lucide-react";
import { useGerarPlano } from "@/hooks/useGerarPlano";

interface GerarPlanoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  diagnostico: any;
}

export function GerarPlanoModal({ open, onOpenChange, userId, diagnostico }: GerarPlanoModalProps) {
  const { gerarPlano, isGerando } = useGerarPlano();

  const handleConfirm = () => {
    gerarPlano(userId, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Plano de Mentoria
          </DialogTitle>
          <DialogDescription>
            Baseado no diagnóstico, serão criados objetivos e tarefas personalizadas para o mentorado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Informações do Diagnóstico:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                {diagnostico.objetivo_principal && (
                  <li>• Objetivo: {diagnostico.objetivo_principal}</li>
                )}
                {diagnostico.meta_3_meses && (
                  <li>• Meta 3 meses: {diagnostico.meta_3_meses}</li>
                )}
                {diagnostico.meta_12_meses && (
                  <li>• Meta 12 meses: {diagnostico.meta_12_meses}</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              O que será criado:
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">➥</span>
                <div>
                  <strong>3-5 Objetivos Principais</strong>
                  <p className="text-muted-foreground">
                    Baseados nas metas declaradas, com prazos e descrições detalhadas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <div>
                  <strong>3-4 Quick Wins (Tarefas Iniciais)</strong>
                  <p className="text-muted-foreground">
                    Primeiras ações práticas para começar imediatamente
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>📬 Notificação:</strong> O mentorado receberá uma notificação informando que seu plano personalizado foi criado.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGerando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isGerando}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGerando ? 'Gerando...' : 'Gerar Plano'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
