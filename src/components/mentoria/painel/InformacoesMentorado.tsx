import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface Props {
  diagnostico: any;
  profile?: any;
}

export const InformacoesMentorado = ({ diagnostico, profile }: Props) => {
  if (!diagnostico) return null;

  const ferramentasIA = diagnostico.ferramentas_ia || [];

  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Informações do Mentorado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Nome Completo</p>
            <p className="font-semibold text-card-foreground">{diagnostico.nome_completo || profile?.nome_completo}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Profissão</p>
            <p className="font-semibold text-card-foreground">{diagnostico.profissao}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Área de Atuação</p>
            <p className="font-semibold text-card-foreground">{diagnostico.area_atuacao}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Tempo de Experiência</p>
            <p className="font-semibold text-card-foreground">{diagnostico.tempo_experiencia}</p>
          </div>

          {diagnostico.lidera_equipe && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Tamanho da Equipe</p>
              <p className="font-semibold text-card-foreground">{diagnostico.tamanho_equipe} pessoas</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Disponibilidade</p>
            <p className="font-semibold text-card-foreground">{diagnostico.tempo_disponivel}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Plano de Mentoria</p>
            <p className="font-semibold text-card-foreground capitalize">{profile?.plano_mentoria || "Não definido"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Estilo de Aprendizagem</p>
            <p className="font-semibold text-card-foreground">{diagnostico.estilo_aprendizagem}</p>
          </div>

          {ferramentasIA.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Ferramentas de IA que já utiliza</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ferramentasIA.map((ferramenta: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-aplicada-green-900" />
                    <span className="text-sm font-semibold text-card-foreground">{ferramenta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
