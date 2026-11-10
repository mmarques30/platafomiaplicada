import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Bot, 
  Map, 
  PlayCircle, 
  GraduationCap, 
  ArrowRight,
  Lightbulb,
  Clock,
  Loader2,
  Target,
  AlertTriangle,
  Rocket,
  CheckCircle2,
  User,
  Folder,
  Wrench
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError } from "@/lib/edge-functions";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";

// Tipos completos do insight gerado pela IA
interface FerramentaEtapa {
  nome: string;
  foco?: string;
}

interface TrilhaRecomendadaEtapa {
  trilha_id?: string;
  titulo: string;
}

interface EtapaEvolucao {
  numero: number;
  titulo: string;
  objetivo: string;
  duracao_estimada: string;
  ferramentas: FerramentaEtapa[];
  trilhas_recomendadas: TrilhaRecomendadaEtapa[];
  entregavel: string;
}

interface FerramentaPrioritaria {
  nome: string;
  categoria?: string;
  motivo?: string;
  nivel_prioridade?: number;
  prioridade?: number;
  gratuito?: boolean;
}

interface Objetivo {
  objetivo: string;
  tipo: 'curto_prazo' | 'medio_prazo' | 'longo_prazo';
  prioridade?: number;
}

interface FerramentaProjeto {
  nome: string;
  uso_no_projeto?: string;
}

interface Projeto {
  titulo: string;
  descricao: string;
  objetivo_projeto?: string;
  contribuicao_plano?: string;
  ferramentas_projeto?: FerramentaProjeto[];
  trilhas_recomendadas?: TrilhaRecomendadaEtapa[];
}

interface Oportunidade {
  titulo: string;
  descricao: string;
}

interface InsightCompleto {
  etapas_evolucao?: EtapaEvolucao[];
  analise_perfil?: string;
  oportunidades?: Oportunidade[] | string[];
  primeiros_passos?: string[];
  alerta_desafios?: string;
  recomendacao_foco?: string;
  ferramentas_prioritarias?: FerramentaPrioritaria[];
  objetivos?: Objetivo[];
  projetos?: Projeto[];
  trilhas_recomendadas?: Array<{ titulo: string; modulo_id?: string }>;
  roadmap?: Array<{ etapa: string; titulo: string; descricao: string }>;
}

interface DiagnosticoAcademyPanelProps {
  diagnostico: {
    id: string;
    nome_completo?: string | null;
    insight_ia?: unknown;
    insight_gerado_em?: string | null;
    completado?: boolean | null;
    ferramentas_ia?: unknown;
    // Campos do formulário que podem estar parcialmente preenchidos
    profissao?: string | null;
    area_atuacao?: string | null;
    tempo_experiencia?: string | null;
    tamanho_empresa?: string | null;
    nivel_ia?: string | null;
    frequencia_uso_ia?: string | null;
    maior_dificuldade_ia?: string | null;
    objetivo_principal?: string | null;
    meta_3_meses?: string | null;
    meta_12_meses?: string | null;
    area_aplicacao_ia?: string | null;
    desafio_1?: string | null;
    desafio_2?: string | null;
    desafio_3?: string | null;
    tempo_disponivel?: string | null;
    estilo_aprendizagem?: string | null;
    maior_medo_ia?: string | null;
    vitoria_30_dias?: string | null;
    [key: string]: unknown;
  };
}

