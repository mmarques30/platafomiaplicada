import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bold, Italic, Smile, Link2, ImagePlus, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_EMOJIS = ["😊", "👍", "🎉", "❤️", "🔥", "💡", "✨", "🚀", "💪", "🎯"];

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { createPost, isCreating } = useCommunityPosts();
  const { isVisitante, isAdmin } = useUserRole();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mentorados e admins podem fazer upload de imagens
  const canUploadImages = !isVisitante || isAdmin;

  const { data: categories } = useQuery({
    queryKey: ["community-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_categories")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + emoji + content.substring(start);
    
    setContent(newText);
    setShowEmojiPicker(false);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      toast.error("Insira uma URL válida");
      return;
    }
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const displayText = linkText.trim() || linkUrl;
    const markdownLink = `[${displayText}](${linkUrl})`;
    const newText = content.substring(0, start) + markdownLink + content.substring(start);
    
    setContent(newText);
    setLinkUrl("");
    setLinkText("");
    setShowLinkInput(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdownLink.length, start + markdownLink.length);
    }, 0);
  };

  // Sanitiza nome do arquivo removendo acentos, espaços e caracteres especiais
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-_.]/g, "")
      .toLowerCase();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validar tipo
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} excede o limite de 5MB`);
          continue;
        }

        const sanitizedName = sanitizeFileName(file.name);
        const filePath = `${user.id}/${Date.now()}-${sanitizedName}`;
        const { error } = await supabase.storage
          .from("community-posts-images")
          .upload(filePath, file);

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Erro ao fazer upload de ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("community-posts-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    const mediaArray = imageUrls.map((url) => ({ type: "image", url }));

    createPost(
      {
        title: title.trim() || undefined,
        content: content.trim(),
        category_id: categoryId || undefined,
        media: mediaArray.length > 0 ? mediaArray : undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setCategoryId("");
          setImageUrls([]);
          onOpenChange(false);
        },
      }
    );
  };

  const resetModal = () => {
    setTitle("");
    setContent("");
    setCategoryId("");
    setImageUrls([]);
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-card border-border text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione uma categoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título..."
              className="bg-background border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted rounded-t-md border border-b-0 border-input">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("**")}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("*")}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </Button>
              
              {/* Botão Link - TODOS */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput(!showLinkInput)}
                title="Inserir link"
              >
                <Link2 className="h-4 w-4" />
              </Button>

              {/* Botão Imagem - apenas mentorados/admins */}
              {canUploadImages && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title="Adicionar imagem"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </>
              )}

              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg z-[100] grid grid-cols-5 gap-1 min-w-[200px]">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="text-xl hover:bg-accent p-1 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Link Input Popover */}
            {showLinkInput && (
              <div className="p-3 bg-muted rounded-md border border-input space-y-2">
                <Input
                  placeholder="Texto do link (ex: Clique aqui)"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="bg-background"
                />
                <Input
                  placeholder="URL (ex: https://exemplo.com)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-background"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={insertLink}>
                    Inserir
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe algo com a comunidade... Use **negrito** e *itálico*"
              className="bg-background border-input rounded-t-none min-h-[150px]"
            />

            {/* Preview de imagens selecionadas */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isCreating || isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isCreating || isUploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
