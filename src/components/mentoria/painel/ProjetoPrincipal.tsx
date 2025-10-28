import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  projeto?: {
    titulo: string;
    objetivo_projeto: string;
    contribuicao_plano: string;
    descricao: string;
  };
}

export const ProjetoPrincipal = ({ projeto }: Props) => {
  if (!projeto) return null;

  return (
    <Card className="border-l-4 border-l-aplicada-green-900 bg-aplicada-green-100">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-aplicada-dark">
          {projeto.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-8">
        <div>
          <h3 className="text-lg font-semibold text-aplicada-dark mb-3">
            Por que este é o projeto principal
          </h3>
          <div className="space-y-2">
            {projeto.objetivo_projeto.split('\n').map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-aplicada-green-900 mt-1">✱</span>
                <p className="flex-1">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-aplicada-dark mb-3">
            Diferenciais desta solução
          </h3>
          <div className="space-y-2">
            {projeto.contribuicao_plano.split('\n').map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-aplicada-green-900 mt-1">✱</span>
                <p className="flex-1">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-aplicada-dark mb-3">
            Componentes principais
          </h3>
          <div className="space-y-2">
            {projeto.descricao.split('\n').map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-aplicada-green-900 mt-1">➥</span>
                <p className="flex-1">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
