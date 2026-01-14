import { User, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PainelCard } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  nome: string;
  diagnostico: any;
  isBusiness?: boolean;
}

export const PontosAtencao = ({ nome, diagnostico, isBusiness = false }: Props) => {
  if (!diagnostico) return null;

  const theme = getPainelTheme(isBusiness);

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
          <PainelCard key={index} isBusiness={isBusiness}>
            <div className="flex flex-col items-center text-center mb-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                theme.iconBg
              )}>
                <Icon className={cn("w-6 h-6", theme.iconColor)} />
              </div>
              <h3 className={cn("font-bold text-lg", theme.textPrimary)}>
                {ponto.titulo}
              </h3>
            </div>
            <div className="space-y-2 text-left">
              {ponto.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                    isBusiness ? "bg-violet-400" : "bg-aplicada-green-900"
                  )} />
                  <p className={cn("flex-1 leading-relaxed", theme.textSecondary)}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </PainelCard>
        );
      })}
    </div>
  );
};
