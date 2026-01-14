import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  // Busca o documento imediatamente, sem esperar autenticação
  const { data: documento, isLoading } = useQuery({
    queryKey: ["documento-legal-publico", "politica-privacidade"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos_legais")
        .select("*")
        .eq("slug", "politica-privacidade")
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        conteudo: data.conteudo_visitantes || data.conteudo_mentorados,
      };
    },
    staleTime: 1000 * 60 * 10,
  });

  const handleVoltar = () => {
    // Usa history.back() para voltar à página anterior, sem depender de auth
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8">
          <Button variant="ghost" onClick={handleVoltar} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Documento não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={handleVoltar} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {documento.titulo}
            </CardTitle>
            {documento.ultima_atualizacao && (
              <p className="text-sm text-muted-foreground">
                Última atualização: {format(new Date(documento.ultima_atualizacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {documento.conteudo}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
