import { useState } from "react";
import { useUsers, useDeleteUser, useImportUsersBatch, useUpdateOnboardingStatus } from "@/hooks/admin/useUsers";
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
import { Search, Edit, UserPlus, AlertCircle, Trash2, Upload, Mail, MessageCircle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function GerenciarUsuários() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const importUsersBatch = useImportUsersBatch();
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
      return <Badge variant="destructive">Inativo</Badge>;
    }
    
    if (expiracao && expiracao < now) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
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

  const handleImportAcademyNov2025 = () => {
    const academyUsers = [
      { email: "ana_ps26@hotmail.com", nomeCompleto: "Ana Paula De Souza", password: "aplica2025" },
      { email: "elilorocha@hotmail.com", nomeCompleto: "Elisangela Lo Rocha", password: "aplica2025" },
      { email: "wagner.sillva@outlook.com", nomeCompleto: "Wagner Sillva", password: "aplica2025" },
      { email: "renatoscher@gmail.com", nomeCompleto: "Renato Schervinski", password: "aplica2025" }
    ];

    importUsersBatch.mutate({
      users: academyUsers,
      planoMentoria: "academy",
      roles: ["aluno_trilha"]
    });
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Gerenciar Usuários</h1>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleImportAcademyNov2025}
            variant="outline"
            disabled={importUsersBatch.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importUsersBatch.isPending ? "Importando..." : "Importar Academy Nov/2025"}
          </Button>
          <Button onClick={() => setNovoUsuarioOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-center">✉️ Email</TableHead>
              <TableHead className="text-center">📱 Grupo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome_completo}</TableCell>
                <TableCell className="text-sm">
                  {(user as any).email || <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.length === 0 ? (
                      <Badge variant="outline">Sem role</Badge>
                    ) : (
                      user.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)}>
                          {getRoleLabel(role)}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(user as any).plano_mentoria ? (
                      <Badge 
                        variant="outline"
                        className={
                          (user as any).plano_mentoria === "academy"
                            ? "border-purple-500 text-purple-700"
                            : (user as any).plano_mentoria === "lab"
                            ? "border-blue-500 text-blue-700"
                            : (user as any).plano_mentoria === "skills"
                            ? "border-orange-500 text-orange-700"
                            : (user as any).plano_mentoria === "club" 
                            ? "border-green-500 text-green-700"
                            : (user as any).plano_mentoria === "boost"
                            ? "border-cyan-500 text-cyan-700"
                            : "border-gray-500 text-gray-700"
                        }
                      >
                        {(user as any).plano_mentoria === "academy" && "Academy"}
                        {(user as any).plano_mentoria === "lab" && "Lab"}
                        {(user as any).plano_mentoria === "skills" && "Skills"}
                        {(user as any).plano_mentoria === "club" && "Club"}
                        {(user as any).plano_mentoria === "boost" && "Boost"}
                        {(user as any).plano_mentoria === "legacy" && "Legacy"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                    {(user as any).origem_consultoria && (
                      <Badge 
                        variant="outline"
                        className="border-amber-500 text-amber-700 gap-1"
                        title={
                          (user as any).empresa_consultoria 
                            ? `Consultoria: ${(user as any).empresa_consultoria}` 
                            : "Acesso via Consultoria"
                        }
                      >
                        <Building2 className="h-3 w-3" />
                        Consult
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user)}
                </TableCell>
                <TableCell>
                  {(user as any).data_expiracao_acesso ? (
                    <div className="flex items-center gap-1">
                      {new Date((user as any).data_expiracao_acesso) < new Date() && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                      <span className="text-sm">
                        {format(new Date((user as any).data_expiracao_acesso), "dd/MM/yyyy")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem limite</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.created_at
                    ? format(new Date(user.created_at), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
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
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
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
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser({ id: user.id, nome: user.nome_completo })}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
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
