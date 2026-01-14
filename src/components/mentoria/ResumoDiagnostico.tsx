import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Brain, Target, AlertTriangle, Lightbulb, Heart, CheckCircle2 } from "lucide-react";

interface ResumoDiagnosticoProps {
  formulario: any;
}

export function ResumoDiagnostico({ formulario }: ResumoDiagnosticoProps) {
  if (!formulario) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-aplicada-green/10">
        <Icon className="h-5 w-5 text-aplicada-green" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="py-2">
        <span className="font-medium text-foreground">{label}:</span>{" "}
        <span className="text-muted-foreground">{value}</span>
      </div>
    );
  };

  const TextBlock = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="py-2">
        <span className="font-medium text-foreground block mb-1">{label}:</span>
        <p className="text-muted-foreground bg-muted/50 rounded-lg p-3 text-sm">{value}</p>
      </div>
    );
  };

  return (
    <Card className="max-w-5xl mx-auto border-aplicada-green/20">
      <CardHeader className="bg-gradient-to-r from-aplicada-green/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl">Seu Diagnóstico de Mentoria IA</CardTitle>
            <CardDescription className="mt-2">
              Preenchido em {formatDate(formulario.created_at)}
            </CardDescription>
          </div>
          <Badge 
            variant={formulario.completado ? "default" : "secondary"} 
            className={formulario.completado ? "bg-aplicada-green text-white" : ""}
          >
            {formulario.completado ? "Completo" : "Em andamento"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Perfil Profissional */}
        {(formulario.nome_completo || formulario.idade || formulario.profissao || formulario.area_atuacao || formulario.tempo_experiencia) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={User} title="Perfil Profissional" />
            <div className="grid md:grid-cols-2 gap-x-6 text-sm">
              <InfoItem label="Nome" value={formulario.nome_completo} />
              <InfoItem label="Idade" value={formulario.idade ? `${formulario.idade} anos` : null} />
              <InfoItem label="Profissão" value={formulario.profissao} />
              <InfoItem label="Área" value={formulario.area_atuacao} />
              <InfoItem label="Experiência" value={formulario.tempo_experiencia} />
            </div>
          </div>
        )}

        {/* Experiência com IA */}
        {(formulario.nivel_ia || formulario.frequencia_uso_ia || formulario.maior_dificuldade_ia) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={Brain} title="Experiência com IA" />
            <div className="grid md:grid-cols-2 gap-x-6 text-sm">
              <InfoItem label="Nível" value={formulario.nivel_ia} />
              <InfoItem label="Frequência de uso" value={formulario.frequencia_uso_ia} />
            </div>
            <TextBlock label="Maior dificuldade" value={formulario.maior_dificuldade_ia} />
          </div>
        )}

        {/* Objetivos */}
        {(formulario.objetivo_principal || formulario.meta_3_meses || formulario.meta_12_meses) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={Target} title="Objetivos" />
            <div className="text-sm space-y-2">
              <InfoItem label="Objetivo principal" value={formulario.objetivo_principal} />
              <TextBlock label="Meta 3 meses" value={formulario.meta_3_meses} />
              <TextBlock label="Meta 12 meses" value={formulario.meta_12_meses} />
            </div>
          </div>
        )}

        {/* Principais Desafios */}
        {(formulario.desafio_1 || formulario.desafio_2 || formulario.desafio_3) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={AlertTriangle} title="Principais Desafios" />
            <div className="space-y-3 text-sm">
              {formulario.desafio_1 && (
                <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                  <Badge variant="outline" className="shrink-0">1</Badge>
                  <span className="text-muted-foreground">{formulario.desafio_1}</span>
                </div>
              )}
              {formulario.desafio_2 && (
                <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                  <Badge variant="outline" className="shrink-0">2</Badge>
                  <span className="text-muted-foreground">{formulario.desafio_2}</span>
                </div>
              )}
              {formulario.desafio_3 && (
                <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                  <Badge variant="outline" className="shrink-0">3</Badge>
                  <span className="text-muted-foreground">{formulario.desafio_3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estilo de Aprendizagem */}
        {(formulario.estilo_aprendizagem || formulario.melhor_horario || formulario.tipo_feedback) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={Lightbulb} title="Estilo de Aprendizagem" />
            <div className="grid md:grid-cols-2 gap-x-6 text-sm">
              <InfoItem label="Estilo" value={formulario.estilo_aprendizagem} />
              <InfoItem label="Melhor horário" value={formulario.melhor_horario} />
              <InfoItem label="Tipo de feedback" value={formulario.tipo_feedback} />
            </div>
          </div>
        )}

        {/* Comprometimento e Limites - Exibe se existir qualquer campo */}
        {(formulario.motivacao_mentoria || formulario.maior_medo_ia || formulario.nivel_comprometimento || formulario.zona_conforto || formulario.nao_negociaveis) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={Heart} title="Comprometimento e Limites" />
            <div className="text-sm space-y-2">
              <TextBlock label="O que te motivou" value={formulario.motivacao_mentoria} />
              <TextBlock label="Maior preocupação com IA" value={formulario.maior_medo_ia} />
              {formulario.nivel_comprometimento && (
                <div className="py-2">
                  <span className="font-medium text-foreground">Comprometimento:</span>{" "}
                  <Badge variant="outline" className="ml-2 bg-aplicada-green/10 text-aplicada-green border-aplicada-green/30">
                    {formulario.nivel_comprometimento}/10
                  </Badge>
                </div>
              )}
              <InfoItem label="Zona de conforto" value={formulario.zona_conforto} />
              <TextBlock label="O que não quer mudar" value={formulario.nao_negociaveis} />
            </div>
          </div>
        )}

        {/* Prioridades e Expectativas - Exibe se existir qualquer campo */}
        {(formulario.tipo_suporte || formulario.frequencia_feedback || formulario.preferencia_sessoes || formulario.vitoria_30_dias || (formulario.quick_wins && formulario.quick_wins.length > 0)) && (
          <div className="rounded-xl border border-border/50 p-5 bg-card">
            <SectionHeader icon={CheckCircle2} title="Prioridades e Expectativas" />
            <div className="text-sm space-y-2">
              <InfoItem label="Tipo de suporte" value={formulario.tipo_suporte} />
              <InfoItem label="Frequência de feedback" value={formulario.frequencia_feedback} />
              <InfoItem label="Preferência de sessões" value={formulario.preferencia_sessoes} />
              <TextBlock label="Vitória em 30 dias" value={formulario.vitoria_30_dias} />
              {formulario.quick_wins && formulario.quick_wins.length > 0 && (
                <div className="py-2">
                  <span className="font-medium text-foreground block mb-2">Aprendizados urgentes:</span>
                  <div className="flex flex-wrap gap-2">
                    {formulario.quick_wins.map((qw: string) => (
                      <Badge key={qw} variant="secondary" className="bg-aplicada-green/10 text-aplicada-green border-aplicada-green/20">
                        {qw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 pt-6 border-t">
        <Button variant="outline" onClick={() => window.print()}>
          Imprimir
        </Button>
      </CardFooter>
    </Card>
  );
}