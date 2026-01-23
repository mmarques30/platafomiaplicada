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
}

interface InstrucaoSelecionada {
  entrega_numero: number;
  titulo: string;
  descricao?: string;
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
      
      // Backlog: converter para formato do editor
      const backlogItems: BacklogItemEditable[] = resultado.backlog.map(b => ({
        titulo: b.titulo,
        descricao: b.descricao || '',
        categoria: (b.justificativa?.includes('Melhorias') ? 'Melhorias Futuras' : 
                   b.justificativa?.includes('Débito') ? 'Débito Técnico' : 'Pós-MVP') as BacklogItemEditable['categoria'],
        prioridade: 'media' as const,
        selecionado: true
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
      
      // Formato antigo: converter backlog para formato do editor
      const backlogItems: BacklogItemEditable[] = (resultado.backlog_sugerido || []).map(b => ({
        titulo: b.titulo,
        descricao: b.descricao || '',
        categoria: 'Pós-MVP' as const,
        prioridade: 'media' as const,
        selecionado: false
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
      let novasEtapasBacklog = 0;

      // 1. Processar Etapas (NUNCA atualizar, preservar acordo)
      const etapasMap: Record<number, string> = {};
      
      const etapasSelecionadas = etapas.filter(e => e.selecionada);
      if (etapasSelecionadas.length > 0) {
        for (const etapa of etapasSelecionadas) {
          // Verificar se já existe
          const { data: existente } = await supabase
            .from("etapas_business")
            .select("id")
            .eq("contrato_id", contratoId)
            .eq("numero_etapa", etapa.numero)
            .maybeSingle();

          if (existente) {
            // Etapa já existe - apenas mapear, NUNCA atualizar
            etapasMap[etapa.numero] = existente.id;
          } else if (modoImportacao === 'nova') {
            // Modo nova: criar etapa
            const { data: novaEtapa, error } = await supabase
              .from("etapas_business")
              .insert({
                contrato_id: contratoId,
                numero_etapa: etapa.numero,
                titulo: etapa.titulo,
                objetivo: etapa.objetivo,
                status: 'pendente',
              })
              .select()
              .single();

            if (error) throw error;
            etapasMap[etapa.numero] = novaEtapa.id;
            totalCriados++;
          } else {
            // Modo atualizar: nova etapa detectada -> adicionar como backlog
            await supabase.from("entregas_business").insert({
              contrato_id: contratoId,
              titulo: `Nova Fase Sugerida: ${etapa.titulo}`,
              descricao: `Fase ${etapa.numero} detectada na atualização. Objetivo: ${etapa.objetivo || 'A definir'}`,
              tipo: 'backlog',
              prioridade: 'baixa',
              justificativa_backlog: 'Nova fase detectada após acordo inicial - avaliar com mentor',
              ordem: 999,
            });
            novasEtapasBacklog++;
          }
        }
      }

      // 2. Processar Entregas (atualizar se não concluída)
      const entregasMap: Record<number, string> = {};
      
      for (const entrega of entregasSelecionadas) {
        const etapaId = etapasMap[entrega.etapa_numero] || null;
        
        // Verificar se já existe
        const { data: entregaExistente } = await supabase
          .from("entregas_business")
          .select("id, status")
          .eq("contrato_id", contratoId)
          .eq("titulo", entrega.titulo)
          .maybeSingle();

        if (entregaExistente) {
          entregasMap[entrega.numero_entrega] = entregaExistente.id;
          
          // Modo atualizar: atualizar campos se NÃO estiver concluída
          if (modoImportacao === 'atualizar' && entregaExistente.status !== 'concluida') {
            const { error } = await supabase
              .from("entregas_business")
              .update({
                descricao: entrega.descricao,
                prioridade: entrega.prioridade === 'urgente' ? 'critica' : entrega.prioridade,
                modulo_relacionado: entrega.modulo_relacionado,
                // NÃO atualizar: status, etapa_id (mantém o acordado)
              })
              .eq("id", entregaExistente.id);

            if (error) throw error;
            totalAtualizados++;
          }
          continue;
        }
        
        // Criar nova entrega
        const { data: novaEntrega, error } = await supabase
          .from("entregas_business")
          .insert({
            contrato_id: contratoId,
            etapa_id: etapaId,
            titulo: entrega.titulo,
            descricao: entrega.descricao,
            modulo_relacionado: entrega.modulo_relacionado,
            tipo: entrega.tipo,
            prioridade: entrega.prioridade === 'urgente' ? 'critica' : entrega.prioridade,
            ordem: entrega.numero_entrega,
            tem_instrucoes: instrucoesSelecionadas.some(i => i.entrega_numero === entrega.numero_entrega),
          })
          .select()
          .single();

        if (error) throw error;
        entregasMap[entrega.numero_entrega] = novaEntrega.id;
        totalCriados++;
      }

      // 3. Processar Instruções (atualizar se não concluída)
      for (const instrucao of instrucoesSelecionadas) {
        const entregaId = entregasMap[instrucao.entrega_numero] || null;
        const entrega = entregasSelecionadas.find(e => e.numero_entrega === instrucao.entrega_numero);
        const etapaId = entrega ? etapasMap[entrega.etapa_numero] : null;

        // Verificar se já existe
        const { data: instrucaoExistente } = await supabase
          .from("instrucoes_etapa")
          .select("id, status")
          .eq("entrega_id", entregaId)
          .eq("titulo", instrucao.titulo)
          .maybeSingle();

        if (instrucaoExistente) {
          // Modo atualizar: atualizar campos se NÃO estiver concluída
          if (modoImportacao === 'atualizar' && instrucaoExistente.status !== 'concluida') {
            const { error } = await supabase
              .from("instrucoes_etapa")
              .update({
                descricao: instrucao.descricao,
                dicas: instrucao.dicas,
                ferramenta: normalizarFerramenta(instrucao.ferramenta),
                // Manter: status, ordem original, responsavel
              })
              .eq("id", instrucaoExistente.id);

            if (error) throw error;
            totalAtualizados++;
          }
          continue;
        }

        // Criar nova instrução
        const { error } = await supabase
          .from("instrucoes_etapa")
          .insert({
            etapa_id: etapaId,
            entrega_id: entregaId,
            titulo: instrucao.titulo,
            descricao: instrucao.descricao,
            responsavel: instrucao.responsavel,
            ferramenta: normalizarFerramenta(instrucao.ferramenta),
            dicas: instrucao.dicas,
            ordem: instrucao.ordem,
            status: 'pendente',
            gerado_por_ia: true,
          });

        if (error) throw error;
        totalCriados++;
      }

      // 4. Processar Tasks (atualizar se não concluída)
      for (const task of tasksSelecionadas) {
        const entregaId = entregasMap[task.entrega_numero] || null;
        const entrega = entregasSelecionadas.find(e => e.numero_entrega === task.entrega_numero);
        const etapaId = entrega ? etapasMap[entrega.etapa_numero] : null;

        // Verificar se já existe
        const { data: taskExistente } = await supabase
          .from("tasks_business")
          .select("id, status")
          .eq("contrato_id", contratoId)
          .eq("titulo", task.titulo)
          .maybeSingle();

        if (taskExistente) {
          // Modo atualizar: atualizar campos se NÃO estiver concluída
          if (modoImportacao === 'atualizar' && taskExistente.status !== 'concluida' && taskExistente.status !== 'concluido') {
            const { error } = await supabase
              .from("tasks_business")
              .update({
                prioridade: task.prioridade,
                instrucoes_validacao: task.instrucoes_validacao,
              })
              .eq("id", taskExistente.id);

            if (error) throw error;
            totalAtualizados++;
          }
          continue;
        }

        // Criar nova task
        const { error } = await supabase
          .from("tasks_business")
          .insert({
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

        if (error) throw error;
        totalCriados++;
      }

      // 5. Processar Backlog (sempre adicionar novos)
      for (const item of backlogSelecionado) {
        // Verificar se já existe
        const { data: backlogExistente } = await supabase
          .from("entregas_business")
          .select("id")
          .eq("contrato_id", contratoId)
          .eq("titulo", item.titulo)
          .maybeSingle();

        if (backlogExistente) continue; // Já existe, pular

        const { error } = await supabase
          .from("entregas_business")
          .insert({
            contrato_id: contratoId,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: 'backlog',
            prioridade: item.prioridade || 'baixa',
            justificativa_backlog: item.categoria || 'Pós-MVP',
            ordem: 999,
            tem_instrucoes: false,
          });

        if (error) throw error;
        totalCriados++;
      }

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["etapas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["instrucoes-etapa"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-business", contratoId] });
      
      // Mensagem de sucesso
      const mensagens: string[] = [];
      if (totalCriados > 0) mensagens.push(`${totalCriados} criados`);
      if (totalAtualizados > 0) mensagens.push(`${totalAtualizados} atualizados`);
      if (novasEtapasBacklog > 0) mensagens.push(`${novasEtapasBacklog} novas fases em backlog`);
      
      toast.success(`Itens processados: ${mensagens.join(', ')}`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setIsSaving(false);
    }
  };

  // Contadores
  const totalEtapas = etapas.filter(e => e.selecionada).length;
  const totalEntregas = entregas.filter(e => e.selecionada).length;
  const totalInstrucoes = instrucoes.filter(i => i.selecionada).length;
  const totalTasks = tasks.filter(t => t.selecionada).length;
  const totalBacklog = backlog.filter(b => b.selecionado).length;

  // Separar entregas por tipo
  const entregasMVP = entregas.filter(e => e.numero_entrega < 0);
  const entregasConjuntas = entregas.filter(e => e.responsavel === 'conjunto');
  const entregasPrincipais = entregas.filter(e => e.numero_entrega > 0 && e.responsavel !== 'conjunto');

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

      {/* Entregas em Conjunto - AGRUPADA */}
      {entregasConjuntas.length > 0 && (
        <div className="border rounded-lg overflow-hidden border-blue-500/30">
          <div 
            className="flex items-center gap-3 p-3 bg-blue-500/10 cursor-pointer hover:bg-blue-500/15"
            onClick={() => setExpandedConjuntas(!expandedConjuntas)}
          >
            {expandedConjuntas ? (
              <ChevronDown className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-blue-600" />
            )}
            <Users className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-blue-700">Entregas em Conjunto (Mariana + Paula)</p>
              <p className="text-xs text-muted-foreground">
                {entregasConjuntas.filter(e => e.status === 'concluida').length} concluídas de {entregasConjuntas.length} itens
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {entregasConjuntas.filter(e => e.selecionada).length}/{entregasConjuntas.length}
            </Badge>
            {getResponsavelBadge('conjunto')}
          </div>
          
          {expandedConjuntas && (
            <div className="p-3 space-y-2 max-h-[250px] overflow-y-auto">
              {entregasConjuntas.map((entrega, idx) => (
                <div 
                  key={entrega.numero_entrega}
                  className={`flex items-center gap-3 p-2 border rounded transition-colors ${
                    entrega.status === 'concluida' 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : 'bg-background'
                  }`}
                >
                  <Checkbox
                    checked={entrega.selecionada}
                    onCheckedChange={() => toggleEntregaSelecionada(entrega.numero_entrega)}
                  />
                  <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${entrega.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}>
                      {entrega.titulo}
                    </p>
                  </div>
                  {entrega.status === 'concluida' ? (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      ✓ Feito
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                      Pendente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FASES - Agrupadas por Fase do Documento com Drag-and-Drop */}
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
                getAcaoBadge={getAcaoBadge}
                getAcaoItem={getAcaoItem}
                getPrioridadeBadge={getPrioridadeBadge}
                getResponsavelBadge={getResponsavelBadge}
                getProgressColor={getProgressColor}
              />
            );
          })}
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
