import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMateriaisComunidadeAdmin, MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface MaterialCriadoresModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string | null;
}

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

export function MaterialCriadoresModal({ open, onOpenChange, materialId }: MaterialCriadoresModalProps) {
  const { materiais, createMaterial, updateMaterial } = useMateriaisComunidadeAdmin();
  const { members } = useCommunityMembers();
  
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("prompt");
  const [categoria, setCategoria] = useState("chatgpt");
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [arquivoUrl, setArquivoUrl] = useState("");
  const [criadorId, setCriadorId] = useState<string | null>(null);
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditing = !!materialId;
  const existingMaterial = materiais.find((m) => m.id === materialId);

  useEffect(() => {
    if (existingMaterial) {
      setTitulo(existingMaterial.titulo);
      setDescricao(existingMaterial.descricao || "");
      setTipo(existingMaterial.tipo);
      setCategoria(existingMaterial.categoria);
      setConteudoTexto(existingMaterial.conteudo_texto || "");
      setArquivoUrl(existingMaterial.arquivo_url || "");
      setCriadorId(existingMaterial.criador_id);
      setOrdem(existingMaterial.ordem);
      setAtivo(existingMaterial.ativo);
    } else {
      resetForm();
    }
  }, [existingMaterial, open]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setTipo("prompt");
    setCategoria("chatgpt");
    setConteudoTexto("");
    setArquivoUrl("");
    setCriadorId(null);
    setOrdem(0);
    setAtivo(true);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setArquivoUrl("");
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return arquivoUrl || null;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("materiais-comunidade")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("materiais-comunidade")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload do arquivo");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Titulo e obrigatorio");
      return;
    }

    if (!tipo || !categoria) {
      toast.error("Tipo e categoria sao obrigatorios");
      return;
    }

    let finalArquivoUrl = arquivoUrl;
    if (selectedFile) {
      const uploadedUrl = await uploadFile();
      if (uploadedUrl) {
        finalArquivoUrl = uploadedUrl;
      }
    }

    const materialData: Partial<MaterialComunidade> = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      tipo,
      categoria,
      conteudo_texto: conteudoTexto.trim() || null,
      arquivo_url: finalArquivoUrl || null,
      criador_id: criadorId,
      ordem,
      ativo,
    };

    if (isEditing && materialId) {
      updateMaterial.mutate({ id: materialId, ...materialData }, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      });
    } else {
      createMaterial.mutate(materialData, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Material" : "Adicionar Material"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Titulo */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Titulo *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o titulo do material"
            />
          </div>

          {/* Descricao */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o material"
              rows={2}
            />
          </div>

          {/* Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conteudo texto (para prompts) */}
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteudo (texto/prompt)</Label>
            <Textarea
              id="conteudo"
              value={conteudoTexto}
              onChange={(e) => setConteudoTexto(e.target.value)}
              placeholder="Cole aqui o prompt ou conteudo de texto"
              rows={5}
              className="font-mono text-sm"
            />
          </div>

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label>Arquivo (imagem/documento)</Label>
            {arquivoUrl && !selectedFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm truncate flex-1">{arquivoUrl}</span>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : selectedFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
                <Label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para fazer upload
                  </span>
                </Label>
              </div>
            )}
          </div>

          {/* Criador */}
          <div className="space-y-2">
            <Label>Criador (membro da comunidade)</Label>
            <Select value={criadorId || "none"} onValueChange={(v) => setCriadorId(v === "none" ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o criador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (Comunidade)</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordem e Ativo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                value={ordem}
                onChange={(e) => setOrdem(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="ativo">Ativo</Label>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMaterial.isPending || updateMaterial.isPending || uploading}
          >
            {uploading ? "Enviando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
