import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import { useFerramentasCompartilhadas } from "@/hooks/useFerramentasCompartilhadas";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FerramentasCompartilhadasList() {
  const { ferramentas, isLoading } = useFerramentasCompartilhadas();
  const [selectedFerramenta, setSelectedFerramenta] = useState<any>(null);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      <Card className="border-aplicada-green-900/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!ferramentas || ferramentas.length === 0) {
    return (
      <Card className="border-aplicada-green-900/20">
        <CardHeader>
          <CardTitle className="text-2xl">Ferramentas Compartilhadas</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-zinc-500">
          <p className="text-sm">
            Nenhuma ferramenta compartilhada ainda. Seja o primeiro!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-aplicada-green-900/20">
        <CardHeader>
          <CardTitle className="text-2xl">Ferramentas Mais Compartilhadas</CardTitle>
          <CardDescription>
            Descobertas e recomendações da comunidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ferramentas.slice(0, 5).map((ferramenta: any) => (
            <div
              key={ferramenta.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-10 w-10 flex-shrink-0 border border-border">
                    <AvatarImage src={ferramenta.profiles?.avatar_url} />
                    <AvatarFallback className="bg-muted">
                      {getInitials(ferramenta.profiles?.nome_completo || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{ferramenta.nome}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {ferramenta.descricao}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {ferramenta.categoria}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFerramenta(ferramenta)}
                  >
                    Ver Detalhes
                  </Button>
                  {ferramenta.link && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(ferramenta.link, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFerramenta} onOpenChange={() => setSelectedFerramenta(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFerramenta?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedFerramenta?.profiles?.avatar_url} />
                <AvatarFallback>
                  {getInitials(selectedFerramenta?.profiles?.nome_completo || 'User')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedFerramenta?.profiles?.nome_completo || 'Anônimo'}
                </p>
                <Badge variant="secondary">{selectedFerramenta?.categoria}</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Descrição:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedFerramenta?.descricao}
              </p>
            </div>

            {selectedFerramenta?.link && (
              <div>
                <h4 className="font-semibold mb-2">Link:</h4>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(selectedFerramenta?.link, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar Ferramenta
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
