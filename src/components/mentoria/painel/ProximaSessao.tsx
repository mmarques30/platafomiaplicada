import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Target, CheckSquare } from "lucide-react";

interface Props {
  sessao?: {
    titulo: string;
    notas?: string;
    data_sessao: string;
  };
}

export const ProximaSessao = ({ sessao }: Props) => {
  if (!sessao) {
    return (
      <Card className="bg-gradient-to-br from-aplicada-green-100 to-white border-aplicada-green-100">
        <CardContent className="pt-6 text-center text-aplicada-dark">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-aplicada-green-900" />
          <p className="text-muted-foreground">Nenhuma sessão agendada no momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#F6F7E9] to-white border-aplicada-green-900 border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-aplicada-dark flex items-center gap-2">
          <Calendar className="w-6 h-6 text-aplicada-green-900" />
          Próxima Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-aplicada-dark mb-2">{sessao.titulo}</h3>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(sessao.data_sessao), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {sessao.notas && (
          <div>
            <h4 className="font-semibold text-aplicada-dark mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-aplicada-green-900" />
              Objetivo
            </h4>
            <p className="text-sm">{sessao.notas}</p>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-aplicada-dark mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-aplicada-green-900" />
            O que vamos fazer
          </h4>
          <div className="space-y-2">
            {[
              "Revisão do progresso desde a última sessão",
              "Discussão de desafios e oportunidades",
              "Planejamento das próximas ações",
              "Definição de metas e prazos",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-4 h-4 mt-0.5 rounded border-2 border-aplicada-green-900" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-aplicada-dark mb-3">Preparação necessária</h4>
          <div className="space-y-2">
            {[
              "Revisar objetivos definidos anteriormente",
              "Listar dúvidas ou bloqueios encontrados",
              "Preparar materiais ou projetos para discussão",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-aplicada-green-900 mt-1">➥</span>
                <p className="flex-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-aplicada-green-100 p-4 rounded-lg">
          <h4 className="font-semibold text-aplicada-dark mb-2">Resultado esperado</h4>
          <p className="text-sm text-aplicada-dark">
            Clareza sobre os próximos passos e plano de ação detalhado para implementação
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
