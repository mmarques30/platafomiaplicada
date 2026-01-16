import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BonusMentoria, PublicoAlvo, getArquivoUrls } from "@/hooks/useMentoriaBonus";
import { FileText, Loader2, X, Plus, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type UsuarioElegivel = {
  user_id: string;
  liberado: boolean;
  nome_completo?: string;
};

type BonusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<BonusMentoria> & { usuarios_elegiveis?: UsuarioElegivel[] }) => void;
  bonus?: BonusMentoria;
  userId?: string;
  isLoading?: boolean;
  isGlobal?: boolean;
  users?: Array<{ id: string; nome_completo: string }>;
};

type FormData = {
  nome: string;
  descricao: string;
  link?: string;
  comando_uso?: string;
  condicao_tipo: 'preenchimento' | 'sorteio';
  condicao_descricao?: string;
  liberado: boolean;
};

const PUBLICO_ALVO_OPTIONS: { value: PublicoAlvo; label: string }[] = [
  { value: 'todos', label: 'Todos os mentorados' },
  { value: 'academy', label: 'Plano Academy' },
  { value: 'skills', label: 'Plano Skills' },
  { value: 'business', label: 'Plano Business' },
  { value: 'usuarios_especificos', label: 'Usuários específicos (liberação individual)' },
];

