import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";

const TOTAL_STEPS = 10;

const FERRAMENTAS_DIA = [
  "Excel", "Google Sheets", "Power BI", "ERP (SAP, TOTVS, etc)",
  "CRM", "E-mail", "WhatsApp", "Sistemas internos",
];

const OBJETIVOS_IA = [
  "Economizar tempo", "Reduzir erros", "Ter mais tempo para estratégia",
  "Impressionar a liderança", "Aprender novas habilidades", "Aumentar produtividade",
];

const FERRAMENTAS_AUTOMACAO = [
  "Zapier / Make", "Power Automate", "Python", "RPA (UiPath, etc)",
  "Scripts VBA", "Google Apps Script", "Nenhuma",
];

const HORARIOS = [
  "Manhã (8h-12h)", "Tarde (13h-17h)", "Noite (18h-22h)", "Flexível",
];

const SISTEMAS_ERP = [
  "SAP", "TOTVS", "Oracle", "Salesforce", "HubSpot",
  "Microsoft Dynamics", "Nenhum", "Outro",
];

const OBJETIVOS_PROGRAMA = [
  "Reduzir custos operacionais", "Aumentar produtividade da equipe",
  "Inovar processos", "Capacitar colaboradores em IA",
  "Criar vantagem competitiva", "Melhorar experiência do cliente",
];

const AREAS_AUTOMACAO = [
  "Financeiro", "Comercial", "Operações", "RH",
  "Marketing", "Atendimento", "TI", "Logística",
];

interface DiagnosticoFormProps {
  onSubmit: (formData: Record<string, any>) => void;
  onSaveRascunho?: (formData: Record<string, any>) => void;
  isSaving?: boolean;
  initialData?: Record<string, any> | null;
  onCancel?: () => void;
}

function mapDbToForm(data: Record<string, any> | null | undefined): Record<string, any> {
  if (!data) return {
    ferramentas: [], objetivosIA: [], ferramentasAutomacao: [],
    melhorHorario: [], sistemasERP: [], objetivoPrograma: [], areasAutomacao: [],
  };

  const ferramentas = Array.isArray(data.ferramentas_atuais)
    ? data.ferramentas_atuais.map((f: any) => (typeof f === "string" ? f : f?.nome || "")).filter(Boolean)
    : [];

  const processos = Array.isArray(data.processos_detalhados) ? data.processos_detalhados : [];
  const processosMap: Record<string, any> = {};
  processos.forEach((p: any, i: number) => {
    const n = i + 1;
    processosMap[`processo${n}Nome`] = p.nome || "";
    processosMap[`processo${n}Passos`] = p.passos || "";
    processosMap[`processo${n}Freq`] = p.frequencia || "";
    processosMap[`processo${n}Tempo`] = p.tempo || "";
    processosMap[`processo${n}Impacto`] = p.impacto || "";
    processosMap[`processo${n}Automatizar`] = p.tentouAutomatizar || "";
  });

  const desafios = Array.isArray(data.desafios) ? data.desafios : [];
  const desafiosMap: Record<string, any> = {};
  desafios.forEach((d: string, i: number) => {
    desafiosMap[`desafio${i + 1}`] = d;
  });

  return {
    cargo: data.cargo || "",
    area: data.area_atuacao || "",
    tempoFuncao: data.tempo_na_empresa || "",
    ferramentas,
    horasRepetitivas: data.horas_repetitivas || "",
    atividadePrincipal: data.atividade_principal || "",
    frequencia: data.frequencia_atividade || "",
    tempoGasto: data.tempo_gasto || "",
    ...processosMap,
    objetivosIA: Array.isArray(data.objetivos_ia) ? data.objetivos_ia : [],
    resultadoSucesso: data.resultado_sucesso || "",
    autonomia: data.autonomia || "",
    nivelTecnico: data.nivel_tecnico || "",
    ferramentasAutomacao: Array.isArray(data.ferramentas_automacao) ? data.ferramentas_automacao : [],
    usoIA: data.uso_ia || "",
    horasSemana: data.horas_semana || "",
    melhorHorario: Array.isArray(data.melhor_horario) ? data.melhor_horario : [],
    preferenciaConteudo: data.preferencia_conteudo || "",
    tamanhoArea: data.tamanho_area || "",
    sistemasERP: Array.isArray(data.sistemas_erp) ? data.sistemas_erp : [],
    iniciativasIA: data.iniciativas_ia || "",
    maturidadeDigital: data.maturidade_digital || "",
    ...desafiosMap,
    processoColaborativo: data.processo_colaborativo || "",
    automatizarEmpresa: data.automatizar_empresa || "",
    apoioLideranca: data.apoio_lideranca || "",
    restricoesTI: data.restricoes_ti || "",
    objetivoPrograma: Array.isArray(data.objetivo_programa) ? data.objetivo_programa : [],
    areasAutomacao: Array.isArray(data.areas_automacao) ? data.areas_automacao : [],
    resultadoEquipe: data.resultado_equipe || "",
    projetoColaborativo: data.projeto_colaborativo || "",
    barreiras: data.barreiras || "",
  };
}

