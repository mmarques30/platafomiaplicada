import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/CopyButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Clock, Plus, Trash2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CATEGORIAS_MELHORIA = ["Funcionalidade", "Performance", "Interface", "Correção"];

interface Melhoria {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  created_at: string;
}

export function ResumoTab() {
  const [periodo, setPeriodo] = useState<"7d" | "30d">("7d");
  const [resumo, setResumo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geradoEm, setGeradoEm] = useState<Date | null>(null);
  const { toast } = useToast();

  // Melhorias state
  const [melhorias, setMelhorias] = useState<Melhoria[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("Funcionalidade");
  const [salvando, setSalvando] = useState(false);

  const fetchMelhorias = async () => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    const { data } = await supabase
      .from("melhorias_plataforma")
      .select("id, titulo, descricao, categoria, created_at")
      .gte("created_at", limite.toISOString())
      .order("created_at", { ascending: false });
    if (data) setMelhorias(data);
  };

  useEffect(() => {
    fetchMelhorias();
  }, []);

  const salvarMelhoria = async () => {
    if (!novoTitulo.trim()) return;
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("melhorias_plataforma").insert({
        titulo: novoTitulo.trim(),
        descricao: novaDescricao.trim() || null,
        categoria: novaCategoria,
        created_by: user?.id,
      });
      if (error) throw error;
      toast({ title: "Melhoria registrada!" });
      setNovoTitulo("");
      setNovaDescricao("");
      setNovaCategoria("Funcionalidade");
      setDialogOpen(false);
      fetchMelhorias();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const removerMelhoria = async (id: string) => {
    const { error } = await supabase.from("melhorias_plataforma").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } else {
      setMelhorias((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const gerarResumo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-resumo-atualizacoes", {
        body: { periodo },
      });
      if (error) throw error;
      setResumo(data.resumo);
      setGeradoEm(new Date());
    } catch (err: any) {
      console.error("Erro ao gerar resumo:", err);
      toast({ title: "Erro ao gerar resumo", description: err.message || "Tente novamente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Melhorias da Plataforma */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Melhorias da Plataforma
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Registrar Melhoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Melhoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input
                  placeholder="Título da melhoria *"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  rows={3}
                />
                <Select value={novaCategoria} onValueChange={setNovaCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_MELHORIA.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={salvarMelhoria} disabled={salvando || !novoTitulo.trim()} className="w-full">
                  {salvando ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {melhorias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma melhoria registrada nos últimos 30 dias.</p>
          ) : (
            <div className="space-y-2">
              {melhorias.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-2 p-2 rounded-md border border-border/50 bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{m.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.categoria} · {new Date(m.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removerMelhoria(m.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gerar Resumo */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Gerar Resumo de Atualizações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <Button variant={periodo === "7d" ? "default" : "outline"} size="sm" onClick={() => setPeriodo("7d")}>
                Últimos 7 dias
              </Button>
              <Button variant={periodo === "30d" ? "default" : "outline"} size="sm" onClick={() => setPeriodo("30d")}>
                Últimos 30 dias
              </Button>
            </div>
            <Button onClick={gerarResumo} disabled={loading} size="sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {loading ? "Gerando..." : "Gerar Resumo"}
            </Button>
          </div>
          {geradoEm && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Gerado em {geradoEm.toLocaleString("pt-BR")}
            </p>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      )}

      {!loading && resumo && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Resumo</CardTitle>
            <CopyButton content={resumo} />
          </CardHeader>
          <CardContent>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {resumo}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
