import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "@/components/shared/CopyButton";
import { supabase } from "@/integrations/supabase/client";
import { ContratoBusiness } from "@/hooks/useContratosBusiness";
import { Loader2, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExportarDadosProjetoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: ContratoBusiness;
  userId: string;
  userName?: string;
}

export function ExportarDadosProjetoModal({ open, onOpenChange, contrato, userId, userName }: ExportarDadosProjetoModalProps) {
  const [loading, setLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [etapasRes, entregasRes, processosRes, telasRes, videosRes, sessoesRes] = await Promise.all([
        supabase.from("etapas_business").select("*").eq("contrato_id", contrato.id).order("numero_etapa"),
        supabase.from("entregas_business").select("*").eq("contrato_id", contrato.id).order("created_at"),
        supabase.from("processos_mapeados_business").select("*").eq("contrato_id", contrato.id).order("created_at"),
        supabase.from("telas_sistema_business").select("*").eq("contrato_id", contrato.id).order("ordem"),
        supabase.from("videos_instrucao_business").select("*").eq("contrato_id", contrato.id).order("ordem"),
        supabase.from("sessoes_mentoria").select("*").eq("user_id", userId).order("data_sessao", { ascending: false }),
      ]);

      const etapas = etapasRes.data || [];
      const entregas = entregasRes.data || [];
      const processos = processosRes.data || [];
      const telas = telasRes.data || [];
      const videos = videosRes.data || [];
      const sessoes = sessoesRes.data || [];

      const md = buildMarkdown({ contrato, etapas, entregas, processos, telas, videos, sessoes, userName });
      setMarkdownContent(md);
    } catch (err) {
      toast({ title: "Erro ao buscar dados", description: "Tente novamente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && !markdownContent) {
      fetchAllData();
    }
    if (!isOpen) {
      setMarkdownContent(null);
    }
  };

  const handleDownload = () => {
    if (!markdownContent) return;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${contrato.nome_empresa || "projeto"}-${format(new Date(), "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exportar Dados do Projeto
          </DialogTitle>
          <DialogDescription>
            Todos os dados do projeto compilados em formato texto para gerar reports em outra plataforma.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Coletando dados do projeto...</span>
          </div>
        ) : markdownContent ? (
          <ScrollArea className="max-h-[60vh] border rounded-lg p-4 bg-muted/30">
            <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">{markdownContent}</pre>
          </ScrollArea>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpen(false)}>Fechar</Button>
          {markdownContent && (
            <>
              <CopyButton content={markdownContent} />
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar .md
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yyyy", { locale: ptBR }); } catch { return d; }
}

function buildMarkdown({ contrato, etapas, entregas, processos, telas, videos, sessoes, userName }: any): string {
  const lines: string[] = [];

  lines.push(`# Report do Projeto — ${contrato.nome_empresa || userName || "Projeto Business"}`);
  lines.push(`> Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`);

  // --- CONTRATO ---
  lines.push(`## 📋 Contrato\n`);
  lines.push(`- **Empresa:** ${contrato.nome_empresa || "—"}`);
  lines.push(`- **Setor:** ${contrato.setor_atuacao || "—"}`);
  lines.push(`- **Status:** ${contrato.status || "—"}`);
  lines.push(`- **Início:** ${formatDate(contrato.data_inicio)}`);
  lines.push(`- **Fim:** ${formatDate(contrato.data_fim)}`);
  lines.push(`- **Módulos contratados:** ${contrato.modulos_contratados}`);
  lines.push(`- **Tempo de consultoria:** ${contrato.tempo_consultoria_meses} meses`);
  lines.push(`- **Reuniões mensais:** ${contrato.reunioes_mensais}`);
  if (contrato.valor_contrato) lines.push(`- **Valor do contrato:** R$ ${contrato.valor_contrato.toLocaleString("pt-BR")}`);
  if (contrato.contexto_transformacao) lines.push(`\n**Contexto da Transformação:**\n${contrato.contexto_transformacao}`);
  if (contrato.dores_mapeadas?.length) {
    lines.push(`\n**Dores Mapeadas:**`);
    contrato.dores_mapeadas.forEach((d: string) => lines.push(`- ${d}`));
  }
  if (contrato.desafios_estrategicos?.length) {
    lines.push(`\n**Desafios Estratégicos:**`);
    contrato.desafios_estrategicos.forEach((d: string) => lines.push(`- ${d}`));
  }

  // --- ETAPAS ---
  lines.push(`\n## 🎯 Etapas (${etapas.length})\n`);
  if (etapas.length === 0) {
    lines.push(`Nenhuma etapa cadastrada.`);
  } else {
    etapas.forEach((e: any) => {
      lines.push(`### Etapa ${e.numero_etapa}: ${e.titulo}`);
      lines.push(`- **Status:** ${e.status || "pendente"}`);
      if (e.descricao) lines.push(`- **Descrição:** ${e.descricao}`);
      if (e.data_inicio) lines.push(`- **Início:** ${formatDate(e.data_inicio)}`);
      if (e.data_fim) lines.push(`- **Fim:** ${formatDate(e.data_fim)}`);
      lines.push("");
    });
  }

  // --- ENTREGAS ---
  lines.push(`\n## 📦 Entregas (${entregas.length})\n`);
  if (entregas.length === 0) {
    lines.push(`Nenhuma entrega cadastrada.`);
  } else {
    entregas.forEach((e: any) => {
      lines.push(`- **${e.titulo}** — Status: ${e.status || "pendente"}${e.descricao ? ` | ${e.descricao}` : ""}`);
    });
  }

  // --- PROCESSOS ---
  lines.push(`\n## ⚙️ Processos Mapeados (${processos.length})\n`);
  if (processos.length === 0) {
    lines.push(`Nenhum processo cadastrado.`);
  } else {
    processos.forEach((p: any) => {
      lines.push(`### ${p.nome || p.titulo || "Processo"}`);
      if (p.descricao) lines.push(`${p.descricao}`);
      if (p.departamento) lines.push(`- **Departamento:** ${p.departamento}`);
      if (p.tempo_atual) lines.push(`- **Tempo atual:** ${p.tempo_atual}`);
      if (p.tempo_estimado_com_ia) lines.push(`- **Tempo estimado com IA:** ${p.tempo_estimado_com_ia}`);
      if (p.status) lines.push(`- **Status:** ${p.status}`);
      lines.push("");
    });
  }

  // --- TELAS ---
  lines.push(`\n## 🖥️ Telas do Sistema (${telas.length})\n`);
  if (telas.length === 0) {
    lines.push(`Nenhuma tela cadastrada.`);
  } else {
    telas.forEach((t: any) => {
      lines.push(`- **${t.titulo || t.nome}**${t.descricao ? `: ${t.descricao}` : ""}${t.url ? ` — [Link](${t.url})` : ""}`);
    });
  }

  // --- VÍDEOS ---
  lines.push(`\n## 🎬 Vídeos de Instrução (${videos.length})\n`);
  if (videos.length === 0) {
    lines.push(`Nenhum vídeo cadastrado.`);
  } else {
    videos.forEach((v: any) => {
      lines.push(`- **${v.titulo || v.nome}**${v.descricao ? `: ${v.descricao}` : ""}${v.url ? ` — [Link](${v.url})` : ""}`);
    });
  }

  // --- SESSÕES ---
  lines.push(`\n## 📅 Sessões/Reuniões (${sessoes.length})\n`);
  if (sessoes.length === 0) {
    lines.push(`Nenhuma sessão registrada.`);
  } else {
    sessoes.forEach((s: any) => {
      lines.push(`### ${formatDate(s.data_sessao)} — ${s.titulo || s.tipo || "Sessão"}`);
      if (s.resumo) lines.push(`${s.resumo}`);
      if (s.notas) lines.push(`**Notas:** ${s.notas}`);
      if (s.proximos_passos) lines.push(`**Próximos passos:** ${s.proximos_passos}`);
      lines.push("");
    });
  }

  lines.push(`\n---\n*Documento gerado automaticamente pela plataforma iAplicada.*`);

  return lines.join("\n");
}
