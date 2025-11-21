import { CertificadoCard } from "@/components/shared/CertificadoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function EvolucaoCertificados() {
  const { user } = useAuth();
  const { data: certificados, isLoading: loadingCertificados } = useMeusCertificados();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("nome_completo")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  if (loadingCertificados) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Certificados</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const certificadosEmitidos = certificados?.filter((c) => c.status === "emitido") || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meus Certificados</h1>

      {certificadosEmitidos.length === 0 ? (
        <Alert>
          <AlertDescription>
            Nenhum certificado disponível ainda. Continue estudando para obter seus
            certificados!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificadosEmitidos.map((certificado) => (
            <CertificadoCard
              key={certificado.id}
              trilhaTitulo={certificado.trilhas?.titulo || "Trilha sem título"}
              nomeCompleto={profile?.nome_completo || user?.email || "Usuário"}
              dataConclusao={certificado.data_emissao || certificado.created_at}
              progresso={certificado.progresso || 100}
              certificadoUrl={certificado.url_pdf}
            />
          ))}
        </div>
      )}
    </div>
  );
}
