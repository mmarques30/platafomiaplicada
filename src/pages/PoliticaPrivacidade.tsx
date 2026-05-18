import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function PoliticaPrivacidade() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-ink">
        <AuthHeader />
        <div className="container max-w-4xl pt-24 pb-12 px-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <Skeleton className="h-8 w-64 bg-white/10" />
              <Skeleton className="h-4 w-48 mt-2 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full bg-white/10" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="min-h-screen bg-brand-ink">
        <AuthHeader />
        <div className="container max-w-4xl pt-24 pb-12 px-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">Documento não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-ink">
      <AuthHeader />
      <div className="container max-w-4xl pt-24 pb-12 px-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-6 w-6" />
              {documento.titulo}
            </CardTitle>
            {documento.ultima_atualizacao && (
              <p className="text-sm text-gray-400">
                Última atualização: {format(new Date(documento.ultima_atualizacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none">
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
