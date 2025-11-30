import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ChevronDown, MessageSquare, Heart, Play, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { RankingEngajamentoItem } from "@/hooks/useRankingEngajamento";

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
    <div className="space-y-6">
      {/* Vencedor do Mês */}
      {vencedor && (
        <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-2xl">Líder do Mês</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border border-yellow-500/30">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-yellow-500">
                  <AvatarImage src={vencedor.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">{getInitials(vencedor.nome_completo)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-2">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <Badge className="mb-2 bg-yellow-500 text-white">1º Lugar</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-1">{vencedor.nome_completo}</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-4">{vencedor.total_pontos.toLocaleString()} pontos</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{vencedor.total_posts} posts</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{vencedor.total_likes_recebidos} likes</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Play className="h-4 w-4" />
                    <span>{vencedor.total_videos_assistidos} vídeos</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{vencedor.dias_ativos_30d} dias ativos</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Engajamento</CardTitle>
          <p className="text-sm text-muted-foreground">
            Participe, interaja e ganhe prêmios todo mês!
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Top 10 */}
          {top10.map((item) => (
            <div
              key={item.user_id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                item.user_id === user?.id 
                  ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30' 
                  : 'bg-card border-border hover:bg-muted/50'
              }`}
            >
              <span className="font-mono text-sm font-semibold text-foreground w-8">{item.posicao}º</span>
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className="bg-muted">{getInitials(item.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${item.user_id === user?.id ? 'text-primary' : 'text-foreground'}`}>
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
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          ))}

          {/* Mais posições */}
          {outrosVisiveis.map((item) => (
            <div
              key={item.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.user_id === user?.id 
                  ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30' 
                  : 'bg-card border-border hover:bg-muted/50'
              }`}
            >
              <span className="font-mono text-xs font-semibold text-muted-foreground w-8">{item.posicao}º</span>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className="bg-muted text-xs">{getInitials(item.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${item.user_id === user?.id ? 'text-primary font-medium' : 'text-foreground'}`}>
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
          
          {temMais && (
            <Button 
              variant="ghost" 
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={`h-4 w-4 mr-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Ver menos' : `Ver mais ${outros.length - 5} posições`}
            </Button>
          )}

          {/* Minha posição (se não estiver visível) */}
          {minhaposicao && minhaposicao.posicao > 15 && !expanded && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/40 ring-1 ring-primary/30">
                <span className="font-mono text-sm text-muted-foreground w-8">{minhaposicao.posicao}º</span>
                <Avatar className="h-10 w-10 border border-primary">
                  <AvatarImage src={minhaposicao.avatar_url} />
                  <AvatarFallback className="bg-muted">{getInitials(minhaposicao.nome_completo)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-primary">Você - {minhaposicao.nome_completo}</p>
                  <p className="text-xs text-muted-foreground">Sua posição atual</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-foreground">{minhaposicao.total_pontos}</p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sobre a Premiação */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sobre a Premiação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Como funciona?</h4>
            <p className="text-sm text-muted-foreground">
              Todo mês, o membro mais engajado da comunidade é premiado! Os prêmios variam desde 
              acesso especial à plataforma até sessões de mentoria exclusivas.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Como pontuar?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Criar um post: <strong className="text-foreground">20 pontos</strong></li>
              <li>• Comentar: <strong className="text-foreground">5 pontos</strong></li>
              <li>• Receber um like: <strong className="text-foreground">10 pontos</strong></li>
              <li>• Assistir um vídeo: <strong className="text-foreground">3 pontos</strong></li>
              <li>• Dia ativo na plataforma: <strong className="text-foreground">1 ponto</strong></li>
            </ul>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              O ranking é apurado mensalmente. Continue ativo, compartilhe conhecimento e ajude outros membros!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
