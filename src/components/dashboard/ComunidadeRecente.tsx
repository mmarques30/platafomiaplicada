import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { UserAvatar } from "@/components/shared/UserAvatar";

const LIMITE = 3;

/** As últimas publicações da comunidade, só como chamariz para a página. */
export function ComunidadeRecente() {
  const { posts, isLoading } = useCommunityPosts();

  if (isLoading) {
    return <div className="h-[180px] animate-skeleton-pulse rounded-card bg-card" />;
  }

  const recentes = posts.slice(0, LIMITE);
  if (recentes.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="rotulo-mono">Comunidade</span>
        <Link
          to="/comunidade"
          className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-primary"
        >
          Abrir
        </Link>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border">
        {recentes.map((post) => (
          <li key={post.id} className="py-3 first:pt-0 last:pb-0">
            <Link to="/comunidade" className="group flex items-start gap-3">
              <UserAvatar
                name={post.profiles?.nome_completo}
                avatarUrl={post.profiles?.avatar_url}
                size="sm"
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {post.profiles?.nome_completo?.split(" ")[0] ?? "Alguém"}
                  <span className="font-normal text-muted-foreground"> publicou</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {post.title || post.content}
                </p>
                <span className="rotulo-mono mt-1 block">
                  {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
