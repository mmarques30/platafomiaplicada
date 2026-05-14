import { useEffect, useRef } from "react";
import { useAvisosPublicos, useMarcarAvisosComoLidos } from "@/hooks/useAvisosPublicos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Video, FileText, Bot, Wrench, BookOpen, Target, Lightbulb, FileDown, Newspaper, Megaphone, Star, Users, Zap, CircleDot } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTitle } from "@/components/shared/PageTitle";

const getBarColor = (tipo: string | null | undefined): string => {
  switch (tipo) {
    case "urgente":
    case "critico":
    case "atrasado":
    case "alerta":
    case "prazo":
      return "#E8684A";
    case "importante":
    case "entrega":
    case "tarefa":
      return "#E8A43C";
    case "informativo":
    case "sessao":
      return "#4A9FE0";
    case "conquista":
    case "certificado":
      return "#AFC040";
    default:
      return "#2CBBA6";
  }
};

const removeEmojis = (text: string): string =>
  text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "").trim();

const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  "vídeos": <Video className="h-4 w-4 text-primary shrink-0" />,
  "prompts": <FileText className="h-4 w-4 text-primary shrink-0" />,
  "ia copie e use": <Bot className="h-4 w-4 text-primary shrink-0" />,
  "ferramentas de ia": <Wrench className="h-4 w-4 text-primary shrink-0" />,
  "ferramentas": <Wrench className="h-4 w-4 text-primary shrink-0" />,
  "módulos": <BookOpen className="h-4 w-4 text-primary shrink-0" />,
  "trilhas": <Target className="h-4 w-4 text-primary shrink-0" />,
  "métodos para aplicar": <Lightbulb className="h-4 w-4 text-primary shrink-0" />,
  "materiais gratuitos": <FileDown className="h-4 w-4 text-primary shrink-0" />,
  "materiais da central": <FileDown className="h-4 w-4 text-primary shrink-0" />,
  "newsletters": <Newspaper className="h-4 w-4 text-primary shrink-0" />,
  "notícias": <Megaphone className="h-4 w-4 text-primary shrink-0" />,
  "dicas": <Lightbulb className="h-4 w-4 text-primary shrink-0" />,
  "criadores de conteúdo": <Users className="h-4 w-4 text-primary shrink-0" />,
  "destaques": <Star className="h-4 w-4 text-primary shrink-0" />,
  "novidades": <Star className="h-4 w-4 text-primary shrink-0" />,
  "atualizações": <Zap className="h-4 w-4 text-primary shrink-0" />,
  "melhorias da plataforma": <Zap className="h-4 w-4 text-primary shrink-0" />,
  "conteúdos": <BookOpen className="h-4 w-4 text-primary shrink-0" />,
  "eventos": <Target className="h-4 w-4 text-primary shrink-0" />,
  "aulas semanais": <Video className="h-4 w-4 text-primary shrink-0" />,
  "conteúdos do dashboard": <BookOpen className="h-4 w-4 text-primary shrink-0" />,
};

const getIconForHeader = (cleanText: string): React.ReactNode => {
  const lower = cleanText.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORIA_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <CircleDot className="h-4 w-4 text-primary shrink-0" />;
};

const renderWithBold = (text: string) => {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  );
};

const formatarMensagem = (texto: string) => {
  const linhas = texto.split('\n');
  return linhas.map((linha, index) => {
    const trimmed = linha.trim();
    if (!trimmed) return <div key={index} className="h-3" />;

    const cleanLine = removeEmojis(trimmed).replace(/:$/, '').trim();

    const isHeader = Object.keys(CATEGORIA_ICONS).some(
      (cat) => cleanLine.toLowerCase().includes(cat)
    ) || (trimmed.endsWith(':') && trimmed.length < 60 && !trimmed.startsWith('•') && !trimmed.startsWith('-'));

    if (isHeader) {
      const icon = getIconForHeader(cleanLine);
      return (
        <div key={index} className="flex items-center gap-2 mt-4 mb-1.5">
          {icon}
          <h4 className="font-semibold text-foreground text-[15px]">
            {renderWithBold(removeEmojis(trimmed))}
          </h4>
        </div>
      );
    }

    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('–');

    if (isBullet) {
      const content = trimmed.replace(/^[•\-–]\s*/, '');
      return (
        <div key={index} className="flex items-start gap-2 pl-1">
          <CircleDot className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
          <p className="text-sm text-muted-foreground">{renderWithBold(removeEmojis(content))}</p>
        </div>
      );
    }

    return (
      <p key={index} className="text-sm text-muted-foreground">
        {renderWithBold(removeEmojis(trimmed))}
      </p>
    );
  });
};
export default function Notificacoes() {
  const { data: avisos, isLoading } = useAvisosPublicos();
  const { mutate: marcarComoLidos } = useMarcarAvisosComoLidos();
  const marcadoRef = useRef(false);

  useEffect(() => {
    if (avisos && avisos.length > 0 && !marcadoRef.current) {
      const ids = avisos.map(a => a.id);
      marcarComoLidos(ids);
      marcadoRef.current = true;
    }
  }, [avisos, marcarComoLidos]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 md:mb-8">
        <PageTitle primary="Avisos" icon={<Bell className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />} />
        <p className="text-sm md:text-base text-muted-foreground mt-2">Acompanhe os avisos e comunicados da plataforma</p>
      </div>

      <div className="space-y-4">
        {!avisos || avisos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum aviso ativo</h3>
              <p className="text-muted-foreground">Não há avisos publicados no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {avisos.map((aviso) => (
              <Card key={aviso.id} className="relative overflow-hidden border-primary/30 bg-primary/5">
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{ width: 3, backgroundColor: getBarColor(aviso.tipo) }}
                />
                <CardHeader className="pl-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{removeEmojis(aviso.titulo)}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(aviso.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        aviso.tipo === "urgente" 
                          ? "bg-red-500/10 text-red-600 border-red-500/20" 
                          : aviso.tipo === "importante"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {aviso.tipo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pl-5">
                  <div className="text-sm space-y-0.5">{formatarMensagem(aviso.mensagem)}</div>
                  {aviso.data_expiracao && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Válido até: {new Date(aviso.data_expiracao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}