export default function BonusModal({
  open,
  onOpenChange,
  onSubmit,
  bonus,
  userId,
  isLoading,
  isGlobal = false,
  users = []
}: BonusModalProps) {
  const [uploading, setUploading] = useState(false);
  const [arquivoUrls, setArquivoUrls] = useState<string[]>([]);
  const [liberado, setLiberado] = useState(bonus?.liberado || false);
  const [condicaoTipo, setCondicaoTipo] = useState<'preenchimento' | 'sorteio'>(bonus?.condicao_tipo || 'preenchimento');
  const [publicoAlvo, setPublicoAlvo] = useState<PublicoAlvo>(bonus?.publico_alvo || (isGlobal ? 'todos' : 'usuario_especifico'));
  const [selectedUserId, setSelectedUserId] = useState<string>(bonus?.user_id || userId || '');
  
  // Multi-select users state
  const [usuariosElegiveis, setUsuariosElegiveis] = useState<UsuarioElegivel[]>([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: {
      nome: bonus?.nome || '',
      descricao: bonus?.descricao || '',
      link: bonus?.link || '',
      comando_uso: bonus?.comando_uso || '',
      condicao_tipo: bonus?.condicao_tipo || 'preenchimento',
      condicao_descricao: bonus?.condicao_descricao || '',
      liberado: bonus?.liberado || false
    }
  });

  useEffect(() => {
    if (bonus) {
      reset({
        nome: bonus.nome,
        descricao: bonus.descricao,
        link: bonus.link || '',
        comando_uso: bonus.comando_uso || '',
        condicao_tipo: bonus.condicao_tipo,
        condicao_descricao: bonus.condicao_descricao || '',
        liberado: bonus.liberado
      });
      setArquivoUrls(getArquivoUrls(bonus.arquivo_url));
      setLiberado(bonus.liberado);
      setCondicaoTipo(bonus.condicao_tipo);
      setPublicoAlvo(bonus.publico_alvo || 'usuario_especifico');
      setSelectedUserId(bonus.user_id || '');
      
      // Carregar usuários elegíveis se for usuarios_especificos
      if (bonus.publico_alvo === 'usuarios_especificos' && bonus.usuarios_elegiveis) {
        setUsuariosElegiveis(
          bonus.usuarios_elegiveis.map(u => ({
            user_id: u.user_id,
            liberado: u.liberado,
            nome_completo: u.user?.nome_completo
          }))
        );
      } else {
        setUsuariosElegiveis([]);
      }
    } else {
      reset({
        nome: '',
        descricao: '',
        link: '',
        comando_uso: '',
        condicao_tipo: 'preenchimento',
        condicao_descricao: '',
        liberado: false
      });
      setArquivoUrls([]);
      setLiberado(false);
      setCondicaoTipo('preenchimento');
      setPublicoAlvo(isGlobal ? 'todos' : 'usuario_especifico');
      setSelectedUserId(userId || '');
      setUsuariosElegiveis([]);
    }
  }, [bonus, reset, open, isGlobal, userId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const uploadId = selectedUserId || userId || 'global';
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uploadId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bonus-mentoria')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from('bonus-mentoria')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);

      if (data?.signedUrl) {
        setArquivoUrls(prev => [...prev, data.signedUrl]);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setArquivoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getFileName = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      const decoded = decodeURIComponent(fileName);
      const ext = decoded.split('.').pop()?.toUpperCase() || 'DOC';
      return `Documento ${ext}`;
    } catch {
      return 'Documento';
    }
  };

  // Add user to eligible list
  const addUsuarioElegivel = (user: { id: string; nome_completo: string }) => {
    if (!usuariosElegiveis.find(u => u.user_id === user.id)) {
      setUsuariosElegiveis(prev => [...prev, {
        user_id: user.id,
        liberado: false,
        nome_completo: user.nome_completo
      }]);
    }
    setUserSearchOpen(false);
  };

  // Remove user from eligible list
  const removeUsuarioElegivel = (userId: string) => {
    setUsuariosElegiveis(prev => prev.filter(u => u.user_id !== userId));
  };

  // Toggle user liberation
  const toggleUsuarioLiberado = (userId: string) => {
    setUsuariosElegiveis(prev => prev.map(u => 
      u.user_id === userId ? { ...u, liberado: !u.liberado } : u
    ));
  };

  const handleFormSubmit = (data: FormData) => {
    const submitData: Partial<BonusMentoria> & { usuarios_elegiveis?: UsuarioElegivel[] } = {
      ...data,
      condicao_tipo: condicaoTipo,
      liberado: publicoAlvo === 'usuarios_especificos' ? false : liberado,
      arquivo_url: arquivoUrls as any,
      publico_alvo: publicoAlvo,
      user_id: publicoAlvo === 'usuario_especifico' ? selectedUserId : null
    };

    // Adicionar usuários elegíveis se for usuarios_especificos
    if (publicoAlvo === 'usuarios_especificos') {
      submitData.usuarios_elegiveis = usuariosElegiveis;
    }

    onSubmit(submitData);
    reset();
    onOpenChange(false);
  };

  const availableUsers = users.filter(u => !usuariosElegiveis.find(e => e.user_id === u.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bonus ? "Editar Bônus" : "Novo Bônus"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              {...register("nome", { required: true })}
              placeholder="Ex: Kit Dashboards Express"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...register("descricao", { required: true })}
              placeholder="Descreva o que é este bônus"
              rows={3}
            />
          </div>

          {/* Público-alvo (apenas em modo global) */}
          {isGlobal && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div>
                <Label>Público-alvo *</Label>
                <Select
                  value={publicoAlvo}
                  onValueChange={(v) => {
                    setPublicoAlvo(v as PublicoAlvo);
                    if (v !== 'usuarios_especificos') {
                      setUsuariosElegiveis([]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLICO_ALVO_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {publicoAlvo === 'usuarios_especificos' 
                    ? 'Selecione usuários específicos e libere individualmente'
                    : 'Define quem poderá ver este bônus quando liberado'}
                </p>
              </div>

              {/* Multi-select de usuários específicos */}
              {publicoAlvo === 'usuarios_especificos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Usuários Elegíveis</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUserSearchOpen(!userSearchOpen)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Lista de seleção de usuários */}
                  {userSearchOpen && (
                    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                      {availableUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Todos os usuários já foram adicionados
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {availableUsers.map(user => (
                            <Button
                              key={user.id}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => addUsuarioElegivel(user)}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              {user.nome_completo}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lista de usuários elegíveis com toggle */}
                  {usuariosElegiveis.length > 0 ? (
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {usuariosElegiveis.map(u => {
                          const userName = u.nome_completo || users.find(usr => usr.id === u.user_id)?.nome_completo || 'Usuário';
                          return (
                            <div 
                              key={u.user_id} 
                              className={`flex items-center justify-between p-2 rounded-lg border ${
                                u.liberado ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-muted/50'
                              }`}
                            >
                              <span className="text-sm font-medium">{userName}</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant={u.liberado ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleUsuarioLiberado(u.user_id)}
                                  className="h-7 px-2"
                                >
                                  {u.liberado ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Liberado
                                    </>
                                  ) : (
                                    'Liberar'
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUsuarioElegivel(u.user_id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                      Nenhum usuário adicionado. Clique em "Adicionar" para selecionar.
                    </p>
                  )}

                  {usuariosElegiveis.length > 0 && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        {usuariosElegiveis.length} usuário(s)
                      </Badge>
                      <Badge variant="default" className="bg-green-600">
                        {usuariosElegiveis.filter(u => u.liberado).length} liberado(s)
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Condição *</Label>
              <Select
                value={condicaoTipo}
                onValueChange={(v) => setCondicaoTipo(v as 'preenchimento' | 'sorteio')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preenchimento">Preenchimento</SelectItem>
                  <SelectItem value="sorteio">Sorteio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condicao_descricao">Descrição da Condição</Label>
              <Input
                id="condicao_descricao"
                {...register("condicao_descricao")}
                placeholder={condicaoTipo === 'preenchimento' 
                  ? "Ex: Preencher formulário Aplica" 
                  : "Ex: Sorteio mensal de dezembro"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="link">Link do Bônus</Label>
            <Input
              id="link"
              {...register("link")}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Documentos Anexos</Label>
            <div className="mt-2 space-y-2">
              {arquivoUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{getFileName(url)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Enviando..." : arquivoUrls.length > 0 ? "Adicionar outro documento" : "Clique para anexar documento"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.zip,.html,.htm"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, DOC, DOCX, TXT, ZIP, HTML
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="comando_uso">Comando de Uso</Label>
            <Textarea
              id="comando_uso"
              {...register("comando_uso")}
              placeholder="Instruções de como usar o bônus, prompt para colar, etc."
              rows={4}
            />
          </div>

          {/* Status liberado (não mostrar para usuarios_especificos) */}
          {publicoAlvo !== 'usuarios_especificos' && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="liberado" className="text-base font-medium">Status: Liberado</Label>
                <p className="text-sm text-muted-foreground">
                  {liberado 
                    ? 'Os mentorados podem acessar este bônus' 
                    : 'Os mentorados verão este bônus bloqueado'}
                </p>
              </div>
              <Switch
                id="liberado"
                checked={liberado}
                onCheckedChange={setLiberado}
              />
            </div>
          )}

          {publicoAlvo === 'usuarios_especificos' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A liberação é individual para cada usuário. Use os botões "Liberar" ao lado de cada nome.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={
                isLoading || 
                uploading || 
                (publicoAlvo === 'usuarios_especificos' && usuariosElegiveis.length === 0)
              }
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
