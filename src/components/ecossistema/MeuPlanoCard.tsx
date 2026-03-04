import { Card, CardContent } from "@/components/ui/card";
import { Crown, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const planoNomes: Record<string, string> = {
  academy: "IAplicada Academy",
  skills: "IAplicada Skills",
  business_parceria: "IAplicada Business Parceria",
  business_sistemas: "IAplicada Business Sistemas",
};

export function MeuPlanoCard() {
  const { profile, isLoading, diasRestantes, planoExpirado, planoVitalicio } = useUserProfile();

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-5 bg-muted rounded w-32" />
            <div className="h-5 bg-muted rounded w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile?.plano_mentoria) {
    return null;
  }

  const nomePlano = planoNomes[profile.plano_mentoria] || profile.plano_mentoria;
  const isAtivo = !planoExpirado && profile.conta_ativa;

  return (
    <Card className={`border-2 transition-all ${isAtivo ? 'border-primary/20 bg-primary/5' : 'border-muted'}`}>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{nomePlano}</h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isAtivo ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Plano ativo</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">Plano inativo</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {planoVitalicio ? (
              <span className="text-muted-foreground">Acesso vitalício</span>
            ) : profile.data_expiracao_acesso ? (
              <span className="text-muted-foreground">
                {planoExpirado ? "Expirou em: " : "Expira em: "}
                {format(new Date(profile.data_expiracao_acesso), "dd/MM/yyyy", { locale: ptBR })}
                {!planoExpirado && diasRestantes !== null && (
                  <span className="ml-1 text-xs">({diasRestantes} dias)</span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">Sem data de expiração definida</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
