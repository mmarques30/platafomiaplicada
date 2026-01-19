import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUpdateUserRoles } from "@/hooks/admin/useUsers";

type AppRole = "admin" | "mentorado" | "aluno_trilha" | "equipe";

interface UserRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentRoles: string[];
}

const AVAILABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "equipe", label: "Equipe" },
  { value: "mentorado", label: "Mentorado" },
  { value: "aluno_trilha", label: "Aluno Trilha" },
];

export function UserRoleModal({
  open,
  onOpenChange,
  userId,
  userName,
  currentRoles,
}: UserRoleModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>(currentRoles as AppRole[]);
  const updateRoles = useUpdateUserRoles();

  const toggleRole = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = () => {
    updateRoles.mutate(
      { userId, roles: selectedRoles },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Roles - {userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {AVAILABLE_ROLES.map((role) => (
            <div key={role.value} className="flex items-center space-x-2">
              <Checkbox
                id={role.value}
                checked={selectedRoles.includes(role.value)}
                onCheckedChange={() => toggleRole(role.value)}
              />
              <Label htmlFor={role.value} className="cursor-pointer">
                {role.label}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateRoles.isPending}>
            {updateRoles.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
