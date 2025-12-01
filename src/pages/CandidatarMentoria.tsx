import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useEnviarCandidatura } from "@/hooks/useCandidaturasMentoria";
import logoSimbol from "@/assets/logo-aplicada-simbolo.png";

export default function CandidatarMentoria() {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue } = useForm();
  const { mutate: enviarCandidatura, isPending } = useEnviarCandidatura();

  const totalSteps = 7;
  const progressPercent = (step / totalSteps) * 100;

  const onSubmit = (data: any) => {
    enviarCandidatura(data, {
      onSuccess: () => {
        setShowSuccess(true);
      },
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 text-[#2F302B] hover:bg-[#2F302B]/10"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Voltar
        </Button>
        
        <Card className="max-w-2xl w-full p-8 text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#9EB038]/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#9EB038]" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[#2F302B] mb-6">
            Obrigado por preencher!
          </h1>
          
          <div className="bg-[#2F302B]/5 rounded-lg p-6 mb-6 text-left">
            <p className="text-[#2F302B] font-semibold mb-4">
              IMPORTANTE: Este é um programa premium para executivos comprometidos. 
              Analisarei pessoalmente cada resposta.
            </p>
            
            <div className="space-y-3 text-[#2F302B]">
              <div className="flex items-start gap-3">
                <span className="text-[#9EB038] font-bold">✓</span>
                <p>
                  <strong>Se você for selecionado:</strong> Recebe link para agendar 
                  diagnóstico gratuito de 1h
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#9EB038] font-bold">→</span>
                <p>
                  <strong>Se ainda não for o momento:</strong> Continua tendo acesso 
                  às aulas gratuitas e comunidade
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Você receberá uma resposta em até <strong>48h via WhatsApp</strong>.
          </p>
          
          <Button
            onClick={() => navigate("/aplique")}
            className="bg-[#2F302B] hover:bg-[#3D3E39]"
          >
            Voltar para Aplique
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate('/aplique')}
        className="absolute top-4 left-4 z-20 text-[#2F302B] hover:bg-[#2F302B]/10"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Voltar
      </Button>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoSimbol} alt="IAplicada" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#2F302B] mb-2">
            Candidatura <span className="text-[#9EB038]">Mentoria Club</span>
          </h1>
          <p className="text-muted-foreground">
            Preencha o formulário para ser considerado
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Etapa {step} de {totalSteps}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-8">
            {/* Step 1: Informações Básicas */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Informações Básicas
                </h2>
                <div>
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input id="nome_completo" {...register("nome_completo", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="email">Email Profissional *</Label>
                  <Input id="email" type="email" {...register("email", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" {...register("whatsapp", { required: true })} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn (URL do perfil)</Label>
                  <Input id="linkedin_url" {...register("linkedin_url")} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <Label htmlFor="cidade_estado">Cidade/Estado</Label>
                  <Input id="cidade_estado" {...register("cidade_estado")} placeholder="São Paulo, SP" />
                </div>
              </div>
            )}

            {/* Step 2: Situação Profissional */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Situação Profissional
                </h2>
                <div>
                  <Label htmlFor="empresa_atual">Qual empresa você trabalha atualmente?</Label>
                  <Input id="empresa_atual" {...register("empresa_atual")} />
                </div>
                <div>
                  <Label>Qual seu cargo atual?</Label>
                  <RadioGroup onValueChange={(v) => setValue("cargo_atual", v)}>
                    {["Analista", "Coordenador", "Gerente", "Diretor", "C-Level", "Empresário", "Outro"].map((cargo) => (
                      <div key={cargo} className="flex items-center space-x-2">
                        <RadioGroupItem value={cargo.toLowerCase()} id={cargo} />
                        <Label htmlFor={cargo}>{cargo}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {watch("cargo_atual") === "outro" && (
                    <Input {...register("cargo_outro")} placeholder="Especifique seu cargo" className="mt-2" />
                  )}
                </div>
                <div>
                  <Label>Há quanto tempo está neste cargo?</Label>
                  <RadioGroup onValueChange={(v) => setValue("tempo_cargo", v)}>
                    {[
                      { label: "Menos de 1 ano", value: "menos_1_ano" },
                      { label: "1-3 anos", value: "1_3_anos" },
                      { label: "3-5 anos", value: "3_5_anos" },
                      { label: "Mais de 5 anos", value: "mais_5_anos" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="qtd_liderados">Quantas pessoas você lidera diretamente?</Label>
                  <Input id="qtd_liderados" type="number" {...register("qtd_liderados")} placeholder="0" />
                </div>
                <div>
                  <Label>Qual o porte da sua empresa?</Label>
                  <RadioGroup onValueChange={(v) => setValue("porte_empresa", v)}>
                    {[
                      { label: "Startup (até 50 funcionários)", value: "startup" },
                      { label: "Pequena (51-200)", value: "pequena" },
                      { label: "Média (201-1000)", value: "media" },
                      { label: "Grande (1000+)", value: "grande" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 3: Conhecimento em IA */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Conhecimento em IA
                </h2>
                <div>
                  <Label>Como você avalia seu nível atual com IA? (0-10)</Label>
                  <div className="pt-4">
                    <Slider
                      defaultValue={[5]}
                      max={10}
                      step={1}
                      onValueChange={(v) => setValue("nivel_ia", v[0])}
                    />
                    <div className="text-center mt-2 text-2xl font-bold text-[#9EB038]">
                      {watch("nivel_ia") || 5}/10
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Quais ferramentas de IA você já usa?</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { label: "ChatGPT", value: "chatgpt" },
                      { label: "Claude", value: "claude" },
                      { label: "Gemini", value: "gemini" },
                      { label: "Ferramentas de automação", value: "automacao" },
                      { label: "Nenhuma", value: "nenhuma" },
                    ].map((tool) => (
                      <div key={tool.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={tool.value}
                          onCheckedChange={(checked) => {
                            const current = watch("ferramentas_ia") || [];
                            setValue(
                              "ferramentas_ia",
                              checked
                                ? [...current, tool.value]
                                : current.filter((t: string) => t !== tool.value)
                            );
                          }}
                        />
                        <Label htmlFor={tool.value}>{tool.label}</Label>
                      </div>
                    ))}
                  </div>
                  <Input
                    {...register("outras_ferramentas")}
                    placeholder="Outras ferramentas..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Você já implementou alguma solução de IA na sua empresa?</Label>
                  <RadioGroup onValueChange={(v) => setValue("ja_implementou_ia", v === "sim")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="impl_sim" />
                      <Label htmlFor="impl_sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="impl_nao" />
                      <Label htmlFor="impl_nao">Não</Label>
                    </div>
                  </RadioGroup>
                  {watch("ja_implementou_ia") && (
                    <Textarea
                      {...register("descricao_implementacao")}
                      placeholder="Descreva brevemente a solução..."
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Situação Financeira */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Situação Financeira
                </h2>
                <div>
                  <Label>Qual sua faixa de renda mensal?</Label>
                  <RadioGroup onValueChange={(v) => setValue("faixa_renda", v)}>
                    {[
                      { label: "Menos de R$3.000", value: "ate_3k" },
                      { label: "R$3.000 - R$5.000", value: "3k_5k" },
                      { label: "R$5.000 - R$8.000", value: "5k_8k" },
                      { label: "R$8.000 - R$12.000", value: "8k_12k" },
                      { label: "Acima de R$12.000", value: "acima_12k" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Você tem autonomia para contratar serviços de desenvolvimento profissional?</Label>
                  <RadioGroup onValueChange={(v) => setValue("autonomia_contratacao", v)}>
                    {[
                      { label: "Sim, decido sozinho", value: "sozinho" },
                      { label: "Preciso de aprovação", value: "precisa_aprovacao" },
                      { label: "A empresa paga", value: "empresa_paga" },
                      { label: "Não tenho autonomia", value: "sem_autonomia" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 5: Motivações e Objetivos */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Motivações e Objetivos
                </h2>
                <div>
                  <Label htmlFor="significado_sucesso_ia">
                    O que significa ser um líder de sucesso com IA para você? *
                  </Label>
                  <Textarea
                    id="significado_sucesso_ia"
                    {...register("significado_sucesso_ia", { required: true })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="tres_maiores_desafios">
                    Quais são seus 3 maiores desafios profissionais hoje? *
                  </Label>
                  <Textarea
                    id="tres_maiores_desafios"
                    {...register("tres_maiores_desafios", { required: true })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="onde_quer_estar_2_anos">
                    Onde você quer estar profissionalmente em 2 anos?
                  </Label>
                  <Textarea id="onde_quer_estar_2_anos" {...register("onde_quer_estar_2_anos")} rows={3} />
                </div>
                <div>
                  <Label htmlFor="por_que_nao_alcancou">
                    Por que você acredita que ainda não alcançou esse objetivo?
                  </Label>
                  <Textarea id="por_que_nao_alcancou" {...register("por_que_nao_alcancou")} rows={3} />
                </div>
              </div>
            )}

            {/* Step 6: Urgência e Comprometimento */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Urgência e Comprometimento
                </h2>
                <div>
                  <Label>Em uma escala de 0-10, qual sua urgência em dominar IA?</Label>
                  <div className="pt-4">
                    <Slider
                      defaultValue={[7]}
                      max={10}
                      step={1}
                      onValueChange={(v) => setValue("urgencia_dominar_ia", v[0])}
                    />
                    <div className="text-center mt-2 text-2xl font-bold text-[#9EB038]">
                      {watch("urgencia_dominar_ia") || 7}/10
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Quantas horas por semana você pode dedicar ao aprendizado?</Label>
                  <RadioGroup onValueChange={(v) => setValue("horas_semana_aprendizado", v)}>
                    {[
                      { label: "Menos de 2h", value: "menos_2h" },
                      { label: "2-5h", value: "2_5h" },
                      { label: "5-10h", value: "5_10h" },
                      { label: "Mais de 10h", value: "mais_10h" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Você já investiu em mentorias ou cursos premium antes?</Label>
                  <RadioGroup onValueChange={(v) => setValue("ja_investiu_mentoria", v === "sim")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="invest_sim" />
                      <Label htmlFor="invest_sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="invest_nao" />
                      <Label htmlFor="invest_nao">Não</Label>
                    </div>
                  </RadioGroup>
                  {watch("ja_investiu_mentoria") && (
                    <Input
                      {...register("quanto_investiu")}
                      placeholder="Quanto investiu?"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 7: Qualificação Final */}
            {step === 7 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2F302B] mb-4">
                  Qualificação Final
                </h2>
                <div>
                  <Label htmlFor="por_que_escolher_voce">
                    Por que eu deveria te escolher para minha mentoria? *
                  </Label>
                  <Textarea
                    id="por_que_escolher_voce"
                    {...register("por_que_escolher_voce", { required: true })}
                    rows={4}
                    placeholder="Mostre seu comprometimento e diferenciais..."
                  />
                </div>
                <div>
                  <Label htmlFor="como_contribuir_grupo">
                    Como você poderia contribuir com outros líderes do grupo?
                  </Label>
                  <Textarea
                    id="como_contribuir_grupo"
                    {...register("como_contribuir_grupo")}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="impedimento_comecar_hoje">
                    Se eu te oferecesse uma vaga hoje, o que te impediria de começar imediatamente?
                  </Label>
                  <Textarea
                    id="impedimento_comecar_hoje"
                    {...register("impedimento_comecar_hoje")}
                    rows={3}
                  />
                </div>
                <div className="bg-[#9EB038]/10 rounded-lg p-6 border-2 border-[#9EB038]">
                  <Label className="text-lg font-bold">
                    Você tem de R$4.000 a R$10.000 disponíveis para investir em uma formação que vai acelerar sua carreira?
                  </Label>
                  <RadioGroup onValueChange={(v) => setValue("tem_4k_10k_investir", v)} className="mt-4">
                    {[
                      { label: "Sim, à vista", value: "sim_vista" },
                      { label: "Sim, parcelado", value: "sim_parcelado" },
                      { label: "Não, mas tenho outro valor", value: "outro_valor" },
                      { label: "Não tenho esse valor", value: "nao_tenho" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {watch("tem_4k_10k_investir") === "outro_valor" && (
                    <Input
                      {...register("valor_disponivel")}
                      placeholder="Qual valor você tem disponível?"
                      className="mt-2"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="maximo_investido_desenvolvimento">
                    Qual o máximo que você já investiu em desenvolvimento profissional?
                  </Label>
                  <Input
                    id="maximo_investido_desenvolvimento"
                    {...register("maximo_investido_desenvolvimento")}
                    placeholder="Ex: R$ 5.000"
                  />
                </div>
                <div>
                  <Label htmlFor="outro_impedimento">
                    Se não fosse pelo valor, o que mais poderia te impedir de participar?
                  </Label>
                  <Textarea id="outro_impedimento" {...register("outro_impedimento")} rows={3} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto bg-[#9EB038] hover:bg-[#C5D63D] text-[#2F302B]"
                >
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="ml-auto bg-[#2F302B] hover:bg-[#3D3E39]"
                >
                  {isPending ? "Enviando..." : "Enviar Candidatura"}
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
