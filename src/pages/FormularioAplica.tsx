import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Gift, Target, CheckCircle2 } from "lucide-react";
import { usePesquisa, useMinhaResposta, useSalvarResposta } from "@/hooks/usePesquisas";
import type { Pergunta, Secao } from "@/types/pesquisas";
import logoMarca from "@/assets/logo-aplicada-marca-completa.png";
import backgroundSymbol from "@/assets/logos/background-symbol.png";

export default function FormularioAplica() {
  const navigate = useNavigate();
  const { data: pesquisa, isLoading } = usePesquisa("formulario-aplica");
  const { data: minhaResposta } = useMinhaResposta(pesquisa?.id || "");
  const salvarResposta = useSalvarResposta();

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secaoAtual, setSecaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());

  // Restore progress from saved response
  useEffect(() => {
    if (minhaResposta) {
      setRespostas(minhaResposta.respostas as Record<string, string>);
      if (minhaResposta.completado) {
        setFinished(true);
        setStarted(true);
      } else if (minhaResposta.secao_atual > 0) {
        setSecaoAtual(minhaResposta.secao_atual);
        setStarted(true);
      }
    }
  }, [minhaResposta]);

  const secoes = pesquisa?.perguntas || [];
  const secaoData = secoes[secaoAtual] as Secao | undefined;
  const totalSecoes = secoes.length;
  const progress = totalSecoes > 0 ? ((secaoAtual + 1) / totalSecoes) * 100 : 0;

  const handleInputChange = (perguntaId: string, valor: string) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: valor }));
  };

  const shouldShowPergunta = (pergunta: Pergunta): boolean => {
    if (!pergunta.condicional) return true;
    return respostas[pergunta.condicional.campo] === pergunta.condicional.valor;
  };

  const validarSecao = (): boolean => {
    if (!secaoData) return true;
    
    for (const pergunta of secaoData.perguntas) {
      if (!shouldShowPergunta(pergunta)) continue;
      if (pergunta.obrigatorio && !respostas[pergunta.id]?.trim()) {
        toast({
          title: "Campo obrigatório",
          description: `Por favor, responda: "${pergunta.texto}"`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const salvarProgresso = async (completado: boolean = false, novaSecao?: number) => {
    if (!pesquisa) return;
    
    try {
      await salvarResposta.mutateAsync({
        pesquisaId: pesquisa.id,
        respostas,
        secaoAtual: novaSecao ?? secaoAtual,
        completado,
        tempoResposta: Math.floor((Date.now() - startTime) / 1000),
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleNext = async () => {
    if (!validarSecao()) return;

    if (secaoAtual < totalSecoes - 1) {
      const novaSecao = secaoAtual + 1;
      setSecaoAtual(novaSecao);
      await salvarProgresso(false, novaSecao);
    } else {
      await salvarProgresso(true);
      setFinished(true);
      toast({
        title: "Pesquisa concluída!",
        description: "Obrigado por participar. Suas recompensas serão liberadas em breve.",
      });
    }
  };

  const handlePrev = () => {
    if (secaoAtual > 0) {
      setSecaoAtual(secaoAtual - 1);
    }
  };

  const renderPergunta = (pergunta: Pergunta) => {
    if (!shouldShowPergunta(pergunta)) return null;

    const valor = respostas[pergunta.id] || "";

    switch (pergunta.tipo) {
      case "texto_curto":
        return (
          <Input
            value={valor}
            onChange={(e) => handleInputChange(pergunta.id, e.target.value)}
            placeholder={pergunta.placeholder || "Digite sua resposta..."}
            className="bg-background border-border"
          />
        );

      case "texto_longo":
        return (
          <Textarea
            value={valor}
            onChange={(e) => handleInputChange(pergunta.id, e.target.value)}
            placeholder={pergunta.placeholder || "Digite sua resposta..."}
            className="bg-background border-border min-h-[120px]"
          />
        );

      case "multipla_escolha":
        return (
          <RadioGroup
            value={valor}
            onValueChange={(v) => handleInputChange(pergunta.id, v)}
            className="space-y-2"
          >
            {pergunta.opcoes?.map((opcao) => (
              <div key={opcao} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao} id={`${pergunta.id}-${opcao}`} />
                <Label htmlFor={`${pergunta.id}-${opcao}`} className="cursor-pointer">
                  {opcao}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multipla_escolha_outro":
        const isOutro = valor && !pergunta.opcoes?.includes(valor);
        return (
          <div className="space-y-3">
            <RadioGroup
              value={isOutro ? "__outro__" : valor}
              onValueChange={(v) => {
                if (v === "__outro__") {
                  handleInputChange(pergunta.id, "");
                } else {
                  handleInputChange(pergunta.id, v);
                }
              }}
              className="space-y-2"
            >
              {pergunta.opcoes?.map((opcao) => (
                <div key={opcao} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcao} id={`${pergunta.id}-${opcao}`} />
                  <Label htmlFor={`${pergunta.id}-${opcao}`} className="cursor-pointer">
                    {opcao}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="__outro__" id={`${pergunta.id}-outro`} />
                <Label htmlFor={`${pergunta.id}-outro`} className="cursor-pointer">
                  Outro
                </Label>
              </div>
            </RadioGroup>
            {isOutro && (
              <Input
                value={valor}
                onChange={(e) => handleInputChange(pergunta.id, e.target.value)}
                placeholder="Especifique..."
                className="bg-background border-border ml-6"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2F302B]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Tela inicial
  if (!started) {
    return (
      <div 
        className="min-h-screen bg-[#2F302B] flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${backgroundSymbol})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card className="max-w-2xl w-full bg-card/95 backdrop-blur border-border">
          <CardHeader className="text-center pb-4">
            <img src={logoMarca} alt="IAplicada" className="h-12 mx-auto mb-6" />
            <CardTitle className="text-2xl md:text-3xl text-foreground">
              {pesquisa?.titulo}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {pesquisa?.descricao}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Objetivos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Compreender o perfil dos nossos primeiros clientes</li>
                    <li>• Identificar as pessoas mais engajadas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#9EB038]/10 border border-[#9EB038]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-[#9EB038] mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Recompensas</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 1 sessão de mentoria gratuita</li>
                    <li>• 30 dias de acesso gratuito à plataforma</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Tempo estimado: ~15 minutos
            </p>

            <Button 
              onClick={() => setStarted(true)} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              COMEÇAR PESQUISA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela final
  if (finished) {
    return (
      <div 
        className="min-h-screen bg-[#2F302B] flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${backgroundSymbol})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card className="max-w-2xl w-full bg-card/95 backdrop-blur border-border text-center">
          <CardHeader className="pb-4">
            <img src={logoMarca} alt="IAplicada" className="h-12 mx-auto mb-6" />
            <div className="w-16 h-16 bg-[#9EB038]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#9EB038]" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-foreground">
              Obrigado por participar!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Suas respostas foram registradas com sucesso. Entraremos em contato em breve para liberar suas recompensas.
            </p>

            <div className="bg-[#9EB038]/10 border border-[#9EB038]/20 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Suas recompensas</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#9EB038]" />
                  1 sessão de mentoria gratuita
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#9EB038]" />
                  30 dias de acesso gratuito à plataforma
                </li>
              </ul>
            </div>

            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              VOLTAR PARA O DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wizard de perguntas
  return (
    <div 
      className="min-h-screen bg-[#2F302B] flex flex-col"
      style={{
        backgroundImage: `url(${backgroundSymbol})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header com logo e progresso */}
      <div className="bg-card/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-3xl mx-auto">
          <img src={logoMarca} alt="IAplicada" className="h-8 mx-auto mb-4" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Seção {secaoAtual + 1} de {totalSecoes}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-primary mb-2">
                <span className="bg-primary/20 px-2 py-1 rounded text-xs font-medium">
                  SEÇÃO {secaoAtual + 1}
                </span>
              </div>
              <CardTitle className="text-xl text-foreground">
                {secaoData?.titulo}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {secaoData?.objetivo}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {secaoData?.perguntas.map((pergunta) => (
                <div key={pergunta.id} className="space-y-2">
                  <Label className="text-foreground">
                    {pergunta.texto}
                    {pergunta.obrigatorio && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderPergunta(pergunta)}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer com navegação */}
      <div className="bg-card/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={secaoAtual === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={salvarResposta.isPending}
          >
            {secaoAtual === totalSecoes - 1 ? "Finalizar" : "Próxima"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
