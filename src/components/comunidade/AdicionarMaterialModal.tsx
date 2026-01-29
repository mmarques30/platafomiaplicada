import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useMaterialComunidadeSubmit } from "@/hooks/useMaterialComunidadeSubmit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TIPOS = [
  { value: "prompt", label: "Prompt" },
  { value: "imagem", label: "Imagem" },
  { value: "documento", label: "Documento" },
  { value: "template", label: "Template" },
  { value: "outro", label: "Outro" },
];

const CATEGORIAS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "midjourney", label: "Midjourney" },
  { value: "canva", label: "Canva" },
  { value: "notion", label: "Notion" },
  { value: "excel", label: "Excel" },
  { value: "outro", label: "Outro" },
];

const ALLOWED_EXTENSIONS = ["pdf", "pptx", "docx", "txt", "md"];

interface AdicionarMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdicionarMaterialModal({ open, onOpenChange }: AdicionarMaterialModalProps) {
  const { user } = useAuth();
  const { createMaterial, uploadFile, isSubmitting } = useMaterialComunidadeSubmit();

  // Buscar profile do usuário
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("nome_completo, avatar_url")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && ALLOWED_EXTENSIONS.includes(ext)) {
        validFiles.push(file);
      } else {
        toast.error(`Formato não suportado: ${file.name}`);
      }
    });

    setArquivos((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.error("Informe o nome da ferramenta");
      return;
    }
    if (!tipo) {
      toast.error("Selecione o tipo");
      return;
    }
    if (!categoria) {
      toast.error("Selecione a categoria");
      return;
    }

    try {
      setIsUploading(true);

      // Upload dos arquivos
      const uploadedUrls: string[] = [];
      for (const file of arquivos) {
        const url = await uploadFile(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      // Criar o material
      await createMaterial.mutateAsync({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        tipo,
        categoria,
        conteudo_texto: conteudoTexto.trim() || null,
        arquivos_url: uploadedUrls,
      });

      // Reset form
      setTitulo("");
      setDescricao("");
      setTipo("");
      setCategoria("");
      setConteudoTexto("");
      setArquivos([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isSubmitting || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(profile?.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <span>Contribuir com a Comunidade</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Nome da Ferramenta *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Gerador de Headlines para LinkedIn"
              disabled={isLoading}
            />
          </div>

          {/* Categoria e Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição do que a ferramenta faz..."
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Prompt/Orientação */}
          <div className="space-y-2">
            <Label htmlFor="conteudo">Prompt ou Orientação</Label>
            <Textarea
              id="conteudo"
              value={conteudoTexto}
              onChange={(e) => setConteudoTexto(e.target.value)}
              placeholder="Cole aqui o prompt ou as instruções para replicar a ferramenta..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Upload de arquivos */}
          <div className="space-y-2">
            <Label>Arquivos (PDF, PPTX, DOCX, TXT, MD)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".pdf,.pptx,.docx,.txt,.md"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm">Clique para adicionar arquivos</span>
              </label>
            </div>

            {/* Lista de arquivos */}
            {arquivos.length > 0 && (
              <div className="space-y-2 mt-2">
                {arquivos.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeFile(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info de moderação */}
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            Seu material será enviado para aprovação antes de aparecer na comunidade.
          </p>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar para Aprovação"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
