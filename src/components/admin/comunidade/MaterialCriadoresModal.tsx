import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMateriaisComunidadeAdmin, MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, FileText, Sparkles, Loader2 } from "lucide-react";

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

const getFileName = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split("/");
    const fileName = parts[parts.length - 1];
    // Remove timestamp prefix if present
    const nameWithoutTimestamp = fileName.replace(/^\d+-[a-z0-9]+\./, ".");
    return nameWithoutTimestamp.length > 1 ? fileName : fileName;
  } catch {
    return url.split("/").pop() || "arquivo";
  }
};

export function MaterialCriadoresModal({ open, onOpenChange, materialId }: MaterialCriadoresModalProps) {
  const { materiais, createMaterial, updateMaterial } = useMateriaisComunidadeAdmin();
  const { members } = useCommunityMembers();
  
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("prompt");
  const [categoria, setCategoria] = useState("chatgpt");
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [arquivoUrls, setArquivoUrls] = useState<string[]>([]);
  const [criadorId, setCriadorId] = useState<string | null>(null);
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [gerando, setGerando] = useState(false);

  const isEditing = !!materialId;
  const existingMaterial = materiais.find((m) => m.id === materialId);

  useEffect(() => {
    if (existingMaterial) {
      setTitulo(existingMaterial.titulo);
      setDescricao(existingMaterial.descricao || "");
      setTipo(existingMaterial.tipo);
      setCategoria(existingMaterial.categoria);
      setConteudoTexto(existingMaterial.conteudo_texto || "");
      setArquivoUrls(existingMaterial.arquivos_url || []);
      setCriadorId(existingMaterial.criador_id);
      setOrdem(existingMaterial.ordem);
      setAtivo(existingMaterial.ativo);
      setSelectedFiles([]);
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
    setArquivoUrls([]);
    setCriadorId(null);
    setOrdem(0);
    setAtivo(true);
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
    // Reset input so user can select same file again
    e.target.value = "";
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingUrl = (index: number) => {
    setArquivoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [...arquivoUrls];

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materiais-comunidade")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Erro ao fazer upload:", uploadError);
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("materiais-comunidade")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  // Funcao para extrair conteudo real de arquivos usando IA
  const extractFileContent = async (file: File): Promise<string> => {
    // Para arquivos de texto simples - leitura direta
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      return await file.text();
    }
    
    // Para imagens, retornar descricao basica (fallback)
    if (file.type.startsWith("image/")) {
      return `[Imagem: ${file.name}]`;
    }
    
    // Para PDF, PPTX, DOCX - usar edge function com Gemini
    const binaryFormats = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/msword",
    ];
    
    const isBinaryDoc = binaryFormats.includes(file.type) || 
      file.name.endsWith(".pdf") || 
      file.name.endsWith(".pptx") || 
      file.name.endsWith(".ppt") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc");
    
    if (isBinaryDoc) {
      try {
        // Converter arquivo para base64
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        
        console.log(`Extraindo texto de ${file.name} via IA...`);
        
        // Chamar edge function para extrair texto
        const { data, error } = await supabase.functions.invoke("extrair-texto-documento", {
          body: { 
            fileBase64: base64, 
            fileName: file.name, 
            fileType: file.type 
          },
        });
        
        if (error) {
          console.warn("Erro na edge function:", error);
          return `[Documento: ${file.name}]`;
        }
        
        if (data?.fallback || !data?.texto) {
          console.warn("Fallback: não foi possível extrair texto de", file.name);
          return `[Documento: ${file.name}]`;
        }
        
        console.log(`Texto extraído de ${file.name}: ${data.texto.length} caracteres`);
        return data.texto.substring(0, 15000); // Limitar tamanho
      } catch (e) {
        console.error("Erro ao extrair texto:", e);
        return `[Documento: ${file.name}]`;
      }
    }
    
    // Fallback para outros formatos
    return `[Documento: ${file.name}]`;
  };

  const handleGerarComIA = async () => {
    let conteudo = conteudoTexto.trim();
    
    // Se nao tem texto, extrair conteudo real dos arquivos selecionados
    if (!conteudo && selectedFiles.length > 0) {
      setGerando(true);
      toast.info("Extraindo conteúdo dos documentos... isso pode levar alguns segundos.");
      
      try {
        const contents = await Promise.all(
          selectedFiles.map(async (file) => {
            const content = await extractFileContent(file);
            return `--- ${file.name} ---\n${content}`;
          })
        );
        conteudo = contents.join("\n\n");
        
        // Verificar se extração foi bem sucedida
        const hasRealContent = contents.some(c => !c.includes("[Documento:") && !c.includes("[Imagem:"));
        if (!hasRealContent) {
          toast.warning("Não foi possível extrair texto. Usando informações básicas.");
        }
      } catch (error) {
        console.error("Erro ao extrair conteudo:", error);
        toast.error("Erro ao ler conteúdo dos arquivos");
        setGerando(false);
        return;
      }
    }
    
    // Se ainda nao tem conteudo, usar URLs existentes como fallback
    if (!conteudo && arquivoUrls.length > 0) {
      conteudo = `Arquivos ja enviados: ${arquivoUrls.map(url => getFileName(url)).join(", ")}`;
    }
    
    if (!conteudo) {
      toast.error("Adicione conteudo texto ou arquivos primeiro");
      return;
    }

    setGerando(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-metadados-material", {
        body: { conteudo, tipo, categoria },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro desconhecido");

      setTitulo(data.data.titulo);
      setDescricao(data.data.descricao);
      toast.success("Titulo e descricao gerados com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar com IA:", error);
      toast.error("Erro ao gerar com IA. Tente novamente.");
    } finally {
      setGerando(false);
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

    setUploading(true);
    let finalArquivoUrls = arquivoUrls;
    
    try {
      if (selectedFiles.length > 0) {
        finalArquivoUrls = await uploadFiles();
      }

      const materialData: Partial<MaterialComunidade> = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        tipo,
        categoria,
        conteudo_texto: conteudoTexto.trim() || null,
        arquivos_url: finalArquivoUrls,
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
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>
              {isEditing ? "Editar Material" : "Adicionar Material"}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGerarComIA}
              disabled={gerando || (!conteudoTexto.trim() && selectedFiles.length === 0 && arquivoUrls.length === 0)}
            >
              {gerando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Gerar com IA
            </Button>
          </div>
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

          {/* Upload de arquivos múltiplos */}
          <div className="space-y-2">
            <Label>Arquivos (imagens/documentos)</Label>
            
            {/* Lista de arquivos existentes */}
            {arquivoUrls.length > 0 && (
              <div className="space-y-2">
                {arquivoUrls.map((url, index) => (
                  <div key={url} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate flex-1">{getFileName(url)}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExistingUrl(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de arquivos pendentes para upload */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                    <FileText className="w-4 h-4 shrink-0 text-primary" />
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Badge variant="secondary" className="shrink-0">Novo</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSelectedFile(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Botao de adicionar arquivos */}
            <div className="relative">
              <Input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <Label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para adicionar arquivos
                </span>
              </Label>
            </div>
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
