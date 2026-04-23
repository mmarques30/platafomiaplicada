import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Package, 
  ListTodo,
  ChevronDown,
  ChevronRight,
  Layers,
  FolderOpen,
  FileText,
  CheckSquare,
  Loader2,
  RefreshCw,
  Plus,
  Users,
  Zap,
  GripVertical
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DroppableFase } from "./DroppableFase";
import { ResultadoProcessamento } from "@/hooks/useProcessarDocumentos";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ModoImportacao } from "./DocumentosUploadSection";
import { BacklogEditor, type BacklogItemEditable } from "./BacklogEditor";

interface DadosExistentes {
  etapas: { id: string; numero: number; titulo: string }[];
  entregas: { id: string; titulo: string; status: string }[];
  instrucoes: { id: string; titulo: string; entrega_id: string; status: string }[];
  tasks: { id: string; titulo: string; status: string }[];
}

interface GeracaoEntregasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultado: ResultadoProcessamento | null;
  contratoId: string;
  modoImportacao: ModoImportacao;
  onSuccess?: () => void;
}

interface EtapaSelecionada {
  numero: number;
  titulo: string;
  objetivo?: string;
  selecionada: boolean;
}

interface EntregaSelecionada {
  etapa_numero: number;
  numero_entrega: number;
  titulo: string;
  descricao: string;
  tipo: 'ativa' | 'backlog';
  prioridade: string;
  modulo_relacionado?: string;
  responsavel?: string;
  status?: string;
  selecionada: boolean;
  is_conjuntas?: boolean; // Flag para entregas em conjunto
  is_grouped?: boolean;
  subitens_count?: number;
  subitens_concluidos?: number;
}

interface InstrucaoSelecionada {
  entrega_numero: number;
  titulo: string;
  descricao?: string;
  prompt_sugerido?: string;
  responsavel: string;
  ferramenta?: string;
  dicas?: string;
  ordem: number;
  selecionada: boolean;
}

interface TaskSelecionada {
  entrega_numero: number;
  titulo: string;
  tipo: string;
  prioridade: string;
  instrucoes_validacao?: string;
  selecionada: boolean;
}

interface BacklogSelecionado {
  titulo: string;
  descricao: string;
  justificativa: string;
  selecionado: boolean;
}

