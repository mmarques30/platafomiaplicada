import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, FileText } from "lucide-react";

import { PageContainer } from "@/components/shared/PageContainer";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { itemCascata, listaCascata } from "@/lib/motion";

interface DocumentoConsulta {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  arquivo_url: string;
  destinatario_id: string | null;
  created_at: string;
}

/**
 * Os documentos de consulta publicados pela equipe.
 *
 * A RLS já decide o que cada pessoa enxerga: documento sem destinatário é de
 * todo mundo que tem acesso, e documento endereçado é só de quem recebeu. Por
 * isso aqui não há filtro por usuário: pedir tudo e deixar o banco recortar é
 * o que garante que a regra viva num lugar só.
 */
function useDocumentosConsulta() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documentos-consulta", user?.id],
    queryFn: async (): Promise<DocumentoConsulta[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("documentos_consulta")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as DocumentoConsulta[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/**
 * Documentos de consulta.
 *
 * Substitui a antiga tela de documentos do projeto, que tinha abas de
 * contratos, entregas, links e notas, e era indexada por contrato. Como a
 * plataforma deixou de acompanhar a execução do projeto, o que sobra é o que
 * a pessoa de fato vem buscar: o arquivo, e o que ele é.
 */
export default function Documentos() {
  const { data: documentos = [], isLoading } = useDocumentosConsulta();

  // Agrupa por categoria, mantendo a ordem em que a equipe publicou. Sem
  // categoria vira um grupo só, no fim.
  const grupos = documentos.reduce<Record<string, DocumentoConsulta[]>>((mapa, doc) => {
    const chave = doc.categoria?.trim() || "Outros";
    (mapa[chave] ??= []).push(doc);
    return mapa;
  }, {});
  const nomesGrupo = Object.keys(grupos).sort((a, b) =>
    a === "Outros" ? 1 : b === "Outros" ? -1 : a.localeCompare(b, "pt-BR"),
  );

  return (
    <PageContainer>
      <PageTitle
        primary="Documentos de"
        secondary="consulta"
        icon={<FileText className="h-6 w-6" strokeWidth={1.5} />}
        description="O material de referência que a equipe da IAplicada disponibiliza para você. Fica sempre aqui, para consultar quando precisar."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-skeleton-pulse rounded-card bg-foreground/[0.05]" />
          ))}
        </div>
      ) : documentos.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum documento por aqui ainda. Quando a equipe publicar algo para você, aparece
            nesta tela.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {nomesGrupo.map((nome) => (
            <section key={nome} className="space-y-4">
              <h2 className="rotulo-mono">{nome}</h2>
              <motion.div
                variants={listaCascata}
                initial="inicial"
                animate="ativo"
                className="space-y-3"
              >
                {grupos[nome].map((doc) => (
                  <motion.article
                    key={doc.id}
                    variants={itemCascata}
                    className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-border bg-card p-4 shadow-card md:p-5"
                  >
                    <div className="min-w-0 space-y-1">
                      <h3 className="titulo-bloco text-base text-foreground">{doc.titulo}</h3>
                      {doc.descricao && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {doc.descricao}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70">
                        publicado em{" "}
                        {format(new Date(doc.created_at), "d 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="shrink-0">
                      <a href={doc.arquivo_url} target="_blank" rel="noreferrer">
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        Abrir
                      </a>
                    </Button>
                  </motion.article>
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
