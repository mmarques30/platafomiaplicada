import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { RankingEngajamentoItem } from "@/hooks/useRankingEngajamento";
import { cn } from "@/lib/utils";

interface RankingEngajamentoProps {
  ranking: RankingEngajamentoItem[];
}

export function RankingEngajamento({ ranking }: RankingEngajamentoProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  const top3 = ranking?.slice(0, 3) || [];
  const posicoes4a10 = ranking?.slice(3, 10) || [];
  const alem10 = ranking?.slice(10) || [];
  const minhaposicao = ranking?.find(r => r.user_id === user?.id);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  const getMedalColor = (posicao: number) => {
    switch (posicao) {
      case 1: return "text-amber-600 border-amber-600";
      case 2: return "text-brand-strong border-brand-strong/40";
      case 3: return "text-amber-700 border-amber-700";
      default: return "text-muted-foreground border-brand-hairline";
    }
  };

  const getMedalBg = (posicao: number) => {
    switch (posicao) {
      case 1: return "bg-brand-cream border-brand-hairline";
      case 2: return "bg-brand-cream/60 border-brand-hairline";
      case 3: return "bg-brand-cream/40 border-brand-hairline";
      default: return "border-brand-hairline";
    }
  };

  const getAvatarBg = (posicao: number) => {
    switch (posicao) {
      case 1: return "bg-amber-600";
      case 2: return "bg-brand-strong";
      case 3: return "bg-amber-700";
      default: return "bg-brand-strong";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3 - Cards horizontais lado a lado */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((item) => (
            <div
              key={item.user_id}
              className={cn(
                "flex flex-col items-center p-6 rounded-xl border transition-colors",
                getMedalBg(item.posicao)
              )}
            >
              {/* Posição */}
              <span className={cn(
                "font-bold text-2xl mb-3",
                getMedalColor(item.posicao).split(' ')[0]
              )}>
                {item.posicao}º
              </span>
              
              {/* Avatar centralizado */}
              <Avatar className={cn(
                "mb-3 border-2",
                item.posicao === 1 ? "h-16 w-16" : "h-12 w-12",
                getMedalColor(item.posicao).split(' ')[1]
              )}>
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className={cn(
                  "text-white",
                  item.posicao === 1 ? "text-lg" : "text-sm",
                  getAvatarBg(item.posicao)
                )}>
                  {getInitials(item.nome_completo)}
                </AvatarFallback>
              </Avatar>
              
              {/* Nome */}
              <p className={cn(
                "font-medium truncate w-full text-center text-foreground",
                item.user_id === user?.id && "font-semibold"
              )}>
                {item.nome_completo}
                {item.user_id === user?.id && (
                  <span className="ml-1 text-xs text-amber-700">(Você)</span>
                )}
              </p>
              
              {/* Stats */}
              <p className="text-xs text-muted-foreground mt-1">
                {item.total_videos_assistidos} vídeos • {item.total_videos_reassistidos} reassistidos • {item.total_materiais_baixados} downloads • {item.total_aulas_presentes} presenças
              </p>
              
              {/* Pontos */}
              <p className="font-bold text-xl mt-3 text-foreground">
                {item.total_pontos} pts
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Posições 4+ - Tabela simplificada */}
      {(posicoes4a10.length > 0 || alem10.length > 0) && (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium w-12">#</th>
                <th className="text-left p-3 font-medium">Membro</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Vídeos</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Reassistidos</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Downloads</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Presenças</th>
                <th className="text-right p-3 font-medium">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Posições 4 a 10 */}
              {posicoes4a10.map((item) => (
                <tr 
                  key={item.user_id} 
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    item.user_id === user?.id && "bg-primary/10"
                  )}
                >
                  <td className="p-3 font-mono text-sm text-muted-foreground">{item.posicao}º</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.avatar_url} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(item.nome_completo)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "truncate",
                        item.user_id === user?.id ? "text-primary font-medium" : ""
                      )}>
                        {item.nome_completo}
                        {item.user_id === user?.id && (
                          <span className="ml-1 text-xs text-primary">(Você)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_videos_assistidos}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_videos_reassistidos}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_materiais_baixados}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_aulas_presentes}</td>
                  <td className="p-3 text-right font-semibold">{item.total_pontos}</td>
                </tr>
              ))}

              {/* Posições além do 10 - mostrar quando expandido */}
              {expanded && alem10.map((item) => (
                <tr 
                  key={item.user_id} 
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    item.user_id === user?.id && "bg-primary/10"
                  )}
                >
                  <td className="p-3 font-mono text-sm text-muted-foreground">{item.posicao}º</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.avatar_url} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(item.nome_completo)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "truncate",
                        item.user_id === user?.id ? "text-primary font-medium" : ""
                      )}>
                        {item.nome_completo}
                        {item.user_id === user?.id && (
                          <span className="ml-1 text-xs text-primary">(Você)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_videos_assistidos}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_videos_reassistidos}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_materiais_baixados}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{item.total_aulas_presentes}</td>
                  <td className="p-3 text-right font-semibold">{item.total_pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
            
          {alem10.length > 0 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-full p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 border-t"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
              {expanded ? 'Ver menos' : `Ver mais ${alem10.length} posições`}
            </button>
          )}

          {/* Minha posição (se não estiver visível no top 10) */}
          {minhaposicao && minhaposicao.posicao > 10 && !expanded && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                <span className="font-mono text-sm text-muted-foreground w-8">{minhaposicao.posicao}º</span>
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={minhaposicao.avatar_url} />
                  <AvatarFallback className="bg-primary/20 text-primary">{getInitials(minhaposicao.nome_completo)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-primary">Você - {minhaposicao.nome_completo}</p>
                  <p className="text-xs text-muted-foreground">Sua posição atual</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{minhaposicao.total_pontos}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
