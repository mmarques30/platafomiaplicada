import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Building2 } from "lucide-react";

interface Props {
  nome: string;
  diagnostico: any;
}

export const PontosAtencao = ({ nome, diagnostico }: Props) => {
  if (!diagnostico) return null;

  const pontos = [
    {
      icon: User,
      titulo: `Sobre ${nome.split(' ')[0]}`,
      items: [
        diagnostico.estilo_aprendizagem && `Estilo de aprendizagem: ${diagnostico.estilo_aprendizagem}`,
        diagnostico.maior_medo_ia && `Maior preocupação: ${diagnostico.maior_medo_ia}`,
        diagnostico.motivacao_mentoria && `Motivação: ${diagnostico.motivacao_mentoria}`,
        diagnostico.zona_conforto && `Zona de conforto: ${diagnostico.zona_conforto}`,
      ].filter(Boolean),
    },
    {
      icon: Users,
      titulo: "Sobre o time de suporte",
      items: [
        diagnostico.lidera_equipe && `Lidera equipe de ${diagnostico.tamanho_equipe} pessoas`,
        diagnostico.tipo_suporte && `Tipo de suporte: ${diagnostico.tipo_suporte}`,
        diagnostico.nivel_autonomia && `Nível de autonomia: ${diagnostico.nivel_autonomia}`,
      ].filter(Boolean),
    },
    {
      icon: Building2,
      titulo: "Sobre o negócio",
      items: [
        diagnostico.tamanho_empresa && `Tamanho: ${diagnostico.tamanho_empresa}`,
        diagnostico.area_atuacao && `Área: ${diagnostico.area_atuacao}`,
        diagnostico.maior_ladrao_tempo && `Maior desafio: ${diagnostico.maior_ladrao_tempo}`,
      ].filter(Boolean),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pontos.map((ponto, index) => {
        const Icon = ponto.icon;
        return (
          <Card key={index} className="border-2 border-aplicada-green-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-aplicada-green-900 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-aplicada-dark text-lg">{ponto.titulo}</h3>
              </div>
              <div className="space-y-2 text-left">
                {ponto.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-2 text-sm">
                    <span className="text-aplicada-green-900 mt-0.5 flex-shrink-0 font-bold">•</span>
                    <p className="flex-1 text-aplicada-dark leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
