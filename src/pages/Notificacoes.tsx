import { useEffect, useRef } from "react";
import { useAvisosPublicos, useMarcarAvisosComoLidos } from "@/hooks/useAvisosPublicos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTitle } from "@/components/shared/PageTitle";

const getBarColor = (tipo: string | null | undefined): string => {
  switch (tipo) {
    case "urgente":
    case "critico":
    case "atrasado":
    case "alerta":
    case "prazo":
      return "#E8684A";
    case "importante":
    case "entrega":
    case "tarefa":
      return "#E8A43C";
    case "informativo":
    case "sessao":
      return "#4A9FE0";
    case "conquista":
    case "certificado":
      return "#AFC040";
    default:
      return "#2CBBA6";
  }
};

const removeEmojis = (text: string): string =>
  text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "").trim();

export default function Notificacoes() {
  const { data: avisos, isLoading } = useAvisosPublicos();
  const { mutate: marcarComoLidos } = useMarcarAvisosComoLidos();
  const marcadoRef = useRef(false);

  useEffect(() => {
    if (avisos && avisos.length > 0 && !marcadoRef.current) {
      const ids = avisos.map(a => a.id);
      marcarComoLidos(ids);
      marcadoRef.current = true;
    }
  }, [avisos, marcarComoLidos]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8">
        <PageTitle primary="Avisos" icon={<Bell className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />} />
        <p className="text-sm md:text-base text-muted-foreground mt-2">Acompanhe os avisos e comunicados da plataforma</p>
      </div>

      <div className="space-y-4">
        {!avisos || avisos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum aviso ativo</h3>
              <p className="text-muted-foreground">Não há avisos publicados no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {avisos.map((aviso) => (
              <Card key={aviso.id} className="relative overflow-hidden border-primary/30 bg-primary/5">
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{ width: 3, backgroundColor: getBarColor(aviso.tipo) }}
                />
                <CardHeader className="pl-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{removeEmojis(aviso.titulo)}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(aviso.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        aviso.tipo === "urgente" 
                          ? "bg-red-500/10 text-red-600 border-red-500/20" 
                          : aviso.tipo === "importante"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {aviso.tipo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pl-5">
                  <p className="text-sm whitespace-pre-wrap">{removeEmojis(aviso.mensagem)}</p>
                  {aviso.data_expiracao && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Válido até: {new Date(aviso.data_expiracao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  const { data: avisos, isLoading } = useAvisosPublicos();
  const { mutate: marcarComoLidos } = useMarcarAvisosComoLidos();
  const marcadoRef = useRef(false);

  // Marcar avisos como lidos quando a página carregar
  useEffect(() => {
    if (avisos && avisos.length > 0 && !marcadoRef.current) {
      const ids = avisos.map(a => a.id);
      marcarComoLidos(ids);
      marcadoRef.current = true;
    }
  }, [avisos, marcarComoLidos]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8">
        <PageTitle primary="Avisos" icon={<Bell className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />} />
        <p className="text-sm md:text-base text-muted-foreground mt-2">Acompanhe os avisos e comunicados da plataforma</p>
      </div>

      <div className="space-y-4">
        {!avisos || avisos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum aviso ativo</h3>
              <p className="text-muted-foreground">Não há avisos publicados no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {avisos.map((aviso) => (
              <Card key={aviso.id} className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(aviso.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        aviso.tipo === "urgente" 
                          ? "bg-red-500/10 text-red-600 border-red-500/20" 
                          : aviso.tipo === "importante"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {aviso.tipo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{aviso.mensagem}</p>
                  {aviso.data_expiracao && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Válido até: {new Date(aviso.data_expiracao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
