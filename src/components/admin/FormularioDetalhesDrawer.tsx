import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Sparkles, Calendar, User, Target, Brain, Clock, MessageSquare } from "lucide-react";

interface FormularioDetalhesDrawerProps {
  formulario: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormularioDetalhesDrawer({ formulario, open, onOpenChange }: FormularioDetalhesDrawerProps) {
  if (!formulario) return null;

  const renderField = (label: string, value: any) => {
    if (!value) return null;
    
    return (
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-sm">{Array.isArray(value) ? value.join(", ") : value}</p>
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-start justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {formulario.profiles?.nome_completo || "Formulário"}
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

        <ScrollArea className="h-[calc(90vh-120px)] px-6 pb-6">
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

          <Separator className="my-4" />

          {/* Etapas do Formulário */}
          <Accordion type="multiple" defaultValue={["step1", "step3", "step7"]} className="w-full">
            {/* Etapa 1: Informações Pessoais */}
            <AccordionItem value="step1">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Etapa 1: Informações Pessoais</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Nome Completo", formulario.nome_completo)}
                {renderField("Email", formulario.profiles?.email)}
                {renderField("Idade", formulario.idade)}
                {renderField("LinkedIn", formulario.linkedin)}
                {renderField("Profissão", formulario.profissao)}
                {renderField("Área de Atuação", formulario.area_atuacao)}
                {renderField("Outra Área", formulario.area_atuacao_outro)}
                {renderField("Tempo de Experiência", formulario.tempo_experiencia)}
                {renderField("Tamanho da Empresa", formulario.tamanho_empresa)}
              </AccordionContent>
            </AccordionItem>

            {/* Etapa 2: Experiência com IA */}
            <AccordionItem value="step2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Etapa 2: Experiência com IA</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Nível em IA", formulario.nivel_ia)}
                {renderField("Ferramentas IA Utilizadas", formulario.ferramentas_ia)}
                {renderField("Outras Ferramentas", formulario.outras_ferramentas)}
                {renderField("Frequência de Uso", formulario.frequencia_uso_ia)}
                {renderField("Experiência com IA", formulario.experiencia_ia)}
                {renderField("Maior Dificuldade", formulario.maior_dificuldade_ia)}
              </AccordionContent>
            </AccordionItem>

            {/* Etapa 3: Objetivos */}
            <AccordionItem value="step3">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Etapa 3: Objetivos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Objetivo Principal", formulario.objetivo_principal)}
                {renderField("Objetivo Específico", formulario.objetivo_especifico)}
                {renderField("Área de Aplicação", formulario.area_aplicacao_ia)}
                {renderField("Meta 3 Meses", formulario.meta_3_meses)}
                {renderField("Meta 12 Meses", formulario.meta_12_meses)}
                {renderField("Métricas de Sucesso", formulario.metricas_sucesso)}
              </AccordionContent>
            </AccordionItem>

            {/* Etapa 4: Cenário Atual */}
            <AccordionItem value="step4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Etapa 4: Cenário Atual</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Desafio Principal", formulario.desafio_1)}
                {renderField("Segundo Desafio", formulario.desafio_2)}
                {renderField("Terceiro Desafio", formulario.desafio_3)}
                {renderField("Lidera Equipe?", formulario.lidera_equipe ? "Sim" : "Não")}
                {renderField("Tamanho da Equipe", formulario.tamanho_equipe)}
                {renderField("Processo a Otimizar", formulario.processo_otimizar)}
                {renderField("Maior Ladrão de Tempo", formulario.maior_ladrao_tempo)}
                {renderField("Quick Wins", formulario.quick_wins)}
              </AccordionContent>
            </AccordionItem>

            {/* Etapa 5: Estilo de Aprendizagem */}
            <AccordionItem value="step5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Etapa 5: Estilo de Aprendizagem</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Estilo de Aprendizagem", formulario.estilo_aprendizagem)}
                {renderField("Preferência de Aprendizado", formulario.preferencia_aprendizado)}
                {renderField("Preferência de Sessões", formulario.preferencia_sessoes)}
                {renderField("Frequência de Feedback", formulario.frequencia_feedback)}
                {renderField("Tipo de Suporte", formulario.tipo_suporte)}
                {renderField("Melhor Horário", formulario.melhor_horario)}
              </AccordionContent>
            </AccordionItem>

            {/* Etapa 6: Motivação */}
            <AccordionItem value="step6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Etapa 6: Motivação</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Não Negociáveis", formulario.nao_negociaveis)}
                {renderField("Zona de Conforto", formulario.zona_conforto)}
                {renderField("Maior Medo com IA", formulario.maior_medo_ia)}
                {renderField("Nível de Autonomia", formulario.nivel_autonomia)}
                {renderField("Limitações Técnicas", formulario.limitacoes_tecnicas)}
                {renderField("Tipo de Feedback", formulario.tipo_feedback)}
              </AccordionContent>
            </AccordionItem>

            {/* Etapa 7: Expectativas */}
            <AccordionItem value="step7">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Etapa 7: Expectativas</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {renderField("Motivação para Mentoria", formulario.motivacao_mentoria)}
                {renderField("Vitória em 30 Dias", formulario.vitoria_30_dias)}
                {renderField("Dúvidas/Preocupações", formulario.duvidas_preocupacoes)}
                {renderField("Tempo Disponível", formulario.tempo_disponivel)}
                {renderField("Nível de Comprometimento", formulario.nivel_comprometimento ? `${formulario.nivel_comprometimento}/10` : null)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
