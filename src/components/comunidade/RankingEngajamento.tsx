import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, ChevronDown, MessageSquare, Heart, Calendar, Sparkles } from "lucide-react";
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
  
  const vencedor = ranking?.[0];
  const top10 = ranking?.slice(1, 10) || [];
  const outros = ranking?.slice(10) || [];
  const outrosVisiveis = expanded ? outros : outros.slice(0, 5);
  const temMais = outros.length > 5;
  const minhaposicao = ranking?.find(r => r.user_id === user?.id);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  return (
    <div className="space-y-4">
      {/* Vencedor do Mês */}
      {vencedor && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-foreground">Líder do Mês</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-yellow-500">
                <AvatarImage src={vencedor.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-yellow-500 text-white">{getInitials(vencedor.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-1.5">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs font-semibold mb-2">
                1º Lugar
              </span>
              <h3 className="text-xl font-bold text-foreground mb-1">{vencedor.nome_completo}</h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mb-3">{vencedor.total_pontos.toLocaleString()} pontos</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{vencedor.total_posts} posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{vencedor.total_likes_recebidos} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{vencedor.dias_ativos_30d} dias ativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Geral */}
      <div className="bg-card rounded-2xl overflow-hidden border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Ranking de Engajamento</h3>
          <p className="text-sm text-muted-foreground">
            Participe, interaja e ganhe prêmios todo mês!
          </p>
        </div>
        
        <div className="divide-y divide-border">
          {/* Top 10 */}
          {top10.map((item) => (
            <div
              key={item.user_id}
              className={cn(
                "flex items-center gap-3 p-4 transition-colors hover:bg-muted/50",
                item.user_id === user?.id && "bg-primary/5"
              )}
            >
              <span className="font-mono text-sm font-semibold text-muted-foreground w-8">{item.posicao}º</span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(item.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  item.user_id === user?.id ? "text-primary" : "text-foreground"
                )}>
                  {item.nome_completo}
                  {item.user_id === user?.id && (
                    <span className="ml-2 text-xs text-primary">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.total_posts} posts • {item.total_comentarios} comentários • {item.total_likes_recebidos} likes
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-foreground">{item.total_pontos}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}

          {/* Mais posições */}
          {outrosVisiveis.map((item) => (
            <div
              key={item.user_id}
              className={cn(
                "flex items-center gap-3 p-3 transition-colors hover:bg-muted/50",
                item.user_id === user?.id && "bg-primary/5"
              )}
            >
              <span className="font-mono text-xs text-muted-foreground w-8">{item.posicao}º</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(item.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  item.user_id === user?.id ? "text-primary font-medium" : "text-foreground"
                )}>
                  {item.nome_completo}
                  {item.user_id === user?.id && (
                    <span className="ml-2 text-xs text-primary">(Você)</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{item.total_pontos}</p>
              </div>
            </div>
          ))}
        </div>
          
        {temMais && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full p-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
            {expanded ? 'Ver menos' : `Ver mais ${outros.length - 5} posições`}
          </button>
        )}

        {/* Minha posição (se não estiver visível) */}
        {minhaposicao && minhaposicao.posicao > 15 && !expanded && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="font-mono text-sm text-muted-foreground w-8">{minhaposicao.posicao}º</span>
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={minhaposicao.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(minhaposicao.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-primary">Você - {minhaposicao.nome_completo}</p>
                <p className="text-xs text-muted-foreground">Sua posição atual</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-foreground">{minhaposicao.total_pontos}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sobre a Premiação */}
      <div className="bg-card rounded-2xl p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Sobre a Premiação</h3>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Como funciona?</h4>
            <p className="text-muted-foreground">
              Todo mês, o membro mais engajado da comunidade é premiado! Os prêmios variam desde 
              acesso especial à plataforma até sessões de mentoria exclusivas.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Como pontuar?</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Criar um post: <span className="text-primary font-medium">20 pontos</span></li>
              <li>• Comentar: <span className="text-primary font-medium">5 pontos</span></li>
              <li>• Dar um like: <span className="text-primary font-medium">2 pontos</span></li>
              <li>• Receber um like: <span className="text-primary font-medium">10 pontos</span></li>
              <li>• Dia ativo na plataforma: <span className="text-primary font-medium">1 ponto</span></li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            O ranking é apurado mensalmente. Continue ativo, compartilhe conhecimento e ajude outros membros!
          </p>
        </div>
      </div>
    </div>
  );
}
