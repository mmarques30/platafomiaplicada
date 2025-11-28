import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface WritePostInputProps {
  onClick: () => void;
}

export function WritePostInput({ onClick }: WritePostInputProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Card 
      className="bg-card border-border hover:border-primary/20 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(user?.user_metadata?.nome_completo || "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-muted-foreground text-sm">
          Write something...
        </div>
      </div>
    </Card>
  );
}