export function GeracaoEntregasModal({
  open,
  onOpenChange,
  resultado,
  contratoId,
  modoImportacao,
  onSuccess,
}: GeracaoEntregasModalProps) {
  const queryClient = useQueryClient();
  
  const [etapas, setEtapas] = useState<EtapaSelecionada[]>([]);
  const [entregas, setEntregas] = useState<EntregaSelecionada[]>([]);
  const [instrucoes, setInstrucoes] = useState<InstrucaoSelecionada[]>([]);
  const [tasks, setTasks] = useState<TaskSelecionada[]>([]);
  const [backlog, setBacklog] = useState<BacklogItemEditable[]>([]);
  const [expandedEtapas, setExpandedEtapas] = useState<number[]>([]);
  const [expandedEntregas, setExpandedEntregas] = useState<number[]>([]);
  const [expandedConjuntas, setExpandedConjuntas] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ etapa: string; current: number; total: number } | null>(null);
  const [activeEntrega, setActiveEntrega] = useState<EntregaSelecionada | null>(null);
  const [dadosExistentes, setDadosExistentes] = useState<DadosExistentes>({
    etapas: [],
    entregas: [],
    instrucoes: [],
    tasks: [],
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const entregaId = event.active.id as number;
    const entrega = entregas.find(e => e.numero_entrega === entregaId);
    setActiveEntrega(entrega || null);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEntrega(null);
    
    if (!over) return;
    
    const entregaId = active.id as number;
    const overId = over.id.toString();
    
    // Check if dropped on a phase
    if (overId.startsWith('fase-')) {
      const novaFaseId = parseInt(overId.replace('fase-', ''));
      const entrega = entregas.find(e => e.numero_entrega === entregaId);
      
      if (entrega && entrega.etapa_numero !== novaFaseId) {
        setEntregas(prev => prev.map(e => 
          e.numero_entrega === entregaId 
            ? { ...e, etapa_numero: novaFaseId }
            : e
        ));
        toast.success(`Entrega movida para Fase ${novaFaseId}`);
      }
    }
  };

  // Detectar se é formato novo ou antigo
  const isNewFormat = resultado && resultado.etapas && resultado.etapas.length > 0;

  // Buscar dados existentes quando abrir o modal em modo atualizar
  useEffect(() => {
    if (!open || !contratoId) return;

    const fetchDadosExistentes = async () => {
      const [etapasRes, entregasRes, instrucoesRes, tasksRes] = await Promise.all([
        supabase.from("etapas_business").select("id, numero_etapa, titulo").eq("contrato_id", contratoId),
        supabase.from("entregas_business").select("id, titulo, status").eq("contrato_id", contratoId),
        supabase.from("instrucoes_etapa").select("id, titulo, entrega_id, status"),
        supabase.from("tasks_business").select("id, titulo, status").eq("contrato_id", contratoId),
      ]);

      setDadosExistentes({
        etapas: etapasRes.data?.map(e => ({ id: e.id, numero: e.numero_etapa, titulo: e.titulo })) || [],
        entregas: entregasRes.data || [],
        instrucoes: instrucoesRes.data || [],
        tasks: tasksRes.data || [],
      });
    };

    fetchDadosExistentes();
  }, [open, contratoId]);

  useEffect(() => {
    if (!resultado) return;

    if (isNewFormat) {
      // Formato novo com estrutura hierárquica
      setEtapas(resultado.etapas.map(e => ({ ...e, selecionada: true })));
      setEntregas(resultado.entregas.map(e => ({ ...e, selecionada: true })));
      setInstrucoes(resultado.instrucoes.map(i => ({ ...i, selecionada: true })));
      setTasks(resultado.tasks.map(t => ({ ...t, selecionada: true })));
      
      // Backlog: converter para formato do editor com origem
      const backlogItems: BacklogItemEditable[] = resultado.backlog.map(b => ({
        titulo: b.titulo,
        descricao: b.descricao || '',
        categoria: (b.justificativa?.includes('Melhorias') ? 'Melhorias Futuras' : 
                   b.justificativa?.includes('Débito') ? 'Débito Técnico' : 'Pós-MVP') as BacklogItemEditable['categoria'],
        prioridade: 'media' as const,
        selecionado: true,
        origem: 'auto' as const
      }));
      setBacklog(backlogItems);
      
      // Expandir primeira etapa
      if (resultado.etapas.length > 0) {
        setExpandedEtapas([resultado.etapas[0].numero]);
      }
    } else {
      // Formato antigo - converter para novo
      const entregasAntigas = resultado.entregas_sugeridas || [];
      setEntregas(entregasAntigas.map((e, idx) => ({
        etapa_numero: 1,
        numero_entrega: idx + 1,
        titulo: e.titulo,
        descricao: e.descricao,
        tipo: e.tipo,
        prioridade: e.prioridade,
        modulo_relacionado: e.modulo_relacionado,
        selecionada: e.tipo === 'ativa',
      })));
      
      // Formato antigo: converter backlog para formato do editor com origem
      const backlogItems: BacklogItemEditable[] = (resultado.backlog_sugerido || []).map(b => ({
        titulo: b.titulo,
        descricao: b.descricao || '',
        categoria: 'Pós-MVP' as const,
        prioridade: 'media' as const,
        selecionado: false,
        origem: 'auto' as const
      }));
      setBacklog(backlogItems);
    }
  }, [resultado, isNewFormat]);

  // Helpers para verificar status de itens
  const getAcaoItem = (tipo: 'etapa' | 'entrega' | 'instrucao' | 'task', titulo: string) => {
    const existente = tipo === 'etapa' 
      ? dadosExistentes.etapas.find(e => e.titulo === titulo)
      : tipo === 'entrega'
        ? dadosExistentes.entregas.find(e => e.titulo === titulo)
        : tipo === 'task'
          ? dadosExistentes.tasks.find(t => t.titulo === titulo)
          : null;

    if (!existente) return 'nova';
    
    if (tipo === 'etapa') return 'existente'; // Etapas nunca são atualizadas
    
    const status = (existente as any).status;
    if (status === 'concluida' || status === 'concluido') return 'concluida';
    
    return modoImportacao === 'atualizar' ? 'atualizar' : 'existente';
  };

  const getAcaoBadge = (acao: string) => {
    switch (acao) {
      case 'nova':
        return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">+ Nova</Badge>;
      case 'atualizar':
        return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/30">↺ Atualizar</Badge>;
      case 'concluida':
        return <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-500 border-gray-500/30">✓ Concluída</Badge>;
      case 'existente':
        return <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">Existente</Badge>;
      default:
        return null;
    }
  };

  const toggleEtapa = (numero: number) => {
    setExpandedEtapas(prev =>
      prev.includes(numero)
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const toggleEntrega = (numero: number) => {
    setExpandedEntregas(prev =>
      prev.includes(numero)
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const toggleEtapaSelecionada = (numero: number) => {
    setEtapas(prev => prev.map(e => 
      e.numero === numero ? { ...e, selecionada: !e.selecionada } : e
    ));
  };

  const toggleEntregaSelecionada = (numero: number) => {
    setEntregas(prev => prev.map(e => 
      e.numero_entrega === numero ? { ...e, selecionada: !e.selecionada } : e
    ));
  };

  const toggleInstrucaoSelecionada = (entregaNumero: number, ordem: number) => {
    setInstrucoes(prev => prev.map(i => 
      i.entrega_numero === entregaNumero && i.ordem === ordem 
        ? { ...i, selecionada: !i.selecionada } 
        : i
    ));
  };

  const toggleTaskSelecionada = (entregaNumero: number, titulo: string) => {
    setTasks(prev => prev.map(t => 
      t.entrega_numero === entregaNumero && t.titulo === titulo 
        ? { ...t, selecionada: !t.selecionada } 
        : t
    ));
  };

  // ===== Handlers de edição (estado local, antes de salvar) =====
  const updateEtapa = (numero: number, patch: Partial<EtapaSelecionada>) => {
    setEtapas(prev => prev.map(e => e.numero === numero ? { ...e, ...patch } : e));
  };

  const removeEtapa = (numero: number) => {
    const entregasDaFase = entregas.filter(e => e.etapa_numero === numero).map(e => e.numero_entrega);
    setEtapas(prev => prev.filter(e => e.numero !== numero));
    setEntregas(prev => prev.filter(e => e.etapa_numero !== numero));
    setInstrucoes(prev => prev.filter(i => !entregasDaFase.includes(i.entrega_numero)));
    setTasks(prev => prev.filter(t => !entregasDaFase.includes(t.entrega_numero)));
  };

  const addEtapa = () => {
    const proximoNumero = etapas.length > 0 ? Math.max(...etapas.map(e => e.numero)) + 1 : 1;
    setEtapas(prev => [...prev, {
      numero: proximoNumero,
      titulo: `Nova Fase ${proximoNumero}`,
      objetivo: '',
      selecionada: true,
    }]);
    setExpandedEtapas(prev => [...prev, proximoNumero]);
  };

  const addEntrega = (etapaNumero: number) => {
    const proximoNumero = entregas.length > 0 ? Math.max(...entregas.map(e => e.numero_entrega)) + 1 : 1;
    setEntregas(prev => [...prev, {
      etapa_numero: etapaNumero,
      numero_entrega: proximoNumero,
      titulo: 'Nova entrega',
      descricao: '',
      tipo: 'ativa',
      prioridade: 'media',
      selecionada: true,
    }]);
    setExpandedEntregas(prev => [...prev, proximoNumero]);
  };

  const updateEntrega = (numeroEntrega: number, patch: Partial<EntregaSelecionada>) => {
    setEntregas(prev => prev.map(e => e.numero_entrega === numeroEntrega ? { ...e, ...patch } : e));
  };

  const removeEntrega = (numeroEntrega: number) => {
    setEntregas(prev => prev.filter(e => e.numero_entrega !== numeroEntrega));
    setInstrucoes(prev => prev.filter(i => i.entrega_numero !== numeroEntrega));
    setTasks(prev => prev.filter(t => t.entrega_numero !== numeroEntrega));
  };

  const updateInstrucao = (entregaNumero: number, ordem: number, patch: Partial<InstrucaoSelecionada>) => {
    setInstrucoes(prev => prev.map(i =>
      i.entrega_numero === entregaNumero && i.ordem === ordem ? { ...i, ...patch } : i
    ));
  };

  const removeInstrucao = (entregaNumero: number, ordem: number) => {
    setInstrucoes(prev => prev.filter(i => !(i.entrega_numero === entregaNumero && i.ordem === ordem)));
  };

  const addInstrucao = (entregaNumero: number) => {
    const existentes = instrucoes.filter(i => i.entrega_numero === entregaNumero);
    const proximaOrdem = existentes.length > 0 ? Math.max(...existentes.map(i => i.ordem)) + 1 : 1;
    setInstrucoes(prev => [...prev, {
      entrega_numero: entregaNumero,
      titulo: 'Novo passo',
      descricao: '',
      prompt_sugerido: '',
      responsavel: 'voce',
      ferramenta: 'outro',
      dicas: '',
      ordem: proximaOrdem,
      selecionada: true,
    }]);
  };

  const handleBacklogChange = (items: BacklogItemEditable[]) => {
    setBacklog(items);
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'urgente': { label: 'Urgente', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
      'alta': { label: 'Alta', className: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
      'media': { label: 'Média', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
      'baixa': { label: 'Baixa', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const c = config[prioridade] || config['media'];
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const getResponsavelBadge = (responsavel: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'voce': { label: 'Você', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
      'mentor': { label: 'Mentor', className: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
      'conjunto': { label: 'Conjunto', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
    };
    const c = config[responsavel] || config['voce'];
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  // Lista de ferramentas válidas (deve corresponder ao constraint do banco)
  const FERRAMENTAS_VALIDAS = ['claude', 'lovable', 'reuniao', 'outro', 'drive', 'notion', 'supabase', 'make', 'n8n', 'zapier', 'mapa'];

  const normalizarFerramenta = (ferramenta?: string): string => {
    if (!ferramenta) return 'outro';
    const lower = ferramenta.toLowerCase().trim();
    return FERRAMENTAS_VALIDAS.includes(lower) ? lower : 'outro';
  };

  const handleSalvar = async () => {
    setIsSaving(true);
    const t0 = performance.now();

    try {
      // Buscar user_id do contrato
      const { data: contrato } = await supabase
        .from("contratos_business")
        .select("user_id")
        .eq("id", contratoId)
        .single();

      if (!contrato) throw new Error("Contrato não encontrado");

      const entregasSelecionadas = entregas.filter(e => e.selecionada);
      const instrucoesSelecionadas = instrucoes.filter(i => i.selecionada);
      const tasksSelecionadas = tasks.filter(t => t.selecionada);
      const backlogSelecionado = backlog.filter(b => b.selecionado);

      let totalCriados = 0;
      let totalAtualizados = 0;

      // ====== 1. PRÉ-CARREGAR DADOS EXISTENTES (3 queries paralelas) ======
      setSaveProgress({ etapa: 'Carregando dados existentes', current: 0, total: 1 });
      const [
        { data: secoesExistentes },
        { data: entregasExistentes },
        { data: tasksExistentes },
      ] = await Promise.all([
        supabase.from("etapas_business").select("id, numero_etapa, titulo").eq("contrato_id", contratoId).order("numero_etapa"),
        supabase.from("entregas_business").select("id, titulo, status").eq("contrato_id", contratoId),
        supabase.from("tasks_business").select("id, titulo, status").eq("contrato_id", contratoId),
      ]);

      const entregasExistentesPorTitulo = new Map<string, { id: string; status: string }>();
      (entregasExistentes || []).forEach(e => entregasExistentesPorTitulo.set(e.titulo, { id: e.id, status: e.status }));

      const tasksExistentesPorTitulo = new Map<string, { id: string; status: string }>();
      (tasksExistentes || []).forEach(t => tasksExistentesPorTitulo.set(t.titulo, { id: t.id, status: t.status }));

      // Carregar instruções existentes só das entregas que aparecem na importação
      const idsEntregasExistentes = (entregasExistentes || []).map(e => e.id);
      let instrucoesExistentes: { id: string; titulo: string; entrega_id: string; status: string }[] = [];
      if (idsEntregasExistentes.length > 0) {
        const { data } = await supabase
          .from("instrucoes_etapa")
          .select("id, titulo, entrega_id, status")
          .in("entrega_id", idsEntregasExistentes);
        instrucoesExistentes = data || [];
      }
      const instrucoesExistentesPorChave = new Map<string, { id: string; status: string }>();
      instrucoesExistentes.forEach(i => instrucoesExistentesPorChave.set(`${i.entrega_id}::${i.titulo}`, { id: i.id, status: i.status }));

      // ====== 2. ETAPAS — atualizar/criar ======
      setSaveProgress({ etapa: 'Sincronizando fases', current: 0, total: etapas.length });
      const etapasMap: Record<number, string> = {};
      const etapasExistentesPorNumero = new Map<number, string>();
      (secoesExistentes || []).forEach(s => etapasExistentesPorNumero.set(s.numero_etapa, s.id));

      const etapasParaCriar: any[] = [];
      const etapaUpdates: Promise<any>[] = [];

      for (const etapa of etapas) {
        const idExistente = etapasExistentesPorNumero.get(etapa.numero);
        if (idExistente) {
          etapasMap[etapa.numero] = idExistente;
          if (etapa.selecionada) {
            etapaUpdates.push(
              supabase.from("etapas_business").update({
                titulo: etapa.titulo,
                objetivo: etapa.objetivo || null,
              }).eq("id", idExistente)
            );
            totalAtualizados++;
          }
        } else if (etapa.selecionada) {
          etapasParaCriar.push({
            contrato_id: contratoId,
            numero_etapa: etapa.numero,
            titulo: etapa.titulo,
            objetivo: etapa.objetivo || null,
            status: 'pendente',
          });
        }
      }

      // Executar updates de etapas em paralelo
      if (etapaUpdates.length > 0) await Promise.all(etapaUpdates);

      // Inserir novas etapas (batch)
      if (etapasParaCriar.length > 0) {
        const { data: novasEtapas, error } = await supabase
          .from("etapas_business")
          .insert(etapasParaCriar)
          .select("id, numero_etapa");
        if (error) throw error;
        (novasEtapas || []).forEach(e => { etapasMap[e.numero_etapa] = e.id; });
        totalCriados += novasEtapas?.length || 0;
      }

      // ====== 3. ENTREGAS — batch insert + parallel updates ======
      setSaveProgress({ etapa: 'Sincronizando entregas', current: 0, total: entregasSelecionadas.length });
      const entregasMap: Record<number, string> = {};
      const entregasParaCriar: any[] = [];
      const entregaUpdates: Promise<any>[] = [];
      const numeroEntregaParaTituloNovo = new Map<number, string>();

      for (const entrega of entregasSelecionadas) {
        const existente = entregasExistentesPorTitulo.get(entrega.titulo);
        if (existente) {
          entregasMap[entrega.numero_entrega] = existente.id;
          if (modoImportacao === 'atualizar' && existente.status !== 'concluida') {
            entregaUpdates.push(
              supabase.from("entregas_business").update({
                descricao: entrega.descricao,
                prioridade: entrega.prioridade === 'urgente' ? 'critica' : entrega.prioridade,
                modulo_relacionado: entrega.modulo_relacionado,
              }).eq("id", existente.id)
            );
            totalAtualizados++;
          }
        } else {
          entregasParaCriar.push({
            contrato_id: contratoId,
            etapa_id: etapasMap[entrega.etapa_numero] || null,
            titulo: entrega.titulo,
            descricao: entrega.descricao,
            modulo_relacionado: entrega.modulo_relacionado,
            tipo: entrega.tipo,
            prioridade: entrega.prioridade === 'urgente' ? 'critica' : entrega.prioridade,
            ordem: entrega.numero_entrega,
            numero_entrega: entrega.numero_entrega,
            tem_instrucoes: instrucoesSelecionadas.some(i => i.entrega_numero === entrega.numero_entrega),
          });
          numeroEntregaParaTituloNovo.set(entrega.numero_entrega, entrega.titulo);
        }
      }

      // Updates em paralelo (chunks de 20)
      for (let i = 0; i < entregaUpdates.length; i += 20) {
        await Promise.all(entregaUpdates.slice(i, i + 20));
        setSaveProgress({ etapa: 'Sincronizando entregas', current: Math.min(i + 20, entregaUpdates.length), total: entregasSelecionadas.length });
      }

      // Batch insert das novas entregas
      if (entregasParaCriar.length > 0) {
        const { data: novasEntregas, error } = await supabase
          .from("entregas_business")
          .insert(entregasParaCriar)
          .select("id, titulo");
        if (error) throw error;
        const tituloParaId = new Map<string, string>();
        (novasEntregas || []).forEach(e => tituloParaId.set(e.titulo, e.id));
        numeroEntregaParaTituloNovo.forEach((titulo, num) => {
          const id = tituloParaId.get(titulo);
          if (id) entregasMap[num] = id;
        });
        totalCriados += novasEntregas?.length || 0;
      }

      // ====== 4. INSTRUÇÕES — batch insert + parallel updates ======
      setSaveProgress({ etapa: 'Sincronizando instruções', current: 0, total: instrucoesSelecionadas.length });
      const instrucoesParaCriar: any[] = [];
      const instrucaoUpdates: Promise<any>[] = [];

      for (const instrucao of instrucoesSelecionadas) {
        const entregaId = entregasMap[instrucao.entrega_numero];
        if (!entregaId) continue;
        const entrega = entregasSelecionadas.find(e => e.numero_entrega === instrucao.entrega_numero);
        const etapaId = entrega ? etapasMap[entrega.etapa_numero] : null;

        const chave = `${entregaId}::${instrucao.titulo}`;
        const existente = instrucoesExistentesPorChave.get(chave);

        if (existente) {
          if (modoImportacao === 'atualizar' && existente.status !== 'concluida') {
            instrucaoUpdates.push(
              supabase.from("instrucoes_etapa").update({
                descricao: instrucao.descricao,
                prompt_sugerido: instrucao.prompt_sugerido || null,
                dicas: instrucao.dicas,
                ferramenta: normalizarFerramenta(instrucao.ferramenta),
              }).eq("id", existente.id)
            );
            totalAtualizados++;
          }
        } else {
          instrucoesParaCriar.push({
            etapa_id: etapaId,
            entrega_id: entregaId,
            titulo: instrucao.titulo,
            descricao: instrucao.descricao,
            prompt_sugerido: instrucao.prompt_sugerido || null,
            responsavel: instrucao.responsavel,
            ferramenta: normalizarFerramenta(instrucao.ferramenta),
            dicas: instrucao.dicas,
            ordem: instrucao.ordem,
            status: 'pendente',
            gerado_por_ia: true,
          });
        }
      }

      for (let i = 0; i < instrucaoUpdates.length; i += 20) {
        await Promise.all(instrucaoUpdates.slice(i, i + 20));
        setSaveProgress({ etapa: 'Sincronizando instruções', current: Math.min(i + 20, instrucaoUpdates.length), total: instrucoesSelecionadas.length });
      }

      // Batch insert (em chunks de 200 para evitar payload gigante)
      for (let i = 0; i < instrucoesParaCriar.length; i += 200) {
        const chunk = instrucoesParaCriar.slice(i, i + 200);
        const { error } = await supabase.from("instrucoes_etapa").insert(chunk);
        if (error) throw error;
        totalCriados += chunk.length;
        setSaveProgress({ etapa: 'Criando instruções', current: Math.min(i + 200, instrucoesParaCriar.length), total: instrucoesParaCriar.length });
      }

      // ====== 5. TASKS — batch insert + parallel updates ======
      setSaveProgress({ etapa: 'Sincronizando tasks', current: 0, total: tasksSelecionadas.length });
      const tasksParaCriar: any[] = [];
      const taskUpdates: Promise<any>[] = [];

      for (const task of tasksSelecionadas) {
        const entregaId = entregasMap[task.entrega_numero] || null;
        const entrega = entregasSelecionadas.find(e => e.numero_entrega === task.entrega_numero);
        const etapaId = entrega ? etapasMap[entrega.etapa_numero] : null;
        const existente = tasksExistentesPorTitulo.get(task.titulo);

        if (existente) {
          if (modoImportacao === 'atualizar' && existente.status !== 'concluida' && existente.status !== 'concluido') {
            taskUpdates.push(
              supabase.from("tasks_business").update({
                prioridade: task.prioridade,
                instrucoes_validacao: task.instrucoes_validacao,
              }).eq("id", existente.id)
            );
            totalAtualizados++;
          }
        } else {
          tasksParaCriar.push({
            contrato_id: contratoId,
            user_id: contrato.user_id,
            entrega_id: entregaId,
            etapa_id: etapaId,
            titulo: task.titulo,
            tipo: task.tipo,
            prioridade: task.prioridade,
            instrucoes_validacao: task.instrucoes_validacao,
            status: 'pendente',
          });
        }
      }

      for (let i = 0; i < taskUpdates.length; i += 20) {
        await Promise.all(taskUpdates.slice(i, i + 20));
      }

      if (tasksParaCriar.length > 0) {
        const { error } = await supabase.from("tasks_business").insert(tasksParaCriar);
        if (error) throw error;
        totalCriados += tasksParaCriar.length;
      }

      // ====== 6. BACKLOG — batch insert apenas dos novos ======
      if (backlogSelecionado.length > 0) {
        setSaveProgress({ etapa: 'Adicionando backlog', current: 0, total: backlogSelecionado.length });
        const backlogParaCriar = backlogSelecionado
          .filter(item => !entregasExistentesPorTitulo.has(item.titulo))
          .map(item => ({
            contrato_id: contratoId,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: 'backlog' as const,
            prioridade: item.prioridade || 'baixa',
            justificativa_backlog: item.categoria || 'Pós-MVP',
            ordem: 999,
            tem_instrucoes: false,
          }));
        if (backlogParaCriar.length > 0) {
          const { error } = await supabase.from("entregas_business").insert(backlogParaCriar);
          if (error) throw error;
          totalCriados += backlogParaCriar.length;
        }
      }

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["etapas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["instrucoes-etapa"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-business", contratoId] });

      const segundos = ((performance.now() - t0) / 1000).toFixed(1);
      const mensagens: string[] = [];
      if (totalCriados > 0) mensagens.push(`${totalCriados} criados`);
      if (totalAtualizados > 0) mensagens.push(`${totalAtualizados} atualizados`);
      toast.success(`${mensagens.join(', ') || 'Nada a salvar'} em ${segundos}s`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao salvar: ${(error as Error).message || 'desconhecido'}`);
    } finally {
      setIsSaving(false);
      setSaveProgress(null);
    }
  };

  // Contadores
  const totalEtapas = etapas.filter(e => e.selecionada).length;
  const totalEntregas = entregas.filter(e => e.selecionada).length;
  const totalInstrucoes = instrucoes.filter(i => i.selecionada).length;
  const totalTasks = tasks.filter(t => t.selecionada).length;
  const totalBacklog = backlog.filter(b => b.selecionado).length;

  // Separar entregas por tipo - Conjuntas agora vão dentro das fases
  const entregasMVP = entregas.filter(e => e.numero_entrega < 0);
  // Entregas principais incluem todas as entregas com numero > 0 (incluindo conjuntas)
  const entregasPrincipais = entregas.filter(e => e.numero_entrega > 0);

  // Cores por FASE
  const getCoresFase = (numero: number) => {
    const cores: Record<number, { bg: string; border: string; text: string; icon: string; headerBg: string }> = {
      1: { 
        bg: 'bg-purple-500/5', 
        border: 'border-purple-500/30', 
        text: 'text-purple-700', 
        icon: 'text-purple-600',
        headerBg: 'bg-purple-500/10 hover:bg-purple-500/15'
      },
      2: { 
        bg: 'bg-amber-500/5', 
        border: 'border-amber-500/30', 
        text: 'text-amber-700', 
        icon: 'text-amber-600',
        headerBg: 'bg-amber-500/10 hover:bg-amber-500/15'
      },
      3: { 
        bg: 'bg-blue-500/5', 
        border: 'border-blue-500/30', 
        text: 'text-blue-700', 
        icon: 'text-blue-600',
        headerBg: 'bg-blue-500/10 hover:bg-blue-500/15'
      },
    };
    return cores[numero] || cores[1];
  };

  // Calcular totais por fase com progresso
  const getTotaisFase = (faseNumero: number) => {
    const entregasFase = entregasPrincipais.filter(e => e.etapa_numero === faseNumero);
    const instrucoesFase = instrucoes.filter(i => 
      entregasFase.some(e => e.numero_entrega === i.entrega_numero)
    );
    const tasksFase = tasks.filter(t =>
      entregasFase.some(e => e.numero_entrega === t.entrega_numero)
    );
    
    // Contar itens concluídos usando dados existentes do banco
    const entregasConcluidas = entregasFase.filter(e => {
      const existente = dadosExistentes.entregas.find(ex => ex.titulo === e.titulo);
      return existente?.status === 'concluida';
    }).length;
    
    const instrucoesConcluidas = instrucoesFase.filter(i => {
      const entrega = entregasFase.find(e => e.numero_entrega === i.entrega_numero);
      const entregaExistente = entrega 
        ? dadosExistentes.entregas.find(ex => ex.titulo === entrega.titulo)
        : null;
      if (!entregaExistente) return false;
      const instrucaoExistente = dadosExistentes.instrucoes.find(
        ix => ix.entrega_id === entregaExistente.id && ix.titulo === i.titulo
      );
      return instrucaoExistente?.status === 'concluida';
    }).length;
    
    // Calcular porcentagem geral
    const totalItens = entregasFase.length + instrucoesFase.length;
    const totalConcluidos = entregasConcluidas + instrucoesConcluidas;
    const porcentagem = totalItens > 0 ? Math.round((totalConcluidos / totalItens) * 100) : 0;
    
    return {
      entregas: entregasFase.length,
      entregasConcluidas,
      instrucoes: instrucoesFase.length,
      instrucoesConcluidas,
      tasks: tasksFase.length,
      porcentagem
    };
  };
  
  // Cor da barra de progresso por fase
  const getProgressColor = (faseNumero: number, porcentagem: number) => {
    if (porcentagem === 100) return 'bg-emerald-500';
    const coresFase: Record<number, string> = {
      1: 'bg-purple-500',
      2: 'bg-amber-500',
      3: 'bg-blue-500'
    };
    return coresFase[faseNumero] || 'bg-muted-foreground/50';
  };

  // Detectar se fase é prioritária (baseado no título)
  const isFasePrioritaria = (titulo: string) => {
    return titulo.toLowerCase().includes('prioridade') || 
           titulo.toLowerCase().includes('financeiro') ||
           titulo.toLowerCase().includes('atual');
  };

  // Renderizar formato novo (hierárquico)
  const renderNewFormat = () => (
    <div className="space-y-4">
      {/* MVP - Entregas sem etapa */}
      {entregasMVP.length > 0 && (
        <div className="border rounded-lg overflow-hidden border-emerald-500/30">
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <div className="flex-1">
              <p className="font-medium text-emerald-700">MVP - Escopo Acordado</p>
              <p className="text-xs text-muted-foreground">Entregas prioritárias do primeiro release</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {entregasMVP.filter(e => e.selecionada).length}/{entregasMVP.length}
            </Badge>
          </div>
          <div className="p-3 space-y-2">
            {entregasMVP.map((entrega) => (
              <div 
                key={entrega.numero_entrega}
                className="flex items-center gap-3 p-2 border rounded bg-background"
              >
                <Checkbox
                  checked={entrega.selecionada}
                  onCheckedChange={() => toggleEntregaSelecionada(entrega.numero_entrega)}
                />
                <Package className="h-4 w-4 text-emerald-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{entrega.titulo}</p>
                </div>
                {getAcaoBadge(getAcaoItem('entrega', entrega.titulo))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FASES - Agrupadas por Fase do Documento com Drag-and-Drop */}
      {/* Entregas em Conjunto agora aparecem dentro das fases como items especiais */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {etapas.map((etapa) => {
            const entregasDaEtapa = entregasPrincipais.filter(e => e.etapa_numero === etapa.numero);
            const cores = getCoresFase(etapa.numero);
            const totais = getTotaisFase(etapa.numero);
            const isPrioritaria = isFasePrioritaria(etapa.titulo);
            
            return (
              <DroppableFase
                key={etapa.numero}
                etapa={etapa}
                entregas={entregasDaEtapa}
                instrucoes={instrucoes}
                tasks={tasks}
                cores={cores}
                totais={totais}
                isExpanded={expandedEtapas.includes(etapa.numero)}
                expandedEntregas={expandedEntregas}
                isPrioritaria={isPrioritaria}
                onToggleExpand={() => toggleEtapa(etapa.numero)}
                onToggleSelect={() => toggleEtapaSelecionada(etapa.numero)}
                onToggleEntrega={toggleEntrega}
                onToggleEntregaSelect={toggleEntregaSelecionada}
                onToggleInstrucao={toggleInstrucaoSelecionada}
                onToggleTask={toggleTaskSelecionada}
                onUpdateEtapa={updateEtapa}
                onRemoveEtapa={removeEtapa}
                onAddEntrega={addEntrega}
                onUpdateEntrega={updateEntrega}
                onRemoveEntrega={removeEntrega}
                onUpdateInstrucao={updateInstrucao}
                onRemoveInstrucao={removeInstrucao}
                onAddInstrucao={addInstrucao}
                getAcaoBadge={getAcaoBadge}
                getAcaoItem={getAcaoItem}
                getPrioridadeBadge={getPrioridadeBadge}
                getResponsavelBadge={getResponsavelBadge}
                getProgressColor={getProgressColor}
              />
            );
          })}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addEtapa}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova fase
          </Button>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEntrega && (
            <div className="border rounded-lg bg-background shadow-xl p-3 opacity-90">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Package className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">
                  Entrega {activeEntrega.numero_entrega}: {activeEntrega.titulo}
                </span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );

  // Renderizar formato antigo (flat)
  const renderOldFormat = () => (
    <div className="space-y-4">
      {entregas.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Entregas ({entregas.filter(e => e.selecionada).length}/{entregas.length})
          </h3>
          
          <div className="space-y-2">
            {entregas.map((entrega) => (
              <div 
                key={entrega.numero_entrega}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <Checkbox
                  checked={entrega.selecionada}
                  onCheckedChange={() => toggleEntregaSelecionada(entrega.numero_entrega)}
                />
                <div className="flex-1">
                  <p className="font-medium">{entrega.titulo}</p>
                  <p className="text-xs text-muted-foreground">{entrega.descricao}</p>
                </div>
                {getPrioridadeBadge(entrega.prioridade)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Estrutura Gerada pela IA
            {modoImportacao === 'atualizar' ? (
              <Badge variant="secondary" className="ml-2 text-xs bg-blue-500/10 text-blue-700 border-blue-500/30">
                <RefreshCw className="h-3 w-3 mr-1" />
                Modo Atualização
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                <Plus className="h-3 w-3 mr-1" />
                Nova Importação
              </Badge>
            )}
          </DialogTitle>
          {modoImportacao === 'atualizar' && (
            <p className="text-xs text-muted-foreground mt-1">
              Itens concluídos não serão modificados. Novas etapas serão adicionadas ao backlog.
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          {isNewFormat ? renderNewFormat() : renderOldFormat()}

          {/* Backlog - Usar BacklogEditor */}
          <Separator className="my-4" />
          <BacklogEditor
            initialItems={backlog}
            onItemsChange={handleBacklogChange}
          />
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground space-x-3">
            {isNewFormat && <span>{totalEtapas} fases</span>}
            <span>{totalEntregas} entregas</span>
            {isNewFormat && <span>{totalInstrucoes} instruções</span>}
            {isNewFormat && <span>{totalTasks} tasks</span>}
            {totalBacklog > 0 && <span>{totalBacklog} backlog</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvar} 
              disabled={isSaving || (totalEntregas === 0 && totalEtapas === 0)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Selecionados"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
