import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, Package, Construction } from "lucide-react";

export function IAplicadaVisaoGeral() {
  return (
    <div className="space-y-6">
      {/* Card de Boas-vindas */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Visão Geral do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de acompanhamento do seu projeto. 
            Aqui você poderá visualizar o progresso das entregas da IAplicada.
          </p>
        </CardContent>
      </Card>

      {/* Cards de Status - Placeholders */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Entregas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Em breve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Em breve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Próxima Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem de construção */}
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-lg font-semibold mb-2">Em Construção</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Este painel está sendo desenvolvido para exibir o status em tempo real 
            do seu projeto com a IAplicada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
