import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sparkles, BookOpen, Video, CheckCircle, Package, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type EventoTimeline = {
  id: string;
  tipo: 'cadastro' | 'modulo' | 'sessao' | 'etapa' | 'entrega' | 'conquista';
  titulo: string;
  subtitulo?: string;
  data: string;
};

const CONFIG = {
  cadastro: { icon: Sparkles, color: '#AFC040' },
  modulo: { icon: BookOpen, color: '#2CBBA6' },
  sessao: { icon: Video, color: '#4A9FE0' },
  etapa: { icon: CheckCircle, color: '#AFC040' },
  entrega: { icon: Package, color: '#2CBBA6' },
  conquista: { icon: Trophy, color: '#E8A43C' },
} as const;

export default function MinhaHistoria() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["minha-historia", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const userId = user!.id;
      const eventos: EventoTimeline[] = [];

      const [profileRes, videosRes, sessoesRes, contratosRes, certificadosRes] = await Promise.all([
        supabase.from("profiles").select("created_at").eq("id", userId).single(),
        supabase.from("progresso_videos").select("id, created_at, video_id").eq("user_id", userId).eq("completado", true).order("created_at", { ascending: true }),
        supabase.from("sessoes_mentoria").select("id, titulo, data_sessao, status").eq("user_id", userId).eq("status", "realizada").order("data_sessao", { ascending: true }),
        supabase.from("contratos_business").select("id").eq("user_id", userId),
        supabase.from("certificados").select("id, titulo, data_emissao, created_at").eq("user_id", userId).eq("status", "emitido"),
      ]);

      // 1. Cadastro
      if (profileRes.data?.created_at) {
        eventos.push({
          id: "cadastro",
          tipo: "cadastro",
          titulo: "Você entrou na IAplicada",
          data: profileRes.data.created_at,
        });
      }

      // 2. Vídeos completados
      (videosRes.data || []).forEach((v) => {
        eventos.push({
          id: `video-${v.id}`,
          tipo: "modulo",
          titulo: "Aula concluída",
          subtitulo: `Vídeo completado`,
          data: v.created_at!,
        });
      });

      // 3. Sessões realizadas
      (sessoesRes.data || []).forEach((s) => {
        eventos.push({
          id: `sessao-${s.id}`,
          tipo: "sessao",
          titulo: s.titulo || "Sessão de mentoria",
          subtitulo: "Sessão realizada",
          data: s.data_sessao!,
        });
      });

      // 4 & 5. Etapas e entregas via contratos
      const contratoIds = (contratosRes.data || []).map((c) => c.id);
      if (contratoIds.length > 0) {
        const [etapasRes, entregasRes] = await Promise.all([
          supabase.from("etapas_business").select("id, titulo, data_conclusao, status").in("contrato_id", contratoIds).eq("status", "concluida"),
          supabase.from("entregas_business").select("id, titulo, updated_at, status").in("contrato_id", contratoIds).eq("status", "aprovada"),
        ]);

        (etapasRes.data || []).forEach((e) => {
          eventos.push({
            id: `etapa-${e.id}`,
            tipo: "etapa",
            titulo: e.titulo,
            subtitulo: "Etapa concluída",
            data: e.data_conclusao || e.id,
          });
        });

        (entregasRes.data || []).forEach((e) => {
          eventos.push({
            id: `entrega-${e.id}`,
            tipo: "entrega",
            titulo: e.titulo,
            subtitulo: "Entrega aprovada",
            data: e.updated_at!,
          });
        });
      }

      // 6. Certificados como conquistas
      (certificadosRes.data || []).forEach((c) => {
        eventos.push({
          id: `conquista-${c.id}`,
          tipo: "conquista",
          titulo: c.titulo,
          subtitulo: "Certificado emitido",
          data: c.data_emissao || c.created_at!,
        });
      });

      // Ordenar desc
      eventos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      return { eventos, dataCadastro: profileRes.data?.created_at };
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-6 mt-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const eventos = data?.eventos || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minha Trajetória</h1>
        <p className="text-muted-foreground mt-1">
          Tudo que você construiu desde que começou.
        </p>
        {data?.dataCadastro && (
          <p className="text-sm text-muted-foreground mt-1">
            Desde {format(new Date(data.dataCadastro), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        )}
      </div>

      {eventos.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Sua trajetória está apenas começando. Continue explorando!
        </p>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {eventos.map((evento) => {
              const cfg = CONFIG[evento.tipo];
              const Icon = cfg.icon;

              return (
                <div key={evento.id} className="relative flex items-start gap-4 pl-0">
                  {/* Marcador */}
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${cfg.color}20`, border: `2px solid ${cfg.color}` }}
                  >
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-lg border bg-card p-3 shadow-sm">
                    <p className="font-medium text-sm text-foreground">{evento.titulo}</p>
                    {evento.subtitulo && (
                      <p className="text-xs text-muted-foreground mt-0.5">{evento.subtitulo}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(evento.data), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
