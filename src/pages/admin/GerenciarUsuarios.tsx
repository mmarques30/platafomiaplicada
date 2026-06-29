import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, useDeleteUser, useUpdateOnboardingStatus } from "@/hooks/admin/useUsers";
import { useUsersAuthProviders } from "@/hooks/admin/useUsersAuthProviders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NovoUsuarioModal } from "@/components/admin/NovoUsuarioModal";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { Search, Edit, UserPlus, AlertCircle, Trash2, Upload, Mail, MessageCircle, Users, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { exportUsersToCSV } from "@/lib/exportUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";
import { adminTheme } from "@/components/admin/adminTheme";

type SortField = "nome_completo" | "email" | "plano_mentoria" | "created_at" | "updated_at";
type SortDirection = "asc" | "desc";

export default function GerenciarUsuários() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const { data: authProviders } = useUsersAuthProviders();
  const deleteUser = useDeleteUser();
  const updateOnboardingStatus = useUpdateOnboardingStatus();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [planoFilter, setPlanoFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<{ id: string; nome: string } | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    const now = new Date();
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()));
      
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "none" && user.roles.length === 0) ||
        user.roles.some(r => r === roleFilter);

      const userPlano = (user as any).plano_mentoria;
      const matchesPlano =
        planoFilter === "all" ||
        (planoFilter === "none" && !userPlano) ||
        userPlano === planoFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const updatedAt = (user as any).updated_at ? new Date((user as any).updated_at) : null;
        const createdAt = user.created_at ? new Date(user.created_at) : null;
        const referenceDate = updatedAt || createdAt;
        
        if (dateFilter === "7d") {
          matchesDate = !!referenceDate && referenceDate >= subDays(now, 7);
        } else if (dateFilter === "30d") {
          matchesDate = !!referenceDate && referenceDate >= subDays(now, 30);
        } else if (dateFilter === "90d") {
          matchesDate = !!referenceDate && referenceDate >= subDays(now, 90);
        }
      }

      return matchesSearch && matchesRole && matchesPlano && matchesDate;
    });

    // Sort
    filtered.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortField) {
        case "nome_completo":
          valA = a.nome_completo.toLowerCase();
          valB = b.nome_completo.toLowerCase();
          break;
        case "email":
          valA = ((a as any).email || "").toLowerCase();
          valB = ((b as any).email || "").toLowerCase();
          break;
        case "plano_mentoria":
          valA = (a as any).plano_mentoria || "";
          valB = (b as any).plano_mentoria || "";
          break;
        case "created_at":
          valA = a.created_at ? new Date(a.created_at).getTime() : 0;
          valB = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        case "updated_at":
          valA = (a as any).updated_at ? new Date((a as any).updated_at).getTime() : 0;
          valB = (b as any).updated_at ? new Date((b as any).updated_at).getTime() : 0;
          break;
        default:
          valA = 0;
          valB = 0;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, search, roleFilter, planoFilter, dateFilter, sortField, sortDirection]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "mentorado":
        return "default";
      case "aluno_trilha":
        return "secondary";
      case "parceiros":
        return "outline" as const;
      case "equipe":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "mentorado":
        return "Mentorado";
      case "aluno_trilha":
        return "Aluno Trilha";
      case "parceiros":
        return "Parceiro";
      case "equipe":
        return "Equipe";
      default:
        return role;
    }
  };

  const getStatusBadge = (user: any) => {
    const now = new Date();
    const expiracao = user.data_expiracao_acesso ? new Date(user.data_expiracao_acesso) : null;
    
    if (!user.conta_ativa) {
      return <Badge variant="destructive" className="text-xs">Inativo</Badge>;
    }
    
    if (expiracao && expiracao < now) {
      return <Badge variant="destructive" className="text-xs">Expirado</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600 text-xs">Ativo</Badge>;
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUser.mutate(
        { userId: deletingUser.id },
        {
          onSuccess: () => {
            setDeletingUser(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className={adminTheme.page}>
        <div className={adminTheme.pageHeader}>
          <div className={adminTheme.pageTitleWrapper}>
            <Users className={adminTheme.pageIcon} />
            <h1 className={adminTheme.pageTitle}>Gerenciar Usuários</h1>
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageHeader}>
        <div className={adminTheme.pageTitleWrapper}>
          <Users className={adminTheme.pageIcon} />
          <h1 className={adminTheme.pageTitle}>Gerenciar Usuários</h1>
          <Badge variant="secondary" className="text-xs">{filteredAndSortedUsers.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => filteredAndSortedUsers.length > 0 && exportUsersToCSV(filteredAndSortedUsers as any)}
            variant="outline"
            size="sm"
            className={adminTheme.buttonSm}
            disabled={filteredAndSortedUsers.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar
          </Button>
          <Button 
            onClick={() => navigate('/admin/importar-usuarios')}
            variant="outline"
            size="sm"
            className={adminTheme.buttonSm}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Importar
          </Button>
          <Button onClick={() => setNovoUsuarioOpen(true)} size="sm" className={adminTheme.buttonSm}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className={adminTheme.filterBar}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${adminTheme.input}`}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className={adminTheme.filterSelect}>
            <SelectValue placeholder="Filtrar por role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="mentorado">Mentorado</SelectItem>
            <SelectItem value="aluno_trilha">Aluno Trilha</SelectItem>
            <SelectItem value="parceiros">Parceiro</SelectItem>
            <SelectItem value="equipe">Equipe</SelectItem>
            <SelectItem value="none">Sem Role</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planoFilter} onValueChange={setPlanoFilter}>
          <SelectTrigger className={adminTheme.filterSelect}>
            <SelectValue placeholder="Filtrar por plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Planos</SelectItem>
            <SelectItem value="academy">Academy</SelectItem>
            <SelectItem value="skills">Skills</SelectItem>
            <SelectItem value="business_parceria">Builder</SelectItem>
            <SelectItem value="business_sistemas">System</SelectItem>
            <SelectItem value="none">Sem Plano</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className={adminTheme.filterSelect}>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={adminTheme.tableContainer}>
        <Table>
          <TableHeader className={adminTheme.tableHeader}>
            <TableRow>
              <TableHead className={`${adminTheme.tableHeaderCell} cursor-pointer select-none`} onClick={() => handleSort("nome_completo")}>
                <span className="flex items-center">Nome{getSortIcon("nome_completo")}</span>
              </TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} cursor-pointer select-none`} onClick={() => handleSort("email")}>
                <span className="flex items-center">Email{getSortIcon("email")}</span>
              </TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Roles</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} cursor-pointer select-none`} onClick={() => handleSort("plano_mentoria")}>
                <span className="flex items-center">Plano{getSortIcon("plano_mentoria")}</span>
              </TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Login</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Expira em</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} cursor-pointer select-none`} onClick={() => handleSort("created_at")}>
                <span className="flex items-center">Cadastro{getSortIcon("created_at")}</span>
              </TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} cursor-pointer select-none`} onClick={() => handleSort("updated_at")}>
                <span className="flex items-center">Atualização{getSortIcon("updated_at")}</span>
              </TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} text-center`}>Email</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} text-center`}>WhatsApp</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} text-right`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id} className={adminTheme.tableRow}>
                <TableCell className={`${adminTheme.tableCell} font-medium`}>{user.nome_completo}</TableCell>
                <TableCell className={adminTheme.tableCell}>
                  {(user as any).email || <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.length === 0 ? (
                      <Badge variant="outline" className="text-xs">Sem role</Badge>
                    ) : (
                      user.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                          {getRoleLabel(role)}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                {(user as any).plano_mentoria ? (
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        (user as any).plano_mentoria === "academy"
                          ? "border-blue-500 text-blue-700"
                          : (user as any).plano_mentoria === "skills"
                          ? "border-orange-500 text-orange-700"
                          : (user as any).plano_mentoria === "business_parceria"
                          ? "border-purple-500 text-purple-700"
                          : (user as any).plano_mentoria === "business_sistemas"
                          ? "border-violet-500 text-violet-700"
                          : "border-gray-500 text-gray-700"
                      }`}
                    >
                      {(user as any).plano_mentoria === "academy" && "Academy"}
                      {(user as any).plano_mentoria === "skills" && "Skills"}
                      {(user as any).plano_mentoria === "business_parceria" && "Builder"}
                      {(user as any).plano_mentoria === "business_sistemas" && "System"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-400 text-gray-600 text-xs">
                      Sem Plano
                    </Badge>
                  )}
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  {(() => {
                    const provider = authProviders?.[user.id] || 'email';
                    if (provider === 'google') {
                      return (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs flex items-center gap-1 w-fit">
                          <svg className="h-3 w-3" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Badge>
                      );
                    }
                    return (
                      <Badge variant="outline" className="text-muted-foreground text-xs flex items-center gap-1 w-fit">
                        <Mail className="h-3 w-3" />
                        Email
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  {getStatusBadge(user)}
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  {(user as any).data_expiracao_acesso ? (
                    <div className="flex items-center gap-1">
                      {new Date((user as any).data_expiracao_acesso) < new Date() && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                      <span className="text-xs">
                        {format(new Date((user as any).data_expiracao_acesso), "dd/MM/yyyy")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Sem limite</span>
                  )}
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  <span className="text-xs">
                    {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy") : "-"}
                  </span>
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  <span className="text-xs">
                    {(user as any).updated_at ? format(new Date((user as any).updated_at), "dd/MM/yyyy") : "-"}
                  </span>
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  <div className="flex items-center justify-center gap-1">
                    <Switch
                      checked={(user as any).email_acesso_enviado || false}
                      onCheckedChange={(checked) => {
                        updateOnboardingStatus.mutate({
                          userId: user.id,
                          field: 'email_acesso_enviado',
                          value: checked
                        });
                      }}
                      disabled={updateOnboardingStatus.isPending}
                    />
                    {(user as any).email_acesso_enviado && (
                      <Mail className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className={adminTheme.tableCell}>
                  <div className="flex items-center justify-center gap-1">
                    <Switch
                      checked={(user as any).adicionado_grupo_whatsapp || false}
                      onCheckedChange={(checked) => {
                        updateOnboardingStatus.mutate({
                          userId: user.id,
                          field: 'adicionado_grupo_whatsapp',
                          value: checked
                        });
                      }}
                      disabled={updateOnboardingStatus.isPending}
                    />
                    {(user as any).adicionado_grupo_whatsapp && (
                      <MessageCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className={`${adminTheme.tableCell} text-right`}>
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={adminTheme.buttonIcon}
                      onClick={() => setEditingUser({
                        ...user,
                        email: (user as any).email,
                        profissao: (user as any).profissao,
                        idade: (user as any).idade,
                        linkedin: (user as any).linkedin,
                        plano_mentoria: (user as any).plano_mentoria,
                        data_expiracao_acesso: (user as any).data_expiracao_acesso,
                        conta_ativa: (user as any).conta_ativa,
                      })}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${adminTheme.buttonIcon} text-destructive hover:text-destructive hover:bg-destructive/10`}
                      onClick={() => setDeletingUser({ id: user.id, nome: user.nome_completo })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NovoUsuarioModal
        open={novoUsuarioOpen}
        onOpenChange={setNovoUsuarioOpen}
      />

      {editingUser && (
        <EditUserModal
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onConfirm={handleDeleteUser}
          userName={deletingUser.nome}
        />
      )}
    </div>
  );
}
