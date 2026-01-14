import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PainelCard, PainelCardHeader } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  diagnostico: any;
  profile?: any;
  isBusiness?: boolean;
}

export const InformacoesMentorado = ({ diagnostico, profile, isBusiness = false }: Props) => {
  if (!diagnostico) return null;

  const theme = getPainelTheme(isBusiness);
  const ferramentasIA = diagnostico.ferramentas_ia || [];

  return (
    <PainelCard isBusiness={isBusiness}>
      <PainelCardHeader 
        title="Informações do Mentorado" 
        isBusiness={isBusiness}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem 
          label="Nome Completo" 
          value={diagnostico.nome_completo || profile?.nome_completo}
          isBusiness={isBusiness}
        />
        <InfoItem 
          label="Profissão" 
          value={diagnostico.profissao}
          isBusiness={isBusiness}
        />
        <InfoItem 
          label="Área de Atuação" 
          value={diagnostico.area_atuacao}
          isBusiness={isBusiness}
        />
        <InfoItem 
          label="Tempo de Experiência" 
          value={diagnostico.tempo_experiencia}
          isBusiness={isBusiness}
        />
        {diagnostico.lidera_equipe && (
          <InfoItem 
            label="Tamanho da Equipe" 
            value={`${diagnostico.tamanho_equipe} pessoas`}
            isBusiness={isBusiness}
          />
        )}
        <InfoItem 
          label="Disponibilidade" 
          value={diagnostico.tempo_disponivel}
          isBusiness={isBusiness}
        />
        <InfoItem 
          label="Plano de Mentoria" 
          value={profile?.plano_mentoria || "Não definido"}
          capitalize
          isBusiness={isBusiness}
        />
        <InfoItem 
          label="Estilo de Aprendizagem" 
          value={diagnostico.estilo_aprendizagem}
          isBusiness={isBusiness}
        />

        {ferramentasIA.length > 0 && (
          <div className="md:col-span-2">
            <p className={cn("text-sm font-medium mb-3", theme.textMuted)}>
              Ferramentas de IA que já utiliza
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ferramentasIA.map((ferramenta: string, index: number) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    isBusiness ? "bg-white/5 border border-white/10" : "bg-muted"
                  )}
                >
                  <Check className={cn("w-4 h-4", theme.accentColor)} />
                  <span className={cn("text-sm font-medium", theme.textSecondary)}>
                    {ferramenta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PainelCard>
  );
};

interface InfoItemProps {
  label: string;
  value: string | null | undefined;
  capitalize?: boolean;
  isBusiness?: boolean;
}

const InfoItem = ({ label, value, capitalize = false, isBusiness = false }: InfoItemProps) => {
  const theme = getPainelTheme(isBusiness);
  
  return (
    <div>
      <p className={cn("text-sm font-medium mb-1", theme.textMuted)}>{label}</p>
      <p className={cn(
        "font-semibold",
        theme.textSecondary,
        capitalize && "capitalize"
      )}>
        {value || "-"}
      </p>
    </div>
  );
};
