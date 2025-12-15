import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BonusMentoria, PublicoAlvo, getArquivoUrls, getPublicoAlvoLabel } from "@/hooks/useMentoriaBonus";
import { FileText, Loader2, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BonusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<BonusMentoria>) => void;
  bonus?: BonusMentoria;
  userId?: string;
  isLoading?: boolean;
  isGlobal?: boolean; // Nova prop para modo global
  users?: Array<{ id: string; nome_completo: string }>; // Lista de usuários para seleção
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
  { value: 'lab', label: 'Plano Lab' },
  { value: 'club', label: 'Plano Club' },
  { value: 'skills', label: 'Plano Skills' },
  { value: 'usuario_especifico', label: 'Usuário específico' },
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

      // Get signed URL for private bucket
      const { data } = await supabase.storage
        .from('bonus-mentoria')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

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

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      condicao_tipo: condicaoTipo,
      liberado,
      arquivo_url: arquivoUrls as any,
      publico_alvo: publicoAlvo,
      user_id: publicoAlvo === 'usuario_especifico' ? selectedUserId : null
    });
    reset();
    onOpenChange(false);
  };

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

          {/* Público-alvo (apenas em modo global ou ao editar bônus global) */}
          {(isGlobal || bonus?.publico_alvo !== 'usuario_especifico') && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div>
                <Label>Público-alvo *</Label>
                <Select
                  value={publicoAlvo}
                  onValueChange={(v) => setPublicoAlvo(v as PublicoAlvo)}
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
                  Define quem poderá ver este bônus quando liberado
                </p>
              </div>

              {/* Seletor de usuário específico */}
              {publicoAlvo === 'usuario_especifico' && (
                <div>
                  <Label>Usuário *</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um mentorado" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="liberado" className="text-base font-medium">Status: Liberado</Label>
              <p className="text-sm text-muted-foreground">
                {liberado 
                  ? `${publicoAlvo === 'usuario_especifico' ? 'O mentorado pode' : 'Os mentorados podem'} acessar este bônus` 
                  : `${publicoAlvo === 'usuario_especifico' ? 'O mentorado verá' : 'Os mentorados verão'} este bônus bloqueado`}
              </p>
            </div>
            <Switch
              id="liberado"
              checked={liberado}
              onCheckedChange={setLiberado}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || uploading || (publicoAlvo === 'usuario_especifico' && !selectedUserId)}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}