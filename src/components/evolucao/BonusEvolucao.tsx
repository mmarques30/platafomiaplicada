import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, ExternalLink, Download, Copy } from "lucide-react";
import { useMentoriaBonus, getArquivoUrls } from "@/hooks/useMentoriaBonus";
import { toast } from "@/hooks/use-toast";

export function BonusEvolucao() {
  const { bonus, isLoading } = useMentoriaBonus();

  const handleCopyCommand = (comando: string) => {
    navigator.clipboard.writeText(comando);
    toast({
      title: "Copiado!",
      description: "Comando copiado para a área de transferência",
    });
  };

  const getFileName = (url: string, index: number): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      const decoded = decodeURIComponent(fileName);
      const ext = decoded.split('.').pop()?.toUpperCase() || 'DOC';
      return `Documento ${index + 1} (${ext})`;
    } catch {
      return `Documento ${index + 1}`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bonus || bonus.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Gift className="h-5 w-5 text-primary" />
          Bônus Exclusivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bonus.map((item) => {
            const arquivos = getArquivoUrls(item.arquivo_url);
            
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 ${
                  item.liberado
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{item.nome}</h4>
                  {item.liberado ? (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Liberado
                    </Badge>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.descricao}
                </p>

                {item.liberado ? (
                  <div className="space-y-2">
                    {item.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(item.link!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar Link
                      </Button>
                    )}
                    {arquivos.map((url, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {arquivos.length > 1 ? getFileName(url, index) : "Baixar Documento"}
                      </Button>
                    ))}
                    {item.comando_uso && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleCopyCommand(item.comando_uso!)}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copiar Comando
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <span className="font-medium">Para desbloquear:</span>{" "}
                    {item.condicao_descricao || "Complete as condições necessárias"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
