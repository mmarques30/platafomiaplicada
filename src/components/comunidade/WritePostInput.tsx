import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

interface WritePostInputProps {
  onClick: () => void;
}

export function WritePostInput({ onClick }: WritePostInputProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div 
      className="border-b border-zinc-800 p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} />
          )}
          <AvatarFallback className="bg-[#9EB038] text-white text-sm">
            {getInitials(user?.user_metadata?.nome_completo || profile?.nome_completo || "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 pt-2">
          <span className="text-zinc-500 text-base">
            O que está acontecendo?
          </span>
        </div>
      </div>
    </div>
  );
}
