import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PenLine, Image as ImageIcon } from "lucide-react";

interface WritePostInputProps {
  onClick: () => void;
}

export function WritePostInput({ onClick }: WritePostInputProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  return (
    <div className="bg-brand-cream-soft border border-brand-hairline rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={user?.user_metadata?.nome_completo || profile?.nome_completo}
          avatarUrl={profile?.avatar_url}
          size="md"
        />
        <button
          type="button"
          onClick={onClick}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-background border border-brand-hairline text-muted-foreground hover:border-brand-strong/40 transition-colors text-sm"
        >
          Compartilhe algo com a comunidade…
        </button>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1.5 bg-brand-strong text-brand-cream rounded-full px-4 py-2 text-sm font-medium hover:bg-brand-strong/90 transition-colors shrink-0"
        >
          <PenLine className="h-4 w-4" />
          <span className="hidden sm:inline">Publicar</span>
        </button>
      </div>

      {/* Atalhos discretos */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-brand-hairline pl-[52px]">
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-strong transition-colors"
        >
          <ImageIcon className="h-4 w-4" />
          Imagem
        </button>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-strong transition-colors"
        >
          <PenLine className="h-4 w-4" />
          Texto
        </button>
      </div>
    </div>
  );
}
