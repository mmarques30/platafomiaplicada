import { motion } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, FileText, Play, Video } from "lucide-react";

import { PageContainer } from "@/components/shared/PageContainer";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { itemCascata, listaCascata } from "@/lib/motion";
import { separarEncontros, useEncontros, type Encontro } from "@/hooks/useEncontros";

const ICONE_MATERIAL = {
  slide: FileText,
  planilha: FileText,
  documento: FileText,
  video: Video,
  link: FileText,
  outro: FileText,
} as const;

/** "hoje", "amanhã" ou a data por extenso. */
function quando(encontro: Encontro): string {
  if (!encontro.data_aula) return encontro.dia_semana ?? "a definir";
  const data = new Date(`${encontro.data_aula}T00:00:00`);
  if (isToday(data)) return "hoje";
  if (isTomorrow(data)) return "amanhã";
  return format(data, "d 'de' MMMM", { locale: ptBR });
}

function CartaoEncontro({ encontro, passado }: { encontro: Encontro; passado: boolean }) {
  return (
    <motion.article
      variants={itemCascata}
      className="space-y-4 rounded-card border border-border bg-card p-4 shadow-card md:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="rotulo-mono">
            {quando(encontro)}
            {encontro.horario ? ` · ${encontro.horario}` : ""}
          </span>
          <h3 className="titulo-bloco text-lg text-foreground">{encontro.tema}</h3>
        </div>
        {!passado && encontro.link_reuniao && (
          <Button asChild size="sm" className="cta-lime">
            <a href={encontro.link_reuniao} target="_blank" rel="noreferrer">
              Entrar no encontro
            </a>
          </Button>
        )}
        {passado && encontro.gravacao_url && (
          <Button asChild size="sm" variant="outline">
            <a href={encontro.gravacao_url} target="_blank" rel="noreferrer">
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
              Ver gravação
            </a>
          </Button>
        )}
      </header>

      {(encontro.resumo || encontro.descricao) && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {passado ? encontro.resumo || encontro.descricao : encontro.descricao}
        </p>
      )}

      {encontro.speakers.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <span className="rotulo-mono">Quem fala</span>
          <ul className="flex flex-wrap gap-4">
            {encontro.speakers.map((speaker) => (
              <li key={speaker.id} className="flex items-center gap-2.5">
                <UserAvatar name={speaker.nome} avatarUrl={speaker.foto_url} size="sm" />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">{speaker.nome}</p>
                  {(speaker.papel || speaker.empresa) && (
                    <p className="text-xs text-muted-foreground">
                      {[speaker.papel, speaker.empresa].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {encontro.materiais.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <span className="rotulo-mono">Material</span>
          <ul className="space-y-1.5">
            {encontro.materiais.map((material) => {
              const Icone = ICONE_MATERIAL[material.tipo] ?? FileText;
              return (
                <li key={material.id}>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-2 text-sm text-foreground/85 transition-colors hover:text-primary"
                  >
                    <Icone className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                    <span>
                      {material.titulo}
                      {material.descricao && (
                        <span className="block text-xs text-muted-foreground">
                          {material.descricao}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </motion.article>
  );
}

function Secao({
  rotulo,
  encontros,
  passado,
  vazio,
}: {
  rotulo: string;
  encontros: Encontro[];
  passado: boolean;
  vazio: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="rotulo-mono">{rotulo}</h2>
      {encontros.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">{vazio}</p>
        </div>
      ) : (
        <motion.div
          variants={listaCascata}
          initial="inicial"
          animate="ativo"
          className="space-y-3"
        >
          {encontros.map((encontro) => (
            <CartaoEncontro key={encontro.id} encontro={encontro} passado={passado} />
          ))}
        </motion.div>
      )}
    </section>
  );
}

/**
 * Encontros Insider: o que vem, quem fala e o que ficou de cada um.
 *
 * Lê de `aulas_semanais`, a mesma tabela que alimenta o "Próximo encontro
 * Insider" do painel, para os dois nunca discordarem.
 */
export default function Encontros() {
  const { data: encontros = [], isLoading } = useEncontros();
  const { agendados, realizados } = separarEncontros(encontros);

  return (
    <PageContainer>
      <PageTitle
        primary="Encontros"
        secondary="Insider"
        icon={<CalendarDays className="h-6 w-6" strokeWidth={1.5} />}
        description="A agenda dos encontros ao vivo, quem fala em cada um e o material que ficou. As gravações entram aqui depois que o encontro acontece."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-skeleton-pulse rounded-card bg-foreground/[0.05]" />
          ))}
        </div>
      ) : (
        <>
          <Secao
            rotulo="Na agenda"
            encontros={agendados}
            passado={false}
            vazio="Nenhum encontro marcado por enquanto. Assim que a próxima data sair, ela aparece aqui."
          />
          <Secao
            rotulo="Já aconteceram"
            encontros={realizados}
            passado
            vazio="O histórico começa depois do primeiro encontro."
          />
        </>
      )}
    </PageContainer>
  );
}