export default function DiagnosticoForm({ onSubmit, onSaveRascunho, isSaving, initialData, onCancel }: DiagnosticoFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>(() => mapDbToForm(initialData));

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(item)
          ? arr.filter((i: string) => i !== item)
          : [...arr, item],
      };
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderCheckboxGroup = (field: string, options: string[]) => (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={(formData[field] || []).includes(opt)}
            onCheckedChange={() => toggleArrayItem(field, opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );

  const renderSelect = (field: string, placeholder: string, options: string[]) => (
    <Select value={formData[field] || ""} onValueChange={(v) => updateField(field, v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const stepContent: Record<number, React.ReactNode> = {
    1: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 1: SOBRE VOCÊ" desc="Suas informações individuais" />
        <Field label="Cargo/Função">
          {renderSelect("cargo", "Selecione seu cargo", [
            "Analista", "Assistente", "Coordenador", "Gerente",
            "Diretor", "Especialista", "Consultor", "Supervisor", "Outro",
          ])}
        </Field>
        <Field label="Área de atuação">
          {renderSelect("area", "Selecione sua área", [
            "Financeiro", "Comercial", "Operações", "RH",
            "Marketing", "TI", "Administrativo", "Atendimento ao Cliente", "Logística", "Outro",
          ])}
        </Field>
        <Field label="Tempo na função">
          {renderSelect("tempoFuncao", "Selecione", [
            "Menos de 1 ano", "1-3 anos", "3-5 anos", "Mais de 5 anos",
          ])}
        </Field>
        <Field label="Ferramentas que usa no dia a dia">
          {renderCheckboxGroup("ferramentas", FERRAMENTAS_DIA)}
        </Field>
      </div>
    ),
    2: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 2: ROTINA" desc="Sua rotina de trabalho" />
        <Field label="Horas por semana em tarefas repetitivas/manuais">
          {renderSelect("horasRepetitivas", "Selecione", [
            "0-5 horas", "5-10 horas", "10-20 horas", "20-30 horas", "Mais de 30 horas",
          ])}
        </Field>
        <Field label="Principal atividade que consome mais tempo">
          {renderSelect("atividadePrincipal", "Selecione", [
            "Criação de relatórios", "Consolidação de dados", "Gerenciamento de e-mails",
            "Atualização de planilhas", "Follow-up com clientes/fornecedores",
            "Coleta e organização de dados", "Agendamentos e organizações",
            "Processos de aprovação", "Outro",
          ])}
        </Field>
        <Field label="Frequência dessa atividade">
          {renderSelect("frequencia", "Selecione", [
            "Várias vezes por dia", "Diariamente", "Algumas vezes por semana",
            "Semanalmente", "Quinzenalmente", "Mensalmente",
          ])}
        </Field>
        <Field label="Tempo gasto por vez">
          {renderSelect("tempoGasto", "Selecione", [
            "Menos de 15 minutos", "15-30 minutos", "30min - 1 hora",
            "1-2 horas", "2-4 horas", "Mais de 4 horas",
          ])}
        </Field>
      </div>
    ),
    3: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 3: PROCESSOS DETALHADOS" desc="Descreva seus 3 processos mais demorados" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Processo {n}</p>
            <Field label="Nome do processo">
              <Input
                placeholder={`Ex: Consolidação de dados ${n === 1 ? "financeiros" : n === 2 ? "de vendas" : "operacionais"}`}
                value={formData[`processo${n}Nome`] || ""}
                onChange={(e) => updateField(`processo${n}Nome`, e.target.value)}
              />
            </Field>
            <Field label="Passo a passo resumido">
              <Input
                placeholder="Descreva os passos principais"
                value={formData[`processo${n}Passos`] || ""}
                onChange={(e) => updateField(`processo${n}Passos`, e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Frequência">
                {renderSelect(`processo${n}Freq`, "Selecione", [
                  "Diária", "Semanal", "Quinzenal", "Mensal",
                ])}
              </Field>
              <Field label="Tempo por vez">
                {renderSelect(`processo${n}Tempo`, "Selecione", [
                  "15min", "30min", "1h", "2h", "3h", "4h+",
                ])}
              </Field>
            </div>
            <Field label="Impacto se atrasar">
              {renderSelect(`processo${n}Impacto`, "Selecione", ["Baixo", "Médio", "Alto", "Crítico"])}
            </Field>
            <Field label="Já tentou automatizar?">
              <RadioGroup
                value={formData[`processo${n}Automatizar`] || ""}
                onValueChange={(v) => updateField(`processo${n}Automatizar`, v)}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="sim" /> Sim
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="nao" /> Não
                </label>
              </RadioGroup>
            </Field>
          </div>
        ))}
      </div>
    ),
    4: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 4: OBJETIVOS" desc="O que espera alcançar" />
        <Field label="O que espera conquistar com automação/IA?">
          {renderCheckboxGroup("objetivosIA", OBJETIVOS_IA)}
        </Field>
        <Field label="Resultado de sucesso para você">
          <Input
            placeholder="Descreva o resultado ideal"
            value={formData.resultadoSucesso || ""}
            onChange={(e) => updateField("resultadoSucesso", e.target.value)}
          />
        </Field>
        <Field label="Autonomia para implementar mudanças">
          {renderSelect("autonomia", "Selecione", [
            "Total - posso implementar sem aprovação",
            "Parcial - preciso de aprovação do gestor",
            "Limitada - muita burocracia e aprovações",
          ])}
        </Field>
      </div>
    ),
    5: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 5: CONTEXTO TÉCNICO" desc="Seu nível de familiaridade" />
        <Field label="Nível de familiaridade com tecnologia">
          {renderSelect("nivelTecnico", "Selecione", [
            "Iniciante - uso básico de ferramentas",
            "Intermediário - confortável com tecnologia",
            "Avançado - domino diversas ferramentas",
          ])}
        </Field>
        <Field label="Ferramentas de automação que conhece">
          {renderCheckboxGroup("ferramentasAutomacao", FERRAMENTAS_AUTOMACAO)}
        </Field>
        <Field label="Já usou ferramentas de IA (ChatGPT, Claude, etc)?">
          {renderSelect("usoIA", "Selecione", [
            "Nunca usei", "Usei poucas vezes", "Uso regularmente", "Uso diariamente",
          ])}
        </Field>
      </div>
    ),
    6: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 6: DISPONIBILIDADE" desc="Tempo para dedicar ao programa" />
        <Field label="Horas disponíveis por semana para o programa">
          {renderSelect("horasSemana", "Selecione", [
            "1-2 horas", "2-4 horas", "4-6 horas", "6-8 horas", "Mais de 8 horas",
          ])}
        </Field>
        <Field label="Melhor horário para estudar">
          {renderCheckboxGroup("melhorHorario", HORARIOS)}
        </Field>
        <Field label="Preferência de conteúdo">
          {renderSelect("preferenciaConteudo", "Selecione", [
            "Vídeo-aulas", "Textos e artigos", "Exercícios práticos",
            "Projetos reais", "Mix de formatos",
          ])}
        </Field>
      </div>
    ),
    7: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 7: EMPRESA" desc="Contexto da sua organização" />
        <Field label="Tamanho da área/departamento">
          {renderSelect("tamanhoArea", "Selecione", [
            "1-5 pessoas", "6-15 pessoas", "16-50 pessoas",
            "51-100 pessoas", "Mais de 100 pessoas",
          ])}
        </Field>
        <Field label="Sistemas/ERPs utilizados">
          {renderCheckboxGroup("sistemasERP", SISTEMAS_ERP)}
        </Field>
        <Field label="Iniciativas de IA já existentes na empresa">
          {renderSelect("iniciativasIA", "Selecione", [
            "Nenhuma", "Em planejamento", "Em fase piloto",
            "Algumas implementadas", "Uso avançado de IA",
          ])}
        </Field>
        <Field label="Maturidade digital da empresa">
          {renderSelect("maturidadeDigital", "Selecione", [
            "Baixa - processos muito manuais",
            "Média - alguns processos digitalizados",
            "Alta - maioria dos processos digitais",
            "Avançada - cultura data-driven",
          ])}
        </Field>
      </div>
    ),
    8: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 8: DESAFIOS" desc="Principais dores e desafios" />
        {[1, 2, 3].map((n) => (
          <Field key={n} label={`Desafio ${n}`}>
            <Input
              placeholder={`Descreva o desafio ${n}`}
              value={formData[`desafio${n}`] || ""}
              onChange={(e) => updateField(`desafio${n}`, e.target.value)}
            />
          </Field>
        ))}
        <Field label="Processo mais colaborativo (envolve outras pessoas/áreas)">
          <Input
            placeholder="Descreva o processo"
            value={formData.processoColaborativo || ""}
            onChange={(e) => updateField("processoColaborativo", e.target.value)}
          />
        </Field>
        <Field label="Se pudesse automatizar algo na empresa, o que seria?">
          <Input
            placeholder="Descreva"
            value={formData.automatizarEmpresa || ""}
            onChange={(e) => updateField("automatizarEmpresa", e.target.value)}
          />
        </Field>
      </div>
    ),
    9: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 9: CONTEXTO ORGANIZACIONAL" desc="Ambiente e suporte" />
        <Field label="Apoio da liderança para inovação">
          {renderSelect("apoioLideranca", "Selecione", [
            "Forte - liderança incentiva ativamente",
            "Moderado - aceita mas não prioriza",
            "Fraco - resistência a mudanças",
          ])}
        </Field>
        <Field label="Restrições de TI">
          {renderSelect("restricoesTI", "Selecione", [
            "Nenhuma - liberdade total",
            "Moderadas - precisa de aprovação",
            "Altas - muitas restrições de software",
          ])}
        </Field>
        <Field label="Objetivo do programa para sua equipe">
          {renderCheckboxGroup("objetivoPrograma", OBJETIVOS_PROGRAMA)}
        </Field>
        <Field label="Áreas prioritárias para automação">
          {renderCheckboxGroup("areasAutomacao", AREAS_AUTOMACAO)}
        </Field>
      </div>
    ),
    10: (
      <div className="space-y-5">
        <StepHeader title="BLOCO 10: EXPECTATIVAS" desc="O que espera do programa" />
        <Field label="Resultado esperado para a equipe">
          <Input
            placeholder="Descreva o resultado ideal"
            value={formData.resultadoEquipe || ""}
            onChange={(e) => updateField("resultadoEquipe", e.target.value)}
          />
        </Field>
        <Field label="Tipo de projeto colaborativo que gostaria de desenvolver">
          <Input
            placeholder="Descreva o projeto"
            value={formData.projetoColaborativo || ""}
            onChange={(e) => updateField("projetoColaborativo", e.target.value)}
          />
        </Field>
        <Field label="Maiores barreiras que antecipa">
          <Input
            placeholder="Descreva as barreiras"
            value={formData.barreiras || ""}
            onChange={(e) => updateField("barreiras", e.target.value)}
          />
        </Field>
      </div>
    ),
  };

  return (
    <Card className="border-brand-hairline bg-brand-cream-soft">
      <CardHeader>
        <CardTitle className="font-serif-display text-2xl text-foreground">Diagnóstico Inicial</CardTitle>
        <CardDescription>Preencha as informações para personalizar sua experiência</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-brand-hairline"
            indicatorClassName="bg-brand-strong"
          />
          <p className="text-xs text-muted-foreground">
            Etapa {step} de {TOTAL_STEPS}
          </p>
        </div>

        <Separator />

        {/* Step content */}
        {stepContent[step]}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isSaving}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => {
              const nextStep = Math.min(TOTAL_STEPS, step + 1);
              setStep(nextStep);
              onSaveRascunho?.(formData);
            }}>
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-brand-strong hover:bg-brand-strong/90 text-brand-cream"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSaving ? "Salvando..." : "Enviar Diagnóstico"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[hsl(72,50%,35%)]">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
