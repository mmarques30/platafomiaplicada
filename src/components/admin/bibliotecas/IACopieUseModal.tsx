import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateIACopieUse, useUpdateIACopieUse } from "@/hooks/admin/useBibliotecas";
import { FerramentasSelector } from "./FerramentasSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, FileText, Image, Table, FileCode, Upload, Plus, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IA_COPIE_USE_CATEGORIAS } from "@/lib/iaCopieUseCategories";

interface IACopieUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
}

// Helper to get file icon based on extension
const getFileIcon = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="h-4 w-4" />;
    case 'csv':
    case 'xlsx':
    case 'xls':
      return <Table className="h-4 w-4" />;
    case 'html':
    case 'htm':
      return <FileCode className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Helper to extract filename from URL
const getFileName = (url: string) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  // Remove UUID prefix if present
  const cleanName = filename.replace(/^[a-f0-9-]{36}_/, '');
  return decodeURIComponent(cleanName);
};

// Helper to normalize arquivos_url to array
const getArquivoUrls = (arquivosUrl: any): string[] => {
  if (!arquivosUrl) return [];
  if (Array.isArray(arquivosUrl)) return arquivosUrl;
  if (typeof arquivosUrl === 'string') return [arquivosUrl];
  return [];
};

// Helper to normalize links_url to array
const getLinksUrls = (linksUrl: any): string[] => {
  if (!linksUrl) return [];
  if (Array.isArray(linksUrl)) return linksUrl;
  if (typeof linksUrl === 'string') return [linksUrl];
  return [];
};

export function IACopieUseModal({ open, onOpenChange, item }: IACopieUseModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [ferramentasRecomendadas, setFerramentasRecomendadas] = useState<string[]>([]);
  const [arquivoUrls, setArquivoUrls] = useState<string[]>([]);
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const createItem = useCreateIACopieUse();
  const updateItem = useUpdateIACopieUse();
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      reset(item);
      setFerramentasRecomendadas(item.ferramentas_recomendadas || []);
      setArquivoUrls(getArquivoUrls(item.arquivos_url));
      setLinkUrls(getLinksUrls(item.links_url));
    } else {
      reset({
        titulo: "",
        descricao: "",
        categoria: "",
        
        conteudo: "",
        ferramentas_recomendadas: [],
        arquivos_url: [],
        links_url: [],
        ativo: true,
      });
      setFerramentasRecomendadas([]);
      setArquivoUrls([]);
      setLinkUrls([]);
    }
  }, [item, reset]);

  const handleAddLink = () => {
    if (newLink.trim()) {
      let urlToAdd = newLink.trim();
      if (!urlToAdd.startsWith('http://') && !urlToAdd.startsWith('https://')) {
        urlToAdd = 'https://' + urlToAdd;
      }
      setLinkUrls(prev => [...prev, urlToAdd]);
      setNewLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinkUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = ['html', 'htm', 'pdf', 'csv', 'png', 'xlsx', 'xls', 'doc', 'docx', 'xml'];
        
        if (!fileExt || !allowedExts.includes(fileExt)) {
          toast({
            title: "Formato não suportado",
            description: `O arquivo ${file.name} não é suportado. Use HTML, PDF, CSV, PNG, XLSX, DOC, DOCX ou XML.`,
            variant: "destructive",
          });
          continue;
        }

        const fileName = `${crypto.randomUUID()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('ia-copie-use')
          .upload(fileName, file);

        if (uploadError) {
          toast({
            title: "Erro no upload",
            description: `Erro ao enviar ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from('ia-copie-use')
          .getPublicUrl(fileName);

        newUrls.push(publicUrl.publicUrl);
      }

      if (newUrls.length > 0) {
        setArquivoUrls(prev => [...prev, ...newUrls]);
        toast({
          title: "Upload concluído",
          description: `${newUrls.length} arquivo(s) enviado(s) com sucesso!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Erro inesperado ao enviar arquivos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveFile = async (urlToRemove: string) => {
    try {
      // Extract filename from URL
      const urlParts = urlToRemove.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage
        .from('ia-copie-use')
        .remove([fileName]);

      // Update state
      setArquivoUrls(prev => prev.filter(url => url !== urlToRemove));
      
      toast({
        title: "Arquivo removido",
        description: "Arquivo removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o arquivo",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: any) => {
    const itemData = {
      ...data,
      ferramentas_recomendadas: ferramentasRecomendadas,
      arquivos_url: arquivoUrls,
      links_url: linkUrls,
    };
    
    if (item) {
      updateItem.mutate(
        { id: item.id, values: itemData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createItem.mutate(itemData, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Editar" : "Novo"} Item IA Copie e Use</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" {...register("titulo", { required: true })} />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register("descricao", { required: true })} />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              defaultValue={item?.categoria || ""}
              onValueChange={(value) => setValue("categoria", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {IA_COPIE_USE_CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo (código/texto para copiar)</Label>
            <Textarea id="conteudo" {...register("conteudo", { required: true })} rows={10} />
          </div>

          <FerramentasSelector
            value={ferramentasRecomendadas}
            onChange={setFerramentasRecomendadas}
          />

          {/* External Links Section */}
          <div className="space-y-3">
            <Label>Links Externos</Label>
            <div className="flex gap-2">
              <Input 
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://exemplo.com/recurso"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {linkUrls.length > 0 && (
              <div className="space-y-2">
                {linkUrls.map((url, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2 text-sm truncate flex-1">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span className="truncate">{url}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLink(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label>Arquivos Anexados (HTML, PDF, CSV, PNG, XLSX, DOC, DOCX, XML)</Label>
            
            {/* List of uploaded files */}
            {arquivoUrls.length > 0 && (
              <div className="space-y-2">
                {arquivoUrls.map((url, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2 text-sm truncate flex-1">
                      {getFileIcon(url)}
                      <span className="truncate">{getFileName(url)}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(url)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".html,.htm,.pdf,.csv,.png,.xlsx,.xls,.doc,.docx,.xml"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar arquivo
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              onCheckedChange={(checked) => setValue("ativo", checked)}
              defaultChecked={item?.ativo ?? true}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}