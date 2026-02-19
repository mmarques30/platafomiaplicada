import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/CopyButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ResumoTab() {
  const [periodo, setPeriodo] = useState<"7d" | "30d">("7d");
  const [resumo, setResumo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geradoEm, setGeradoEm] = useState<Date | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Erro ao gerar resumo",
        description: err.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
              <Button
                variant={periodo === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodo("7d")}
              >
                Últimos 7 dias
              </Button>
              <Button
                variant={periodo === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodo("30d")}
              >
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
