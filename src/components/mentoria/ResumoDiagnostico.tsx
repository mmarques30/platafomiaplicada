import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  User, 
  Brain, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Heart, 
  CheckCircle2, 
  Printer,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";

interface ResumoDiagnosticoProps {
  formulario: any;
}

export function ResumoDiagnostico({ formulario }: ResumoDiagnosticoProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);
  
  if (!formulario) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="bg-card/50 rounded-lg p-3 border border-primary/10">
        <span className="text-xs text-primary uppercase tracking-wide font-medium">{label}</span>
        <p className="text-foreground mt-1">{value}</p>
      </div>
    );
  };

  const TextBlock = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="bg-card/50 rounded-lg p-3 border border-primary/10">
        <span className="text-xs text-primary uppercase tracking-wide font-medium">{label}</span>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{value}</p>
      </div>
    );
  };

  // Definir quais seções existem com base nos dados
  const sections = [];
  
  if (formulario.nome_completo || formulario.idade || formulario.profissao || formulario.area_atuacao || formulario.tempo_experiencia) {
    sections.push("perfil");
  }
  if (formulario.nivel_ia || formulario.frequencia_uso_ia || formulario.maior_dificuldade_ia) {
    sections.push("experiencia");
  }
  if (formulario.objetivo_principal || formulario.meta_3_meses || formulario.meta_12_meses) {
    sections.push("objetivos");
  }
  if (formulario.desafio_1 || formulario.desafio_2 || formulario.desafio_3) {
    sections.push("desafios");
  }
  if (formulario.estilo_aprendizagem || formulario.melhor_horario || formulario.tipo_feedback) {
    sections.push("aprendizagem");
  }
  if (formulario.motivacao_mentoria || formulario.maior_medo_ia || formulario.nivel_comprometimento || formulario.zona_conforto || formulario.nao_negociaveis) {
    sections.push("comprometimento");
  }
  if (formulario.tipo_suporte || formulario.frequencia_feedback || formulario.preferencia_sessoes || formulario.vitoria_30_dias || (formulario.quick_wins && formulario.quick_wins.length > 0)) {
    sections.push("prioridades");
  }

  const allExpanded = openSections.length === sections.length;

  return (
    <div className="max-w-5xl mx-auto rounded-2xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Suas Respostas do Diagnóstico
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preenchido em {formatDate(formulario.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={formulario.completado ? "default" : "secondary"} 
              className={formulario.completado ? "bg-primary text-primary-foreground" : ""}
            >
              {formulario.completado ? "Completo" : "Em andamento"}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.print()}
              className="hidden sm:flex"
            >
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Controles de Expansão */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            if (allExpanded) {
              setOpenSections([]);
            } else {
              setOpenSections(sections);
            }
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          {allExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Recolher Tudo
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expandir Tudo
            </>
          )}
        </Button>
      </div>

      {/* Accordions */}
      <div className="p-6">
        <Accordion 
          type="multiple" 
          value={openSections}
          onValueChange={setOpenSections}
          className="space-y-3"
        >
          {/* Perfil Profissional */}
          {sections.includes("perfil") && (
            <AccordionItem 
              value="perfil" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Perfil Profissional</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoItem label="Nome" value={formulario.nome_completo} />
                  <InfoItem label="Idade" value={formulario.idade ? `${formulario.idade} anos` : null} />
                  <InfoItem label="Profissão" value={formulario.profissao} />
                  <InfoItem label="Área de Atuação" value={formulario.area_atuacao} />
                  <InfoItem label="Tempo de Experiência" value={formulario.tempo_experiencia} />
                  <InfoItem label="Tamanho da Empresa" value={formulario.tamanho_empresa} />
                  {formulario.lidera_equipe && (
                    <InfoItem label="Tamanho da Equipe" value={formulario.tamanho_equipe ? `${formulario.tamanho_equipe} pessoas` : "Lidera equipe"} />
                  )}
                  {formulario.linkedin && (
                    <InfoItem label="LinkedIn" value={formulario.linkedin} />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Experiência com IA */}
          {sections.includes("experiencia") && (
            <AccordionItem 
              value="experiencia" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Experiência com IA</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <InfoItem label="Nível com IA" value={formulario.nivel_ia} />
                    <InfoItem label="Frequência de Uso" value={formulario.frequencia_uso_ia} />
                  </div>
                  {formulario.ferramentas_ia && formulario.ferramentas_ia.length > 0 && (
                    <div className="bg-card/50 rounded-lg p-3 border border-primary/10">
                      <span className="text-xs text-primary uppercase tracking-wide font-medium">Ferramentas que Usa</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(Array.isArray(formulario.ferramentas_ia) ? formulario.ferramentas_ia : []).map((f: string) => (
                          <Badge key={f} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <TextBlock label="Experiência com IA" value={formulario.experiencia_ia} />
                  <TextBlock label="Maior Dificuldade" value={formulario.maior_dificuldade_ia} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Objetivos */}
          {sections.includes("objetivos") && (
            <AccordionItem 
              value="objetivos" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Objetivos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <InfoItem label="Objetivo Principal" value={formulario.objetivo_principal} />
                    <InfoItem label="Área de Aplicação da IA" value={formulario.area_aplicacao_ia} />
                  </div>
                  <TextBlock label="Objetivo Específico" value={formulario.objetivo_especifico} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <TextBlock label="Meta para 3 Meses" value={formulario.meta_3_meses} />
                    <TextBlock label="Meta para 12 Meses" value={formulario.meta_12_meses} />
                  </div>
                  <TextBlock label="Métricas de Sucesso" value={formulario.metricas_sucesso} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Principais Desafios */}
          {sections.includes("desafios") && (
            <AccordionItem 
              value="desafios" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Principais Desafios</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  {formulario.desafio_1 && (
                    <div className="flex items-start gap-3 bg-amber-500/10 rounded-lg p-4 border-l-4 border-amber-500">
                      <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 shrink-0">1</Badge>
                      <span className="text-foreground">{formulario.desafio_1}</span>
                    </div>
                  )}
                  {formulario.desafio_2 && (
                    <div className="flex items-start gap-3 bg-amber-500/10 rounded-lg p-4 border-l-4 border-amber-500">
                      <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 shrink-0">2</Badge>
                      <span className="text-foreground">{formulario.desafio_2}</span>
                    </div>
                  )}
                  {formulario.desafio_3 && (
                    <div className="flex items-start gap-3 bg-amber-500/10 rounded-lg p-4 border-l-4 border-amber-500">
                      <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 shrink-0">3</Badge>
                      <span className="text-foreground">{formulario.desafio_3}</span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <InfoItem label="Tempo Disponível" value={formulario.tempo_disponivel} />
                    <InfoItem label="Nível de Autonomia" value={formulario.nivel_autonomia} />
                  </div>
                  <TextBlock label="Maior Ladrão de Tempo" value={formulario.maior_ladrao_tempo} />
                  <TextBlock label="Processo para Otimizar" value={formulario.processo_otimizar} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Estilo de Aprendizagem */}
          {sections.includes("aprendizagem") && (
            <AccordionItem 
              value="aprendizagem" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Estilo de Aprendizagem</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoItem label="Estilo de Aprendizagem" value={formulario.estilo_aprendizagem} />
                  <InfoItem label="Preferência de Aprendizado" value={formulario.preferencia_aprendizado} />
                  <InfoItem label="Melhor Horário" value={formulario.melhor_horario} />
                  <InfoItem label="Tipo de Feedback" value={formulario.tipo_feedback} />
                </div>
                <TextBlock label="Limitações Técnicas" value={formulario.limitacoes_tecnicas} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Comprometimento e Limites */}
          {sections.includes("comprometimento") && (
            <AccordionItem 
              value="comprometimento" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Comprometimento e Limites</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  <TextBlock label="Motivação para a Mentoria" value={formulario.motivacao_mentoria} />
                  <TextBlock label="Maior Preocupação com IA" value={formulario.maior_medo_ia} />
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {formulario.nivel_comprometimento && (
                      <div className="bg-card/50 rounded-lg p-3 border border-primary/10">
                        <span className="text-xs text-primary uppercase tracking-wide font-medium">Nível de Comprometimento</span>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(formulario.nivel_comprometimento / 10) * 100}%` }}
                            />
                          </div>
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            {formulario.nivel_comprometimento}/10
                          </Badge>
                        </div>
                      </div>
                    )}
                    <InfoItem label="Zona de Conforto" value={formulario.zona_conforto} />
                  </div>
                  
                  <TextBlock label="O que Não Quer Mudar" value={formulario.nao_negociaveis} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Prioridades e Expectativas */}
          {sections.includes("prioridades") && (
            <AccordionItem 
              value="prioridades" 
              className="border border-primary/20 rounded-xl bg-card px-4 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">Prioridades e Expectativas</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <InfoItem label="Tipo de Suporte" value={formulario.tipo_suporte} />
                    <InfoItem label="Frequência de Feedback" value={formulario.frequencia_feedback} />
                    <InfoItem label="Preferência de Sessões" value={formulario.preferencia_sessoes} />
                  </div>
                  
                  <TextBlock label="Dúvidas ou Preocupações" value={formulario.duvidas_preocupacoes} />
                  <TextBlock label="Vitória em 30 Dias" value={formulario.vitoria_30_dias} />
                  
                  {formulario.quick_wins && formulario.quick_wins.length > 0 && (
                    <div className="bg-card/50 rounded-lg p-3 border border-primary/10">
                      <span className="text-xs text-primary uppercase tracking-wide font-medium">Aprendizados Urgentes</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formulario.quick_wins.map((qw: string) => (
                          <Badge key={qw} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {qw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* Footer Mobile */}
      <div className="px-6 py-4 border-t border-border sm:hidden">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Diagnóstico
        </Button>
      </div>
    </div>
  );
}
