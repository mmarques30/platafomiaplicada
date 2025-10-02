import { useState } from "react";
import { Bell, ChevronDown, BookOpen, Star, MessageSquare, Search, Settings, User, LogOut, Sparkles, Wrench, FileText, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import logoAplicada from "@/assets/logo-aplicada.png";
import { useLocation } from "react-router-dom";
import { CommandSearch } from "@/components/shared/CommandSearch";

export function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Detectar rotas ativas para dropdowns
  const isCursosActive = ['/trilhas', '/mentoria'].some(path => location.pathname.startsWith(path));
  const isFerramentasActive = ['/ia-copie-use', '/biblioteca-ferramentas', '/biblioteca-prompts', '/metodos-aplicar', '/newsletter', '/busca', '/admin'].some(path => location.pathname.startsWith(path));

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      const { count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("lida", false);
      return count || 0;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  const getInitials = (email?: string | null, nome?: string | null) => {
    if (nome) {
      const names = nome.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return nome.substring(0, 2).toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* ESQUERDA: SidebarTrigger + Logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link to="/" className="flex items-center">
            <img src={logoAplicada} alt="Aplicada" className="h-16 w-auto" />
          </Link>
        </div>

        {/* CENTRO: Menu de Navegação Horizontal */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => cn(
              "text-sm font-medium smooth-transition",
              isActive ? "text-[#8B0A50]" : "text-white hover:text-[#8B0A50]"
            )}
          >
            Início
          </NavLink>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "text-sm font-medium h-auto p-0 smooth-transition hover:bg-transparent",
                  isCursosActive ? "text-[#8B0A50]" : "text-white hover:text-[#8B0A50]"
                )}
              >
                Meus Cursos
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 bg-popover border-border">
                <DropdownMenuItem asChild>
                  <Link to="/trilhas" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Aplicada Trilha
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mentoria" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Aplicada Mentoria
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "text-sm font-medium h-auto p-0 smooth-transition hover:bg-transparent",
                  isFerramentasActive ? "text-[#8B0A50]" : "text-white hover:text-[#8B0A50]"
                )}
              >
                Ferramentas
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 bg-popover border-border">
              <DropdownMenuItem asChild>
                <Link to="/ia-copie-use" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  IA "Copie e Use"
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/biblioteca-ferramentas" className="cursor-pointer">
                  <Wrench className="mr-2 h-4 w-4" />
                  Biblioteca de Ferramentas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/biblioteca-prompts" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Biblioteca de Prompts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/metodos-aplicar" className="cursor-pointer">
                  <Target className="mr-2 h-4 w-4" />
                  Métodos para Aplicar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => setSearchOpen(true)} className="cursor-pointer">
                <Search className="mr-2 h-4 w-4" />
                Buscar Conteúdo
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* DIREITA: Notificações + Avatar com Nome */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate("/notificacoes")}
          >
            <Bell className="h-5 w-5" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-foreground hover:text-primary h-auto px-2 py-1">
                <Avatar className="h-8 w-8 border-2 border-border">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user?.email, user?.user_metadata?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {user?.user_metadata?.nome_completo?.split(" ")[0] || "Usuário"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/configuracoes" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
