import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  objetivos: Array<{
    id: string;
    objetivo: string;
    status: string;
    prazo?: string;
  }>;
}

export const ObjetivosEstrategicos = ({ objetivos }: Props) => {
  if (!objetivos || objetivos.length === 0) return null;

  return (
    <Card className="border-aplicada-green-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-aplicada-dark">
          Objetivos Estratégicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {objetivos.slice(0, 6).map((objetivo, index) => (
            <div
              key={objetivo.id}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-aplicada-green-100 bg-white hover:shadow-md hover:border-aplicada-green-900 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aplicada-green-900 text-white flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-aplicada-dark font-semibold text-base leading-relaxed">{objetivo.objetivo}</p>
                {objetivo.prazo && (
                  <p className="text-sm text-aplicada-dark/60 mt-2 font-medium">
                    Prazo: {new Date(objetivo.prazo).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
