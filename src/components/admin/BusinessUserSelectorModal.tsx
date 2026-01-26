import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Building2, User } from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BusinessUserSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string, userName: string) => void;
}

export function BusinessUserSelectorModal({ open, onClose, onSelect }: BusinessUserSelectorModalProps) {
  const { data: allUsers, isLoading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar apenas usuários business
  const businessUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(user => user.plano_mentoria === 'business');
  }, [allUsers]);

  // Filtrar por termo de busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return businessUsers;
    
    const term = searchTerm.toLowerCase();
    return businessUsers.filter(user => 
      user.nome_completo?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  }, [businessUsers, searchTerm]);

  const getInitials = (nome?: string | null, email?: string | null) => {
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

  const handleSelect = (user: typeof businessUsers[0]) => {
    const displayName = user.nome_completo || user.email || 'Usuário';
    onSelect(user.id, displayName);
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Selecionar Mentorado Business
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {businessUsers.length === 0 
                  ? "Nenhum mentorado Business encontrado"
                  : "Nenhum resultado para a busca"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.nome_completo, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.nome_completo || 'Sem nome'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
