import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Gift, CheckCircle2, Loader2, Check, Mail } from "lucide-react";
import { usePesquisa, useSalvarResposta } from "@/hooks/usePesquisas";
import { useAuth } from "@/hooks/useAuth";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import type { Pergunta, Secao } from "@/types/pesquisas";
import logoMarca from "@/assets/logo-aplicada-marca-completa.png";
import backgroundSymbolSoft from "@/assets/logos/background-symbol-soft.png";

const STORAGE_KEY = "pesquisa_formulario-aplica_draft";
const AUTO_SAVE_DELAY = 2000;

export default function FormularioAplica() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan } = useUserPlan();
  const { data: pesquisa, isLoading } = usePesquisa("formulario-aplica");
  const salvarResposta = useSalvarResposta();

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secaoAtual, setSecaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState(Date.now());
  const [emailRespondente, setEmailRespondente] = useState("");
  
  // Auto-save states
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasRestored, setHasRestored] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep isLoggedIn for database operations (but NOT for rewards)
  const isLoggedIn = !!user;

  // Mentorado detection by email (used for rewards)
  const [mentoradoDetectado, setMentoradoDetectado] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);

  // Parse recompensas from pesquisa
  const recompensas = pesquisa?.recompensas ? 
    (typeof pesquisa.recompensas === 'string' ? JSON.parse(pesquisa.recompensas) : pesquisa.recompensas) : 
    null;
  // Reward for mentorados only
  const recompensaAtual = recompensas?.mentorado || "Kit Express de desenvolvimento de dashboards";

  // Check if email belongs to a mentorado via RPC (bypasses RLS)
  const verificarEmailMentorado = async (email: string) => {
    if (!email || !email.includes('@')) {
      setMentoradoDetectado(false);
      return;
    }
    
    setVerificandoEmail(true);
    try {
      const { data, error } = await supabase
        .rpc("verificar_email_mentorado", { email_input: email.toLowerCase().trim() });
      
      if (error) {
        console.error("Erro ao verificar email:", error);
        setMentoradoDetectado(false);
        return;
      }
      
      setMentoradoDetectado(data === true);
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      setMentoradoDetectado(false);
    } finally {
      setVerificandoEmail(false);
    }
  };

  // Debounced email verification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (emailRespondente && emailRespondente.includes('@')) {
        verificarEmailMentorado(emailRespondente);
      } else {
        setMentoradoDetectado(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [emailRespondente]);

  // Restore progress from localStorage only (for anonymous users or first load)
  useEffect(() => {
    if (hasRestored || !pesquisa) return;

    // If logged in, check database for existing response
    if (isLoggedIn) {
      const checkExisting = async () => {
        const { data } = await supabase
          .from("respostas_pesquisas")
          .select("*")
          .eq("pesquisa_id", pesquisa.id)
          .eq("user_id", user!.id)
          .maybeSingle();

        if (data) {
          setRespostas(data.respostas as Record<string, string>);
          if (data.completado) {
            setFinished(true);
            setStarted(true);
          } else if (Object.keys(data.respostas || {}).length > 0) {
            setSecaoAtual(data.secao_atual || 0);
            setStarted(true);
            toast({
              title: "Progresso restaurado",
              description: "Continuando de onde você parou...",
            });
          }
          setHasRestored(true);
          return;
        }
        checkLocalStorage();
      };
      checkExisting();
    } else {
      checkLocalStorage();
    }

    function checkLocalStorage() {
      try {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.respostas && Object.keys(parsed.respostas).length > 0) {
            setRespostas(parsed.respostas);
            setSecaoAtual(parsed.secaoAtual || 0);
            setEmailRespondente(parsed.emailRespondente || "");
            setStarted(true);
            toast({
              title: "Rascunho encontrado",
              description: "Restaurando suas respostas...",
            });
          }
        }
      } catch (e) {
        console.error("Erro ao restaurar localStorage:", e);
      }
      setHasRestored(true);
    }
  }, [pesquisa, hasRestored, isLoggedIn, user]);

  // Immediate localStorage backup on any change
  useEffect(() => {
    if (started && !finished && Object.keys(respostas).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        respostas,
        secaoAtual,
        emailRespondente,
        timestamp: Date.now()
      }));
    }
  }, [respostas, secaoAtual, emailRespondente, started, finished]);

  // Debounced database save
  const saveToDatabase = useCallback(async (completado: boolean = false) => {
    if (!pesquisa || finished) return;
    
    // Always require email
    if (!emailRespondente.trim()) {
      if (completado) {
        toast({
          title: "Email obrigatório",
          description: "Por favor, informe seu email para finalizar.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        pesquisa_id: pesquisa.id,
        user_id: isLoggedIn ? user!.id : null,
        respostas,
        secao_atual: secaoAtual,
        completado,
        tempo_resposta: Math.floor((Date.now() - startTime) / 1000),
        email_respondente: emailRespondente.trim(),
      };

      // Check if response exists for this email (only non-completed ones for partial saves)
      const { data: existing } = await supabase
        .from("respostas_pesquisas")
        .select("id")
        .eq("pesquisa_id", pesquisa.id)
        .eq("email_respondente", emailRespondente.trim())
        .eq("completado", false)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("respostas_pesquisas")
          .update({
            respostas,
            secao_atual: secaoAtual,
            completado,
            tempo_resposta: Math.floor((Date.now() - startTime) / 1000),
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("respostas_pesquisas")
          .insert(payload);
      }

      // Se finalizou, limpar todos os registros parciais anteriores
      if (completado) {
        await supabase
          .from("respostas_pesquisas")
          .delete()
          .eq("pesquisa_id", pesquisa.id)
          .eq("email_respondente", emailRespondente.trim())
          .eq("completado", false);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Suas respostas estão seguras localmente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [pesquisa, respostas, secaoAtual, startTime, finished, isLoggedIn, user, emailRespondente]);

  // Auto-save trigger (debounced)
  useEffect(() => {
    if (!started || finished || Object.keys(respostas).length === 0) return;
    // Only auto-save if has email
    if (!emailRespondente.trim()) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase(false);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [respostas, started, finished, saveToDatabase, emailRespondente]);

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
    
    // Always validate email on first section
    if (secaoAtual === 0 && !emailRespondente.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email para continuar.",
        variant: "destructive",
      });
      return false;
    }
    
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

  const handleNext = async () => {
    if (!validarSecao()) return;

    if (secaoAtual < totalSecoes - 1) {
      const novaSecao = secaoAtual + 1;
      setSecaoAtual(novaSecao);
    } else {
      // Finalize
      await saveToDatabase(true);
      localStorage.removeItem(STORAGE_KEY);
      setFinished(true);
      toast({
        title: "Pesquisa concluída!",
        description: "Obrigado por participar. Sua recompensa será liberada em breve.",
      });
    }
  };

  const handlePrev = () => {
    if (secaoAtual > 0) {
      setSecaoAtual(secaoAtual - 1);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFFF6] via-[#F6F7E9] to-[#E8EDD0]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Tela inicial
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFF6] via-[#F6F7E9] to-[#E8EDD0] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm border border-[#9EB038]/20 shadow-lg">
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
            <div className="bg-[#9EB038]/10 border border-[#9EB038]/20 rounded-lg p-4 text-center">
              <Gift className="h-6 w-6 text-[#9EB038] mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-2">Sua Recompensa</h3>
              <p className="text-sm text-muted-foreground">
                {recompensaAtual || "Complete a pesquisa para receber sua recompensa exclusiva."}
              </p>
            </div>

            <Button
              onClick={handleStart} 
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFF6] via-[#F6F7E9] to-[#E8EDD0] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm border border-[#9EB038]/20 shadow-lg text-center">
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
              Suas respostas foram registradas com sucesso. Sua recompensa será liberada em breve.
            </p>

            <div className="bg-[#9EB038]/10 border border-[#9EB038]/20 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Sua recompensa</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#9EB038]" />
                {recompensaAtual}
              </div>
            </div>

            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              IR PARA O DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wizard de perguntas
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFF6] via-[#F6F7E9] to-[#E8EDD0] flex flex-col">
      {/* Header com logo e progresso */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-[#9EB038]/20 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <img src={logoMarca} alt="IAplicada" className="h-8" />
            {/* Save indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-3 w-3 text-primary" />
                  <span>Salvo às {formatTime(lastSaved)}</span>
                </>
              ) : null}
            </div>
          </div>
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
          <Card className="bg-white/90 backdrop-blur-sm border border-[#9EB038]/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-primary mb-2">
                <span className="bg-primary/20 px-2 py-1 rounded text-xs font-medium">
                  SEÇÃO {secaoAtual + 1}
                </span>
              </div>
              <CardTitle className="text-xl text-foreground">
                {secaoData?.titulo}
              </CardTitle>
              {secaoData?.objetivo && (
                <p className="text-sm text-muted-foreground">
                  {secaoData.objetivo}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email field always required on first section */}
              {secaoAtual === 0 && (
                <div className="space-y-2 pb-4 border-b border-border">
                  <Label className="text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Seu email para contato
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={emailRespondente}
                      onChange={(e) => setEmailRespondente(e.target.value)}
                      placeholder="seu@email.com"
                      className={`bg-background border-border pr-10 ${mentoradoDetectado ? "border-[#9EB038]" : ""}`}
                    />
                    {verificandoEmail && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {mentoradoDetectado && !verificandoEmail && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9EB038]" />
                    )}
                  </div>
                  
                  {mentoradoDetectado && (
                    <div className="flex items-center gap-2 text-sm text-[#9EB038] bg-[#9EB038]/10 px-3 py-2 rounded-md">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Você é um Mentorado IAplicada!</span>
                    </div>
                  )}
                </div>
              )}

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
            disabled={isSaving}
          >
            {secaoAtual === totalSecoes - 1 ? "Finalizar" : "Próxima"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
