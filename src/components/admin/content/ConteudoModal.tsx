import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, X, FileText, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useCreateConteudo,
  useUpdateConteudo,
  uploadMidia,
  type ConteudoDashboardAdmin,
  type ConteudoFormData,
  type TipoConteudo,
  type EstiloTexto,
} from "@/hooks/admin/useConteudosDashboardAdmin";

interface ConteudoModalProps {
  open: boolean;
  onClose: () => void;
  conteudo?: ConteudoDashboardAdmin | null;
}

export function ConteudoModal({ open, onClose, conteudo }: ConteudoModalProps) {
  const createConteudo = useCreateConteudo();
  const updateConteudo = useUpdateConteudo();
  const isEditing = !!conteudo;

  const [isUploading, setIsUploading] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [galeriaImagens, setGaleriaImagens] = useState<string[]>([]);
  const [estiloTexto, setEstiloTexto] = useState<EstiloTexto>({
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 'normal',
    textAlign: 'left',
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ConteudoFormData>({
    defaultValues: {
      tipo: 'newsletter',
      titulo: '',
      resumo: '',
      conteudo: '',
      link_externo: '',
      destaque: false,
      ativo: true,
      ordem: 0,
    },
  });

  const tipo = watch('tipo');
  const destaque = watch('destaque');
  const ativo = watch('ativo');

  useEffect(() => {
    if (conteudo) {
      reset({
        tipo: conteudo.tipo,
        titulo: conteudo.titulo,
        resumo: conteudo.resumo,
        conteudo: conteudo.conteudo || '',
        link_externo: conteudo.link_externo || '',
        destaque: conteudo.destaque,
        ativo: conteudo.ativo,
        ordem: conteudo.ordem,
        autor: conteudo.autor || '',
      });
      setImagemPreview(conteudo.imagem_url);
      setPdfFileName(conteudo.arquivo_pdf_url ? 'Arquivo anexado' : null);
      setGaleriaImagens(conteudo.galeria_imagens || []);
      setEstiloTexto(conteudo.estilo_texto || {
        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: 'normal',
        textAlign: 'left',
      });
    } else {
      reset({
        tipo: 'newsletter',
        titulo: '',
        resumo: '',
        conteudo: '',
        link_externo: '',
        destaque: false,
        ativo: true,
        ordem: 0,
      });
      setImagemPreview(null);
      setPdfFileName(null);
      setGaleriaImagens([]);
      setEstiloTexto({
        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: 'normal',
        textAlign: 'left',
      });
    }
  }, [conteudo, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMidia(file, 'imagem');
      setImagemPreview(url);
      setValue('imagem_url', url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMidia(file, 'pdf');
      setPdfFileName(file.name);
      setValue('arquivo_pdf_url', url);
      toast.success("PDF enviado com sucesso!");
    } catch (error) {
      console.error('Erro ao enviar PDF:', error);
      toast.error("Erro ao enviar PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGaleriaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMidia(file, 'imagem');
      setGaleriaImagens(prev => [...prev, url]);
      toast.success("Imagem adicionada à galeria!");
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const removeGaleriaImage = (index: number) => {
    setGaleriaImagens(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ConteudoFormData) => {
    const payload: ConteudoFormData = {
      ...data,
      imagem_url: imagemPreview || undefined,
      galeria_imagens: galeriaImagens,
      estilo_texto: estiloTexto,
    };

    try {
      if (isEditing && conteudo) {
        await updateConteudo.mutateAsync({ id: conteudo.id, data: payload });
      } else {
        await createConteudo.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Conteúdo' : 'Novo Conteúdo'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo e Título */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setValue('tipo', v as TipoConteudo)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="noticia">Notícia</SelectItem>
                    <SelectItem value="dica">Dica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Título *</Label>
                <Input
                  {...register('titulo', { required: 'Título é obrigatório' })}
                  placeholder="Título do conteúdo"
                />
                {errors.titulo && (
                  <p className="text-sm text-destructive">{errors.titulo.message}</p>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className="space-y-2">
              <Label>Resumo * (aparece na listagem)</Label>
              <Textarea
                {...register('resumo', { required: 'Resumo é obrigatório' })}
                placeholder="Breve descrição do conteúdo..."
                rows={2}
              />
              {errors.resumo && (
                <p className="text-sm text-destructive">{errors.resumo.message}</p>
              )}
            </div>

            {/* Conteúdo Completo */}
            <div className="space-y-2">
              <Label>Conteúdo Completo</Label>
              <Textarea
                {...register('conteudo')}
                placeholder="Conteúdo detalhado (suporta Markdown)..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Suporta formatação Markdown: **negrito**, *itálico*, # títulos, - listas
              </p>
            </div>

            <Separator />

            {/* Mídia */}
            <div className="space-y-4">
              <h3 className="font-semibold">Mídia</h3>

              {/* Imagem Principal */}
              <div className="space-y-2">
                <Label>Imagem Principal (Capa)</Label>
                <div className="flex items-center gap-4">
                  {imagemPreview ? (
                    <div className="relative">
                      <img
                        src={imagemPreview}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => {
                          setImagemPreview(null);
                          setValue('imagem_url', undefined);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-muted transition-colors">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">Escolher imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Galeria de Imagens */}
              <div className="space-y-2">
                <Label>Galeria de Imagens</Label>
                <div className="flex flex-wrap gap-2">
                  {galeriaImagens.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Galeria ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={() => removeGaleriaImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed rounded cursor-pointer hover:bg-muted transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleGaleriaUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* PDF Anexo */}
              <div className="space-y-2">
                <Label>Documento PDF</Label>
                <div className="flex items-center gap-4">
                  {pdfFileName ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{pdfFileName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          setPdfFileName(null);
                          setValue('arquivo_pdf_url', undefined);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Anexar PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handlePdfUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Estilo do Texto */}
            <div className="space-y-4">
              <h3 className="font-semibold">Estilo do Texto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tamanho da Fonte */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Tamanho da Fonte</Label>
                    <span className="text-sm text-muted-foreground">{estiloTexto.fontSize}px</span>
                  </div>
                  <Slider
                    value={[estiloTexto.fontSize]}
                    min={12}
                    max={24}
                    step={1}
                    onValueChange={([value]) => setEstiloTexto(prev => ({ ...prev, fontSize: value }))}
                  />
                </div>

                {/* Espaçamento entre Linhas */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Espaçamento de Linha</Label>
                    <span className="text-sm text-muted-foreground">{estiloTexto.lineHeight.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[estiloTexto.lineHeight * 10]}
                    min={10}
                    max={25}
                    step={1}
                    onValueChange={([value]) => setEstiloTexto(prev => ({ ...prev, lineHeight: value / 10 }))}
                  />
                </div>

                {/* Peso da Fonte */}
                <div className="space-y-2">
                  <Label>Peso da Fonte</Label>
                  <Select
                    value={estiloTexto.fontWeight}
                    onValueChange={(v) => setEstiloTexto(prev => ({ ...prev, fontWeight: v as EstiloTexto['fontWeight'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="bold">Negrito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alinhamento */}
                <div className="space-y-2">
                  <Label>Alinhamento</Label>
                  <ToggleGroup
                    type="single"
                    value={estiloTexto.textAlign}
                    onValueChange={(v) => v && setEstiloTexto(prev => ({ ...prev, textAlign: v as EstiloTexto['textAlign'] }))}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="left" aria-label="Esquerda">
                      Esq
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Centro">
                      Centro
                    </ToggleGroupItem>
                    <ToggleGroupItem value="justify" aria-label="Justificado">
                      Just
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            <Separator />

            {/* Configurações */}
            <div className="space-y-4">
              <h3 className="font-semibold">Configurações</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Externo</Label>
                  <Input
                    {...register('link_externo')}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Input
                    {...register('autor')}
                    placeholder="Nome do autor"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    {...register('ordem', { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={destaque}
                    onCheckedChange={(v) => setValue('destaque', v)}
                  />
                  <Label>Destaque</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={ativo}
                    onCheckedChange={(v) => setValue('ativo', v)}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createConteudo.isPending || updateConteudo.isPending || isUploading}
              >
                {isUploading ? 'Enviando...' : isEditing ? 'Salvar Alterações' : 'Criar Conteúdo'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
