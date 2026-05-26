import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface WritePostInputProps {
  onClick: () => void;
}

export function WritePostInput({ onClick }: WritePostInputProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  return (
    <div
      className="border-b border-brand-hairline p-4 hover:bg-brand-cream/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={user?.user_metadata?.nome_completo || profile?.nome_completo}
          avatarUrl={profile?.avatar_url}
          size="md"
        />
        <div className="flex-1 pt-2">
          <span className="text-muted-foreground text-base">
            O que está acontecendo?
          </span>
        </div>
      </div>
    </div>
  );
}