export function DiagnosticoAcademyPanel({ diagnostico }: DiagnosticoAcademyPanelProps) {
  const navigate = useNavigate();
  const { refetch } = useMentoriaForm();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const insight = diagnostico.insight_ia as InsightCompleto | null;

  const dataGeracao = diagnostico.insight_gerado_em
    ? format(new Date(diagnostico.insight_gerado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  // Função para gerar insight via IA
  const gerarInsight = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('gerar-insight-mentoria', {
        body: { formulario_id: diagnostico.id }
      });

      if (error) throw error;

      toast.success("Diagnóstico gerado com sucesso!");
      refetch();
    } catch (error: any) {
      // Propaga o erro real (mensagem da edge function) pra ficar visível
      // pra quem está testando. O cliente supabase-js mostra "non-2xx
      // status code" como genérico; a mensagem real vem no body.
      console.error('Erro ao gerar insight:', error);
      const msg = await extractEdgeFunctionError(error);
      toast.error(`Erro ao gerar diagnóstico: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Se há respostas mas ainda não tem insight, dispara AUTOMATICAMENTE
  // a geração — Mari pediu: "ela já preencheu parcial e isso já deveria
  // gerar insight de IA". Antes mostrava só um botão estático.
  const temRespostas = !!(
    diagnostico.profissao ||
    diagnostico.area_atuacao ||
    diagnostico.objetivo_principal ||
    (Array.isArray(diagnostico.ferramentas_ia) && diagnostico.ferramentas_ia.length > 0)
  );
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    if (!insight && temRespostas && !isGenerating && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      gerarInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insight, temRespostas]);

  if (!insight) {
    return (
      <Card className="border border-aplicada-green-800/20">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-aplicada-green-700/10 flex items-center justify-center">
              {isGenerating ? (
                <Loader2 className="h-10 w-10 text-aplicada-green-700 animate-spin" />
              ) : (
                <Sparkles className="h-10 w-10 text-aplicada-green-700" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {isGenerating
                  ? "Gerando seu plano com base no que você já preencheu..."
                  : temRespostas
                    ? "Gerar plano com o que você já compartilhou"
                    : "Gere Seu Plano de Desenvolvimento"}
              </h3>
              {!temRespostas && (
                <p className="text-muted-foreground max-w-md mx-auto">
                  Com base nas informações que você compartilhou, nossa IA irá criar um plano personalizado de aprendizado em IA.
                </p>
              )}
            </div>
            <Button size="pill-lg" onClick={gerarInsight} disabled={isGenerating}>
              {isGenerating
                ? "Gerando diagnóstico..."
                : temRespostas
                  ? "Gerar meu plano agora"
                  : "Gerar meu diagnóstico com IA"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extrair dados do insight
  const etapasEvolucao = insight.etapas_evolucao || [];
  const analisePerfil = insight.analise_perfil;
  const ferramentas = insight.ferramentas_prioritarias || [];
  const primeirosPassos = insight.primeiros_passos || [];
  const objetivos = insight.objetivos || [];
  const projetos = insight.projetos || [];
  const alertaDesafios = insight.alerta_desafios;
  const recomendacaoFoco = insight.recomendacao_foco;
  const trilhasRecomendadas = insight.trilhas_recomendadas || [];
  const roadmap = insight.roadmap || [];
  
  // Oportunidades podem vir como array de strings ou objetos
  const oportunidades = insight.oportunidades || [];

  // Agrupar objetivos por tipo
  const objetivosCurtoPrazo = objetivos.filter(o => o.tipo === 'curto_prazo');
  const objetivosMedioPrazo = objetivos.filter(o => o.tipo === 'medio_prazo');
  const objetivosLongoPrazo = objetivos.filter(o => o.tipo === 'longo_prazo');

  return (
    <div className="space-y-8">
      {/*
        O cabeçalho do plano.
        
        Era um ícone grande dentro de um quadrado verde tingido, ao lado de um
        título em negrito. Agora é o painel de marca com o símbolo atrás, o
        título em serifa como o resto da plataforma, e uma linha de números que
        diz o tamanho do plano antes de a pessoa rolar: quantas etapas, quantas
        ferramentas, quanto tempo.
      */}
      <section className="painel-marca px-5 pb-6 pt-7 md:px-8 md:pb-7 md:pt-9">
        <MarcaIAplicada className="marca-de-fundo -right-[10%] top-1/2 h-[170%] w-auto max-w-none -translate-y-1/2 rotate-[12deg] md:right-0 md:h-[140%]" />

        <div className="relative">
          <span className="rotulo-mono">Plano gerado por IA</span>
          <h1 className="font-serif-display mt-2 text-3xl leading-[1.05] text-foreground md:text-4xl">
            Seu plano de <em className="font-serif-italic text-primary">desenvolvimento</em>
          </h1>
          {dataGeracao && (
            <p className="mt-2 text-sm text-muted-foreground">Gerado em {dataGeracao}</p>
          )}

          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { rotulo: "Etapas", valor: etapasEvolucao.length },
              { rotulo: "Ferramentas", valor: ferramentas.length },
              { rotulo: "Objetivos", valor: objetivos.length },
              { rotulo: "Projetos", valor: projetos.length },
            ]
              .filter((item) => item.valor > 0)
              .map((item) => (
                <div key={item.rotulo} className="vidro px-4 py-3">
                  <dt className="rotulo-mono text-[10px]">{item.rotulo}</dt>
                  <dd className="numero-painel mt-1.5 text-2xl text-foreground">{item.valor}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>

      {/*
        As três leituras do plano.
        
        Eram três cards de largura cheia, empilhados, cada um com degradê
        próprio e um ícone dentro de um quadrado tingido — verde, âmbar e
        vermelho. Três faixas coloridas atravessando a tela, uma embaixo da
        outra, e o vermelho fazia "desafios" parecer um erro do sistema.
        
        Agora são três colunas da mesma altura, na superfície comum. A cor
        ficou num fio de 2px na borda esquerda e no ícone: o bastante para
        distinguir perfil, foco e alerta, sem três manchas competindo.
      */}
      {(analisePerfil || recomendacaoFoco || alertaDesafios) && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { chave: "perfil", titulo: "Seu perfil", texto: analisePerfil, Icone: User, cor: "hsl(var(--primary))" },
            { chave: "foco", titulo: "Foco dos próximos 30 dias", texto: recomendacaoFoco, Icone: Rocket, cor: "hsl(var(--status-warning))" },
            { chave: "alerta", titulo: "Onde você pode travar", texto: alertaDesafios, Icone: AlertTriangle, cor: "hsl(var(--status-danger))" },
          ]
            .filter((bloco) => bloco.texto)
            .map(({ chave, titulo, texto, Icone, cor }) => (
              <section
                key={chave}
                className="superficie relative overflow-hidden p-5 pl-6"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[2px]"
                  style={{ background: cor }}
                />
                <div className="flex items-center gap-2">
                  <Icone className="h-3.5 w-3.5 shrink-0" style={{ color: cor }} strokeWidth={1.75} />
                  <h2 className="titulo-bloco text-sm text-foreground">{titulo}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{texto}</p>
              </section>
            ))}
        </div>
      )}

      {/*
        As ferramentas, por prioridade.
        
        Eram cinco cartões centrados, cada um com o mesmo robô dentro do mesmo
        quadrado verde — cinco ícones iguais que não distinguiam nada — e a
        prioridade escondida numa etiqueta pequena embaixo. Agora a prioridade
        é a ordem e é a barra: o olho compara comprimentos a partir de uma base
        comum, que é como se responde "qual vem primeiro".
      */}
      {ferramentas.length > 0 && (
        <section className="superficie p-5">
          <header className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="titulo-bloco text-sm text-foreground">
              Ferramentas que você vai dominar
            </h2>
            <span className="rotulo-mono text-[10px]">Por prioridade</span>
          </header>

          <ol className="space-y-3">
            {ferramentas.slice(0, 5).map((ferramenta, index) => {
              const prioridade = ferramenta.prioridade ?? ferramenta.nivel_prioridade ?? index + 1;
              // A barra desce do topo: a primeira ferramenta é a mais cheia.
              const forca = Math.max(0.25, 1 - index * 0.17);
              return (
                <li key={`${ferramenta.nome}-${index}`} className="flex items-start gap-4">
                  <span className="rotulo-mono w-4 shrink-0 pt-0.5 text-[11px] text-primary">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="text-sm font-medium text-foreground">{ferramenta.nome}</span>
                      {ferramenta.categoria && (
                        <span className="text-[11px] text-muted-foreground">
                          {ferramenta.categoria}
                        </span>
                      )}
                      {ferramenta.gratuito && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          Gratuita
                        </span>
                      )}
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${forca * 100}%` }}
                      />
                    </div>

                    {ferramenta.motivo && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {ferramenta.motivo}
                      </p>
                    )}
                  </div>

                  <span className="rotulo-mono shrink-0 pt-0.5 text-[10px]">P{prioridade}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Seção: Etapas de Evolução */}
      {etapasEvolucao.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Suas Etapas de Evolução</h2>
          <div className="relative pl-8">
            {/* Timeline vertical */}
            <div className="absolute bottom-2 left-3 top-2 w-px bg-border" />
            
            {etapasEvolucao.map((etapa, index) => (
              <div key={index} className="relative flex gap-4 mb-6 last:mb-0">
                {/* Círculo numerado */}
                <div className="absolute -left-5 grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                  {etapa.numero || index + 1}
                </div>
                
                {/* Card da etapa */}
                <Card className="flex-1">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-lg">{etapa.titulo}</h3>
                      <Badge variant="outline" className="border-aplicada-green-700/30 text-aplicada-green-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {etapa.duracao_estimada}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{etapa.objetivo}</p>
                    
                    {/* Ferramentas da etapa */}
                    {etapa.ferramentas && etapa.ferramentas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Ferramentas:</p>
                        <div className="flex flex-wrap gap-2">
                          {etapa.ferramentas.map((ferramenta, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Bot className="h-3 w-3 mr-1" />
                              {ferramenta.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Trilhas da etapa */}
                    {etapa.trilhas_recomendadas && etapa.trilhas_recomendadas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Trilhas:</p>
                        <div className="flex flex-wrap gap-2">
                          {etapa.trilhas_recomendadas.map((trilha, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {trilha.titulo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Entregável */}
                    {etapa.entregavel && (
                      <div className="bg-aplicada-green-700/10 rounded-lg p-3 mt-3">
                        <p className="text-xs text-aplicada-green-700 uppercase tracking-wide mb-1">
                          <CheckCircle2 className="h-3 w-3 inline mr-1" />
                          Entregável:
                        </p>
                        <p className="text-sm text-foreground font-medium">{etapa.entregavel}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fallback: Roadmap antigo (se não tiver etapas_evolucao) */}
      {etapasEvolucao.length === 0 && roadmap.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Seu Roadmap de Aprendizado</h2>
          <div className="relative pl-8">
            <div className="absolute bottom-2 left-3 top-2 w-px bg-border" />
            
            {roadmap.map((etapa, index) => (
              <div key={index} className="relative flex gap-4 mb-6 last:mb-0">
                <div className="absolute -left-5 grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{etapa.etapa}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{etapa.titulo}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{etapa.descricao}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seção: Objetivos Estratégicos */}
      {objetivos.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Seus Objetivos Estratégicos</h2>
          {/*
            Os três horizontes eram verde, azul e cinza — um semáforo aplicado
            a uma linha do tempo, onde a cor não significa nada: longo prazo
            não é pior que curto. Agora são três colunas iguais, e o que
            distingue é o rótulo e a posição.
          */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { rotulo: "Curto prazo", apoio: "Próximas semanas", itens: objetivosCurtoPrazo },
              { rotulo: "Médio prazo", apoio: "Próximos meses", itens: objetivosMedioPrazo },
              { rotulo: "Longo prazo", apoio: "O ano", itens: objetivosLongoPrazo },
            ].map((coluna) => (
              <section key={coluna.rotulo} className="superficie p-5">
                <header className="mb-4">
                  <h3 className="titulo-bloco text-sm text-foreground">{coluna.rotulo}</h3>
                  <span className="rotulo-mono text-[10px]">{coluna.apoio}</span>
                </header>
                {coluna.itens.length > 0 ? (
                  <ul className="space-y-2.5">
                    {coluna.itens.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={2}
                        />
                        <p className="text-sm leading-relaxed text-foreground">{obj.objetivo}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nada definido para este horizonte.</p>
                )}
              </section>
            ))}
          </div>
        </section>
      )}

      {/* Seção: Projetos Práticos */}
      {projetos.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Projetos Práticos Sugeridos</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {projetos.map((projeto, index) => (
              <AccordionItem key={index} value={`projeto-${index}`} className="border border-aplicada-green-800/20 rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-lg bg-aplicada-green-700/10">
                      <Folder className="h-5 w-5 text-aplicada-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{projeto.titulo}</p>
                      <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-2 pl-12">
                    {projeto.objetivo_projeto && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Objetivo:</p>
                        <p className="text-sm text-foreground">{projeto.objetivo_projeto}</p>
                      </div>
                    )}
                    {projeto.contribuicao_plano && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contribuição para seu plano:</p>
                        <p className="text-sm text-foreground">{projeto.contribuicao_plano}</p>
                      </div>
                    )}
                    {projeto.ferramentas_projeto && projeto.ferramentas_projeto.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Ferramentas a usar:</p>
                        <div className="space-y-2">
                          {projeto.ferramentas_projeto.map((ferramenta, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2">
                              <Wrench className="h-4 w-4 text-aplicada-green-700 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">{ferramenta.nome}</p>
                                {ferramenta.uso_no_projeto && (
                                  <p className="text-xs text-muted-foreground">{ferramenta.uso_no_projeto}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Seção: Por Onde Começar */}
      {primeirosPassos.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Por Onde Começar</h2>
          <div className="space-y-3">
            {primeirosPassos.map((passo, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-aplicada-green-800/20"
              >
                <div className="w-7 h-7 rounded-full bg-aplicada-green-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-foreground pt-0.5">{passo}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seção: Oportunidades Identificadas */}
      {oportunidades.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Oportunidades Identificadas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {oportunidades.map((oportunidade, index) => {
              // Pode ser string ou objeto
              const isString = typeof oportunidade === 'string';
              return (
                <Card 
                  key={index}
                  className="bg-card border border-aplicada-green-800/20"
                >
                  <CardContent className="p-4">
                    {isString ? (
                      <p className="text-foreground">{oportunidade}</p>
                    ) : (
                      <>
                        <h3 className="font-semibold text-foreground mb-1">{(oportunidade as Oportunidade).titulo}</h3>
                        <p className="text-sm text-muted-foreground">{(oportunidade as Oportunidade).descricao}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção: Trilhas Recomendadas */}
      {trilhasRecomendadas.length > 0 && (
        <section>
          <h2 className="titulo-bloco mb-4 text-base text-foreground">Trilhas Recomendadas</h2>
          <div className="space-y-3">
            {trilhasRecomendadas.map((trilha, index) => (
              <Card 
                key={index}
                className="bg-card border border-aplicada-green-800/20 hover:border-aplicada-green-700/40 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-aplicada-green-700/10 flex items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-aplicada-green-700" />
                    </div>
                    <span className="font-medium text-foreground">{trilha.titulo}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(trilha.modulo_id ? `/trilhas/${trilha.modulo_id}` : '/trilhas')}
                    className="bg-aplicada-green-700 hover:bg-aplicada-green-800 text-white"
                  >
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Botão para Refazer Diagnóstico */}
      <div className="pt-6 border-t border-aplicada-green-800/20 flex justify-center">
        <Button 
          variant="outline"
          onClick={gerarInsight}
          disabled={isGenerating}
          className="border-aplicada-green-700/30 text-aplicada-green-700 hover:bg-aplicada-green-700/10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Atualizar Diagnóstico
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
