import { cn } from "@/lib/utils";
import { formatProjetoTitulo } from "@/lib/utils";
import { PainelCard, PainelCardHeader } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  projeto?: {
    titulo: string;
    objetivo_projeto: string;
    contribuicao_plano: string;
    descricao: string;
  };
  isBusiness?: boolean;
}

export const ProjetoPrincipal = ({ projeto, isBusiness = false }: Props) => {
  if (!projeto) return null;

  const theme = getPainelTheme(isBusiness);

  return (
    <PainelCard isBusiness={isBusiness} accentBorder>
      <h2 className={cn(
        "text-3xl font-bold tracking-tight mb-6",
        theme.textPrimary
      )}>
        {formatProjetoTitulo(projeto.titulo)}
      </h2>
      
      <div className="space-y-6">
        <Section 
          title="Por que este é o projeto principal"
          items={projeto.objetivo_projeto.split('\n')}
          isBusiness={isBusiness}
        />
        
        <div className={theme.separator} />
        
        <Section 
          title="Diferenciais desta solução"
          items={projeto.contribuicao_plano.split('\n')}
          isBusiness={isBusiness}
        />
        
        <div className={theme.separator} />
        
        <Section 
          title="Componentes principais"
          items={projeto.descricao.split('\n')}
          isBusiness={isBusiness}
        />
      </div>
    </PainelCard>
  );
};

interface SectionProps {
  title: string;
  items: string[];
  isBusiness?: boolean;
}

const Section = ({ title, items, isBusiness = false }: SectionProps) => {
  const theme = getPainelTheme(isBusiness);
  
  return (
    <div>
      <h3 className={cn("text-lg font-semibold mb-3", theme.textPrimary)}>
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0", 
              isBusiness ? "bg-violet-400" : "bg-aplicada-green-900"
            )} />
            <p className={cn("flex-1 leading-relaxed", theme.textSecondary)}>{line}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
