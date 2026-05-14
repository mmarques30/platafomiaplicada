import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useFormulariosDisponiveis, useResponderFormulario } from "@/hooks/useFormulariosCustomizados";
import { CalendarIcon, Loader2, Save, Send, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageContainer } from "@/components/shared/PageContainer";

const ResponderFormulario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formularios, isLoading } = useFormulariosDisponiveis();
  const responderFormulario = useResponderFormulario();

  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [inicioResposta] = useState(Date.now());

  const formulario = formularios.find(f => f.id === id);

  useEffect(() => {
    if (!isLoading && !formulario) {
      navigate("/mentoria/formularios");
    }
  }, [isLoading, formulario, navigate]);

  const handleResposta = (perguntaId: string, valor: any) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: {
        resposta: valor,
        respondido_em: new Date().toISOString(),
      }
    }));
  };

  const handleEnviar = async () => {
    if (!formulario) return;

    // Verificar perguntas obrigatórias
    const perguntasObrigatorias = formulario.perguntas_geradas.perguntas
      .filter(p => p.obrigatoria);
    
    const faltamRespostas = perguntasObrigatorias.some(p => !respostas[p.id]?.resposta);

    if (faltamRespostas) {
      alert("Por favor, responda todas as perguntas obrigatórias");
      return;
    }

    const tempoResposta = Math.floor((Date.now() - inicioResposta) / 1000);

    await responderFormulario.mutateAsync({
      formulario_id: formulario.id,
      respostas,
      tempo_resposta: tempoResposta,
    });

    navigate("/mentoria/formularios");
  };

  if (isLoading) {
    return (
      <PageContainer size="narrow">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Carregando formulário...</p>
        </div>
      </PageContainer>
    );
  }

  if (!formulario) {
    return null;
  }

  return (
    <PageContainer size="narrow">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {formulario.titulo}
            </h1>
            {formulario.descricao && (
              <p className="text-muted-foreground mb-4">
                {formulario.descricao}
              </p>
            )}
            <Badge variant="secondary" className="flex items-center gap-2 w-fit">
              <Clock className="h-4 w-4" />
              Tempo estimado: {formulario.perguntas_geradas.tempo_estimado}
            </Badge>
          </div>

          <div className="space-y-6">
            {formulario.perguntas_geradas.perguntas.map((pergunta, index) => (
              <div key={pergunta.id} className="border-b pb-6 last:border-0">
                <Label className="text-base flex items-start gap-2 mb-3">
                  <span className="font-semibold">{index + 1}.</span>
                  <span>
                    {pergunta.pergunta}
                    {pergunta.obrigatoria && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Obrigatória
                      </Badge>
                    )}
                  </span>
                </Label>

                {/* Texto Curto */}
                {pergunta.tipo === "texto_curto" && (
                  <Input
                    value={respostas[pergunta.id]?.resposta || ""}
                    onChange={(e) => handleResposta(pergunta.id, e.target.value)}
                    placeholder="Sua resposta..."
                  />
                )}

                {/* Texto Longo */}
                {pergunta.tipo === "texto_longo" && (
                  <Textarea
                    value={respostas[pergunta.id]?.resposta || ""}
                    onChange={(e) => handleResposta(pergunta.id, e.target.value)}
                    placeholder="Sua resposta..."
                    rows={4}
                  />
                )}

                {/* Múltipla Escolha */}
                {pergunta.tipo === "multipla_escolha" && pergunta.opcoes && (
                  <RadioGroup
                    value={respostas[pergunta.id]?.resposta}
                    onValueChange={(value) => handleResposta(pergunta.id, value)}
                  >
                    {pergunta.opcoes.map((opcao, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcao} id={`${pergunta.id}-${i}`} />
                        <Label htmlFor={`${pergunta.id}-${i}`} className="cursor-pointer">
                          {opcao}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Escala */}
                {pergunta.tipo === "escala" && (
                  <div className="flex gap-2 flex-wrap">
                    {Array.from(
                      { length: (pergunta.escala_max || 5) - (pergunta.escala_min || 1) + 1 },
                      (_, i) => (pergunta.escala_min || 1) + i
                    ).map((valor) => (
                      <Button
                        key={valor}
                        type="button"
                        variant={respostas[pergunta.id]?.resposta === valor ? "default" : "outline"}
                        onClick={() => handleResposta(pergunta.id, valor)}
                        className="w-12 h-12"
                      >
                        {valor}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Data */}
                {pergunta.tipo === "data" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {respostas[pergunta.id]?.resposta
                          ? format(new Date(respostas[pergunta.id].resposta), "dd/MM/yyyy", { locale: ptBR })
                          : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={respostas[pergunta.id]?.resposta ? new Date(respostas[pergunta.id].resposta) : undefined}
                        onSelect={(date) => handleResposta(pergunta.id, date?.toISOString())}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/mentoria/formularios")}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleEnviar}
              disabled={responderFormulario.isPending}
            >
              {responderFormulario.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Respostas
                </>
              )}
            </Button>
          </div>
        </Card>
    </PageContainer>
  );
};

export default ResponderFormulario;
