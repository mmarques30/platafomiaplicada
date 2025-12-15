import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BonusMentoria } from "@/hooks/useMentoriaBonus";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BonusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<BonusMentoria>) => void;
  bonus?: BonusMentoria;
  userId?: string;
  isLoading?: boolean;
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

export default function BonusModal({
  open,
  onOpenChange,
  onSubmit,
  bonus,
  userId,
  isLoading
}: BonusModalProps) {
  const [uploading, setUploading] = useState(false);
  const [arquivoUrl, setArquivoUrl] = useState<string | undefined>(bonus?.arquivo_url);
  const [liberado, setLiberado] = useState(bonus?.liberado || false);
  const [condicaoTipo, setCondicaoTipo] = useState<'preenchimento' | 'sorteio'>(bonus?.condicao_tipo || 'preenchimento');

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
      setArquivoUrl(bonus.arquivo_url);
      setLiberado(bonus.liberado);
      setCondicaoTipo(bonus.condicao_tipo);
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
      setArquivoUrl(undefined);
      setLiberado(false);
      setCondicaoTipo('preenchimento');
    }
  }, [bonus, reset, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bonus-mentoria')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL for private bucket
      const { data } = await supabase.storage
        .from('bonus-mentoria')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (data?.signedUrl) {
        setArquivoUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      condicao_tipo: condicaoTipo,
      liberado,
      arquivo_url: arquivoUrl,
      user_id: userId || bonus?.user_id
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
            <Label>Documento Anexo</Label>
            <div className="mt-2">
              {arquivoUrl ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1 truncate">Documento anexado</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setArquivoUrl(undefined)}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Enviando..." : "Clique para anexar documento"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.zip"
                    disabled={uploading}
                  />
                </label>
              )}
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
                  ? "O mentorado pode acessar este bônus" 
                  : "O mentorado verá este bônus bloqueado"}
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
            <Button type="submit" disabled={isLoading || uploading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
