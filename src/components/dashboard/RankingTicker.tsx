import { useDashboardRanking } from "@/hooks/useDashboardRanking";
import { Trophy, PlayCircle, Wrench, TrendingUp, TrendingDown, Star, Minus, FileText, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function RankingTicker() {
  const { data, isLoading } = useDashboardRanking();

  if (isLoading) {
    return (
      <section className="border-t border-border/60 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-4 w-32 bg-muted" />
          <Skeleton className="h-4 w-28 bg-muted" />
        </div>
      </section>
    );
  }

  const itens = [
    data?.topAlunos?.[0] && {
      chave: "aluno",
      icon: Trophy,
      label: data.topAlunos[0].nome,
      value: data.topAlunos[0].totalVideos,
      percentual: data.topAlunos[0].percentual,
      tendencia: data.topAlunos[0].tendencia,
      href: "/evolucao",
    },
    data?.topAulas?.[0] && {
      chave: "aula",
      icon: PlayCircle,
      label: data.topAulas[0].titulo,
      value: data.topAulas[0].visualizacoes,
      percentual: data.topAulas[0].percentual,
      tendencia: data.topAulas[0].tendencia,
      href: `/videos/${data.topAulas[0].id}`,
    },
    data?.topFerramentas?.[0] && {
      chave: "ferramenta",
      icon: Wrench,
      label: data.topFerramentas[0].nome,
      stars: data.topFerramentas[0].avaliacao,
      href: "/biblioteca-ferramentas",
    },
    data?.topPrompts?.[0] && {
      chave: "prompt",
      icon: FileText,
      label: data.topPrompts[0].titulo,
      value: data.topPrompts[0].acessos,
      percentual: data.topPrompts[0].percentual,
      tendencia: data.topPrompts[0].tendencia,
      href: "/biblioteca-prompts",
    },
    data?.topSalvos?.[0] && {
      chave: "salvo",
      icon: Bookmark,
      label: data.topSalvos[0].titulo,
      value: data.topSalvos[0].salvamentos,
      href: "/favoritos",
    },
  ].filter(Boolean) as Array<RankingItemProps & { chave: string }>;

  if (itens.length === 0) return null;

  return (
    /*
     * Os destaques da comunidade.
     *
     * Era um cartão solto no pé da página, depois de tudo — o lugar onde
     * ninguém chega. E o que ele diz (quem estudou mais, a aula mais vista, a
     * ferramenta mais bem avaliada) é justamente o tipo de coisa que se lê de
     * passagem, ao entrar, não ao terminar. Agora é a linha de rodapé do
     * painel de abertura, dentro dele, separada por um fio.
     *
     * Os separadores eram pendurados em cada item ("se existe o próximo,
     * desenha um risco antes"), então quando o primeiro item faltava a tira
     * começava com um risco solto. Agora a lista é montada primeiro e o risco
     * entra só entre dois itens que existem.
     */
    <section data-ranking-ticker className="border-t border-border/60 pt-4">
      <span className="rotulo-mono mb-2.5 block text-[10px]">Em destaque na comunidade</span>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
        {itens.map((item, i) => (
          <div key={item.chave} className="flex items-center gap-5">
            {i > 0 && (
              <span aria-hidden="true" className="hidden h-3.5 w-px bg-border/70 sm:block" />
            )}
            <RankingItem {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}

interface RankingItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number;
  percentual?: number;
  tendencia?: 'up' | 'down' | 'stable';
  stars?: number;
  href?: string;
}

function RankingItem({ icon: Icon, label, value, percentual, tendencia, stars, href }: RankingItemProps) {
  const content = (
    <div className="flex items-center gap-1.5 text-foreground cursor-pointer hover:opacity-70 transition-opacity">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-medium truncate max-w-[100px] sm:max-w-[120px]">
        {label}
      </span>
      
      {stars !== undefined ? (
        <span className="text-xs font-bold flex items-center gap-0.5 text-foreground">
          <Star className="w-3 h-3 fill-current" />
          {stars}
        </span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-foreground">{value}</span>
          
          {tendencia === 'up' && (
            <span className="flex items-center gap-0.5 text-status-success text-[10px] font-bold">
              <TrendingUp className="w-3 h-3" />
              +{percentual}%
            </span>
          )}
          {tendencia === 'down' && (
            <span className="flex items-center gap-0.5 text-status-danger text-[10px] font-bold">
              <TrendingDown className="w-3 h-3" />
              -{percentual}%
            </span>
          )}
          {tendencia === 'stable' && (
            <span className="flex items-center gap-0.5 text-muted-foreground text-[10px] font-bold">
              <Minus className="w-3 h-3" />
              0%
            </span>
          )}
        </div>
      )}
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}
