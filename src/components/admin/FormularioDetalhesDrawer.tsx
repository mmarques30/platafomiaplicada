import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Sparkles, Calendar, User, Target, Brain, Clock, MessageSquare, Trash2, GraduationCap, LucideIcon } from "lucide-react";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";

interface FormularioDetalhesDrawerProps {
  formulario: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

const Section = ({ icon: Icon, title, children }: SectionProps) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
      {children}
    </div>
  </div>
);

interface FieldProps {
  label: string;
  value: any;
  fullWidth?: boolean;
}

const Field = ({ label, value, fullWidth = false }: FieldProps) => {
  if (!value) return null;
  
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  const isLongText = typeof displayValue === 'string' && displayValue.length > 80;
  
  return (
    <div className={`py-1.5 ${fullWidth || isLongText ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{displayValue}</p>
    </div>
  );
};

export function FormularioDetalhesDrawer({ formulario, open, onOpenChange }: FormularioDetalhesDrawerProps) {
  const { deletarDiagnostico, isDeleting } = useDiagnosticoAdmin();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!formulario) return null;

  const handleConfirmDelete = () => {
    deletarDiagnostico(formulario.id);
    setDeleteDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <div className="flex items-start justify-between">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {formulario.profiles?.nome_completo || formulario.nome_completo || "Formulário"}
                </DrawerTitle>
                <DrawerDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(formulario.created_at), "dd/MM/yyyy 'às' HH:mm")}
                </DrawerDescription>
              </div>
              <Badge variant={formulario.completado ? "default" : "secondary"}>
                {formulario.completado ? "Completo" : "Incompleto"}
              </Badge>
            </div>
          </DrawerHeader>

          <ScrollArea className="h-[calc(90vh-200px)] px-6 pb-6">
            {/* Insight IA */}
            {formulario.insight_ia && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Insight Gerado pela IA</h3>
                  {formulario.insight_gerado_em && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(formulario.insight_gerado_em), "dd/MM/yyyy")}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {typeof formulario.insight_ia === 'object' ? (
                    Object.entries(formulario.insight_ia).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                        <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                      </div>
                    ))
                  ) : (
                    <p>{formulario.insight_ia}</p>
                  )}
                </div>
              </div>
            )}

            {/* Informações Pessoais */}
            <Section icon={User} title="Informações Pessoais">
              <Field label="Nome Completo" value={formulario.nome_completo} />
              <Field label="Idade" value={formulario.idade} />
              <Field label="LinkedIn" value={formulario.linkedin} />
              <Field label="Profissão" value={formulario.profissao} />
              <Field label="Área de Atuação" value={formulario.area_atuacao} />
              <Field label="Outra Área" value={formulario.area_atuacao_outro} />
              <Field label="Tempo de Experiência" value={formulario.tempo_experiencia} />
              <Field label="Tamanho da Empresa" value={formulario.tamanho_empresa} />
            </Section>

            {/* Experiência com IA */}
            <Section icon={Brain} title="Experiência com IA">
              <Field label="Nível em IA" value={formulario.nivel_ia} />
              <Field label="Ferramentas IA Utilizadas" value={formulario.ferramentas_ia} />
              <Field label="Outras Ferramentas" value={formulario.outras_ferramentas} />
              <Field label="Frequência de Uso" value={formulario.frequencia_uso_ia} />
              <Field label="Experiência com IA" value={formulario.experiencia_ia} fullWidth />
              <Field label="Maior Dificuldade" value={formulario.maior_dificuldade_ia} fullWidth />
            </Section>

            {/* Objetivos */}
            <Section icon={Target} title="Objetivos">
              <Field label="Objetivo Principal" value={formulario.objetivo_principal} fullWidth />
              <Field label="Objetivo Específico" value={formulario.objetivo_especifico} fullWidth />
              <Field label="Área de Aplicação" value={formulario.area_aplicacao_ia} />
              <Field label="Meta 3 Meses" value={formulario.meta_3_meses} fullWidth />
              <Field label="Meta 12 Meses" value={formulario.meta_12_meses} fullWidth />
              <Field label="Métricas de Sucesso" value={formulario.metricas_sucesso} fullWidth />
            </Section>

            {/* Cenário Atual */}
            <Section icon={MessageSquare} title="Cenário Atual">
              <Field label="Desafio Principal" value={formulario.desafio_1} fullWidth />
              <Field label="Segundo Desafio" value={formulario.desafio_2} fullWidth />
              <Field label="Terceiro Desafio" value={formulario.desafio_3} fullWidth />
              <Field label="Lidera Equipe?" value={formulario.lidera_equipe ? "Sim" : formulario.lidera_equipe === false ? "Não" : null} />
              <Field label="Tamanho da Equipe" value={formulario.tamanho_equipe} />
              <Field label="Processo a Otimizar" value={formulario.processo_otimizar} fullWidth />
              <Field label="Maior Ladrão de Tempo" value={formulario.maior_ladrao_tempo} fullWidth />
              <Field label="Quick Wins" value={formulario.quick_wins} fullWidth />
            </Section>

            {/* Estilo de Aprendizagem */}
            <Section icon={GraduationCap} title="Estilo de Aprendizagem">
              <Field label="Estilo de Aprendizagem" value={formulario.estilo_aprendizagem} />
              <Field label="Preferência de Aprendizado" value={formulario.preferencia_aprendizado} />
              <Field label="Preferência de Sessões" value={formulario.preferencia_sessoes} />
              <Field label="Frequência de Feedback" value={formulario.frequencia_feedback} />
              <Field label="Tipo de Suporte" value={formulario.tipo_suporte} />
              <Field label="Melhor Horário" value={formulario.melhor_horario} />
            </Section>

            {/* Motivação */}
            <Section icon={Sparkles} title="Motivação">
              <Field label="Não Negociáveis" value={formulario.nao_negociaveis} fullWidth />
              <Field label="Zona de Conforto" value={formulario.zona_conforto} fullWidth />
              <Field label="Maior Medo com IA" value={formulario.maior_medo_ia} fullWidth />
              <Field label="Nível de Autonomia" value={formulario.nivel_autonomia} />
              <Field label="Limitações Técnicas" value={formulario.limitacoes_tecnicas} fullWidth />
              <Field label="Tipo de Feedback" value={formulario.tipo_feedback} />
            </Section>

            {/* Expectativas */}
            <Section icon={Clock} title="Expectativas">
              <Field label="Motivação para Mentoria" value={formulario.motivacao_mentoria} fullWidth />
              <Field label="Vitória em 30 Dias" value={formulario.vitoria_30_dias} fullWidth />
              <Field label="Dúvidas/Preocupações" value={formulario.duvidas_preocupacoes} fullWidth />
              <Field label="Tempo Disponível" value={formulario.tempo_disponivel} />
              <Field label="Nível de Comprometimento" value={formulario.nivel_comprometimento ? `${formulario.nivel_comprometimento}/10` : null} />
            </Section>
          </ScrollArea>

          <DrawerFooter className="border-t">
            <div className="flex justify-between w-full">
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Diagnóstico
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir diagnóstico?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o diagnóstico de{" "}
              <strong>{formulario.profiles?.nome_completo || formulario.nome_completo || "este usuário"}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
