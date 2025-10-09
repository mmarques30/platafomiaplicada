import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useGerarPerguntas, useCreateFormulario } from "@/hooks/useFormulariosCustomizados";
import { useUsers } from "@/hooks/admin/useUsers";
import type { Pergunta, PerguntasGeradas } from "@/types/formularios-customizados";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FormularioCustomizadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FormularioCustomizadoModal = ({ open, onOpenChange }: FormularioCustomizadoModalProps) => {
  const [step, setStep] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [textoOriginal, setTextoOriginal] = useState("");
  const [perguntasGeradas, setPerguntasGeradas] = useState<PerguntasGeradas | null>(null);
  const [visibilidade, setVisibilidade] = useState<"todos" | "especificos">("todos");
  const [mentoradosSelecionados, setMentoradosSelecionados] = useState<string[]>([]);
  const [dataExpiracao, setDataExpiracao] = useState<Date | undefined>();

  const { data: users } = useUsers();
  const gerarPerguntas = useGerarPerguntas();
  const createFormulario = useCreateFormulario();

  const mentorados = (users || []).filter(u => 
    !u.roles?.includes("admin")
  );

  const handleGerarPerguntas = async () => {
    if (!textoOriginal.trim()) return;
    
    const perguntas = await gerarPerguntas.mutateAsync(textoOriginal);
    setPerguntasGeradas(perguntas);
    setStep(3);
  };

  const handleCriarFormulario = async () => {
    if (!perguntasGeradas) return;

    await createFormulario.mutateAsync({
      titulo,
      descricao,
      texto_original: textoOriginal,
      perguntas_geradas: perguntasGeradas,
      visibilidade,
      mentorados_ids: visibilidade === "especificos" ? mentoradosSelecionados : [],
      data_expiracao: dataExpiracao?.toISOString(),
      status: "ativo",
    });

    // Reset
    setStep(1);
    setTitulo("");
    setDescricao("");
    setTextoOriginal("");
    setPerguntasGeradas(null);
    setVisibilidade("todos");
    setMentoradosSelecionados([]);
    setDataExpiracao(undefined);
    onOpenChange(false);
  };

  const getTipoPerguntaLabel = (tipo: string) => {
    const labels = {
      texto_curto: "Texto Curto",
      texto_longo: "Texto Longo",
      multipla_escolha: "Múltipla Escolha",
      escala: "Escala",
      data: "Data",
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Criar Novo Formulário"}
            {step === 2 && "Descreva o Formulário"}
            {step === 3 && "Revisar Perguntas"}
            {step === 4 && "Configurar Acesso"}
          </DialogTitle>
        </DialogHeader>

        {/* Etapa 1: Informações Básicas */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Check-in Semanal - Outubro"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição sobre o objetivo deste formulário"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!titulo.trim()}
              >
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 2: Texto Livre */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Escreva livremente o que deseja coletar dos mentorados. A IA irá transformar em perguntas estruturadas.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Exemplo:</strong> "Quero saber como foi o progresso desta semana com IA, quais dificuldades enfrentaram e o que aprenderam de novo."
              </p>
            </div>
            <div>
              <Label htmlFor="texto">Descreva o que você quer perguntar *</Label>
              <Textarea
                id="texto"
                value={textoOriginal}
                onChange={(e) => setTextoOriginal(e.target.value)}
                placeholder="Escreva livremente..."
                rows={8}
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={handleGerarPerguntas}
                disabled={!textoOriginal.trim() || gerarPerguntas.isPending}
              >
                {gerarPerguntas.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Perguntas
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 3: Revisar Perguntas */}
        {step === 3 && perguntasGeradas && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">
                📊 {perguntasGeradas.categoria}
              </Badge>
              <Badge variant="outline">
                ⏱️ {perguntasGeradas.tempo_estimado}
              </Badge>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {perguntasGeradas.perguntas.map((pergunta, index) => (
                <Card key={pergunta.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{index + 1}.</span>
                        <span>{pergunta.pergunta}</span>
                        {pergunta.obrigatoria && (
                          <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tipo: {getTipoPerguntaLabel(pergunta.tipo)}
                        {pergunta.tipo === "escala" && pergunta.escala_min && pergunta.escala_max && (
                          <> ({pergunta.escala_min} a {pergunta.escala_max})</>
                        )}
                      </div>
                      {pergunta.opcoes && pergunta.opcoes.length > 0 && (
                        <div className="mt-2 text-sm">
                          Opções: {pergunta.opcoes.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={() => setStep(4)}>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 4: Configurar Acesso e Prazo */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Quem pode responder? *</Label>
              <RadioGroup value={visibilidade} onValueChange={(v) => setVisibilidade(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="todos" id="todos" />
                  <Label htmlFor="todos">Todos os mentorados</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="especificos" id="especificos" />
                  <Label htmlFor="especificos">Mentorados específicos</Label>
                </div>
              </RadioGroup>
            </div>

            {visibilidade === "especificos" && (
              <div>
                <Label>Selecionar mentorados:</Label>
                <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                  {mentorados.map((mentorado) => (
                    <div key={mentorado.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={mentorado.id}
                        checked={mentoradosSelecionados.includes(mentorado.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMentoradosSelecionados([...mentoradosSelecionados, mentorado.id]);
                          } else {
                            setMentoradosSelecionados(mentoradosSelecionados.filter(id => id !== mentorado.id));
                          }
                        }}
                      />
                      <Label htmlFor={mentorado.id} className="cursor-pointer">
                        {mentorado.nome_completo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Data de Expiração (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataExpiracao ? format(dataExpiracao, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataExpiracao}
                    onSelect={setDataExpiracao}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={handleCriarFormulario}
                disabled={createFormulario.isPending || (visibilidade === "especificos" && mentoradosSelecionados.length === 0)}
              >
                {createFormulario.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "✅ Criar Formulário"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
