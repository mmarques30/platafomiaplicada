import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, ExternalLink } from "lucide-react";

interface Ferramenta {
  id: string;
  nome: string;
  logo_url: string | null;
  categoria: string;
  avaliacao_mari: number | null;
  avaliacao_comunidade: number | null;
  total_avaliacoes_comunidade: number | null;
  gratuito: boolean;
  link_ferramenta: string | null;
  objetivo: string;
}

interface FerramentasRankingProps {
  ferramentas: Ferramenta[];
  onVerMais: (ferramenta: Ferramenta) => void;
}

export function FerramentasRanking({ ferramentas, onVerMais }: FerramentasRankingProps) {
  const calcularPontuacao = (ferramenta: Ferramenta) => {
    const mariScore = ferramenta.avaliacao_mari || 0;
    const comunidadeScore = ferramenta.avaliacao_comunidade || 0;
    return (mariScore * 0.6) + (comunidadeScore * 0.4);
  };

  // Ranking fixo: Claude (1º), Manus (2º), Gamma (3º)
  const top3 = [
    ferramentas.find(f => f.nome.toLowerCase().includes('claude')),
    ferramentas.find(f => f.nome.toLowerCase().includes('manus')),
    ferramentas.find(f => f.nome.toLowerCase().includes('gamma'))
  ].filter(Boolean) as Ferramenta[];

  if (top3.length === 0) return null;

  // Organizar como: [2º, 1º, 3º] para efeito pódio
  const podio = [top3[1], top3[0], top3[2]].filter(Boolean);

  const getMedalColor = (index: number) => {
    if (index === 1) return "from-yellow-400 to-yellow-600"; // 1º
    if (index === 0) return "from-gray-300 to-gray-500"; // 2º
    return "from-orange-400 to-orange-600"; // 3º
  };

  const getPodiumHeight = (index: number) => {
    if (index === 1) return "h-[500px]"; // 1º mais alto
    if (index === 0) return "h-[470px]"; // 2º médio
    return "h-[440px]"; // 3º menor
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <h2 className="text-2xl font-bold text-center">Top 3 Ferramentas Recomendadas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {podio.map((ferramenta, idx) => {
          const pontuacao = calcularPontuacao(ferramenta);
          const posicaoReal = idx === 1 ? 1 : idx === 0 ? 2 : 3;

          return (
            <Card
              key={ferramenta.id}
              className={`${getPodiumHeight(idx)} transition-all hover:scale-105 hover:shadow-xl relative overflow-hidden`}
            >
              {/* Badge de posição */}
              <div className={`absolute top-0 left-0 right-0 h-12 bg-gradient-to-r ${getMedalColor(idx)} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{posicaoReal}º Lugar</span>
              </div>

              <CardContent className="p-4 pt-16 flex flex-col h-full">
                {/* Nome e Categoria */}
                <h3 className="text-lg font-bold text-center mb-4 line-clamp-2">
                  {ferramenta.nome}
                </h3>
                <div className="flex justify-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {ferramenta.categoria}
                  </Badge>
                  {ferramenta.gratuito && (
                    <Badge variant="secondary" className="text-xs">
                      Gratuita
                    </Badge>
                  )}
                </div>

                {/* Objetivo */}
                <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2 flex-grow">
                  {ferramenta.objetivo}
                </p>

                {/* Avaliações */}
                <div className="space-y-2 mb-4">
                  {/* Avaliação Mari */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">Avaliação Mari</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">{ferramenta.avaliacao_mari || 0}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </div>

                  {/* Avaliação Comunidade */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium">Comunidade</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">
                        {ferramenta.avaliacao_comunidade?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({ferramenta.total_avaliacoes_comunidade || 0})
                      </span>
                    </div>
                  </div>

                  {/* Pontuação Total */}
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2 border border-primary/20">
                    <span className="text-xs font-medium">Pontuação Total</span>
                    <span className="font-bold text-lg text-primary">
                      {pontuacao.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => onVerMais(ferramenta)}
                  >
                    Ver Detalhes
                  </Button>
                  {ferramenta.link_ferramenta && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={ferramenta.link_ferramenta}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
