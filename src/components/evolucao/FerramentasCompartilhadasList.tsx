import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Eye, Heart } from "lucide-react";
import { useFerramentasCompartilhadas } from "@/hooks/useFerramentasCompartilhadas";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FerramentasCompartilhadasList() {
  const { ferramentas, isLoading } = useFerramentasCompartilhadas();
  const [selectedFerramenta, setSelectedFerramenta] = useState<any>(null);

  const handleCopy = (conteudo: string) => {
    navigator.clipboard.writeText(conteudo);
    toast.success("Conteúdo copiado!");
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      <Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas Compartilhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma ferramenta compartilhada ainda. Seja o primeiro!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas Compartilhadas pela Comunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ferramentas.slice(0, 5).map((ferramenta: any) => (
            <div
              key={ferramenta.id}
              className="p-4 border rounded-lg hover:bg-accent transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={ferramenta.profiles?.avatar_url} />
                    <AvatarFallback>
                      {getInitials(ferramenta.profiles?.nome_completo || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{ferramenta.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      por {ferramenta.profiles?.nome_completo || 'Anônimo'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{ferramenta.tipo}</Badge>
                  <Badge variant="outline">{ferramenta.categoria}</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {ferramenta.descricao}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {ferramenta.visualizacoes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {ferramenta.curtidas || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFerramenta(ferramenta)}
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(ferramenta.conteudo)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFerramenta} onOpenChange={() => setSelectedFerramenta(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFerramenta?.titulo}</DialogTitle>
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
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedFerramenta?.tipo}</Badge>
                  <Badge variant="outline">{selectedFerramenta?.categoria}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Descrição:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedFerramenta?.descricao}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Conteúdo:</h4>
                <Button
                  size="sm"
                  onClick={() => handleCopy(selectedFerramenta?.conteudo)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {selectedFerramenta?.conteudo}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
