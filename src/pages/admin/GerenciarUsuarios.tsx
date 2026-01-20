import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, useDeleteUser, useUpdateOnboardingStatus } from "@/hooks/admin/useUsers";
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
import { Search, Edit, UserPlus, AlertCircle, Trash2, Upload, Mail, MessageCircle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { adminTheme } from "@/components/admin/adminTheme";

export default function GerenciarUsuários() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const updateOnboardingStatus = useUpdateOnboardingStatus();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<{ id: string; nome: string } | null>(null);

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "none" && user.roles.length === 0) ||
      user.roles.some(r => r === roleFilter);

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "mentorado":
        return "default";
      case "aluno_trilha":
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
          <Badge variant="secondary" className="text-xs">{filteredUsers?.length || 0}</Badge>
        </div>
        <div className="flex gap-2">
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
            <SelectItem value="none">Sem Role</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={adminTheme.tableContainer}>
        <Table>
          <TableHeader className={adminTheme.tableHeader}>
            <TableRow>
              <TableHead className={adminTheme.tableHeaderCell}>Nome</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Email</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Roles</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Plano</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Expira em</TableHead>
              <TableHead className={adminTheme.tableHeaderCell}>Cadastro</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} text-center`}>Email</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} text-center`}>WhatsApp</TableHead>
              <TableHead className={`${adminTheme.tableHeaderCell} text-right`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
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
                          : (user as any).plano_mentoria === "business"
                          ? "border-purple-500 text-purple-700"
                          : "border-gray-500 text-gray-700"
                      }`}
                    >
                      {(user as any).plano_mentoria === "academy" && "Academy"}
                      {(user as any).plano_mentoria === "skills" && "Skills"}
                      {(user as any).plano_mentoria === "business" && "Business"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-400 text-gray-600 text-xs">
                      Sem Plano
                    </Badge>
                  )}
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
