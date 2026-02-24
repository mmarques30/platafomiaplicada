import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, FileText, Code, Table as TableIcon, Loader2, ExternalLink } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

const CATEGORIAS = [
  { value: "templates", label: "Templates" },
  { value: "guias", label: "Guias" },
  { value: "prompts", label: "Prompts" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "checklists", label: "Checklists" },
  { value: "ebooks", label: "E-books" },
  { value: "newsletter", label: "Newsletter" },
  { value: "materiais_aula", label: "Materiais Aula" },
];

const TIPOS = [
  { value: "download", label: "Download" },
  { value: "link", label: "Link Externo" },
];

type Material = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url: string;
  tipo: string;
  imagem_url: string | null;
  ordem: number;
  ativo: boolean;
  arquivos_url: Json | null;
  links_url: Json | null;
};

type MaterialForm = Omit<Material, "id" | "arquivos_url" | "links_url"> & { arquivos_url?: string[]; links_url?: string[] };

const getLinksUrls = (links_url: Json | null): string[] => {
  if (!links_url) return [];
  if (Array.isArray(links_url)) {
    return links_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

// Helper functions
const getFileName = (url: string): string => {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  return decodeURIComponent(fileName.split('?')[0]);
};

const getFileIcon = (url: string) => {
  const fileName = getFileName(url).toLowerCase();
  if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return FileText;
  }
  if (fileName.endsWith('.csv') || fileName.endsWith('.xml') || fileName.endsWith('.xlsx')) {
    return TableIcon;
  }
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return Code;
  }
  return FileText;
};

const getArquivoUrls = (arquivos_url: Json | null): string[] => {
  if (!arquivos_url) return [];
  if (Array.isArray(arquivos_url)) {
    return arquivos_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

export default function GerenciarMateriais() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialForm>({
    titulo: "",
    descricao: "",
    categoria: "templates",
    url: "",
    tipo: "download",
    imagem_url: "",
    ordem: 0,
    ativo: true,
    arquivos_url: [],
  });
  const [arquivoUrls, setArquivoUrls] = useState<string[]>([]);
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: materiais, isLoading } = useQuery({
    queryKey: ["materiais-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_gratuitos")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as Material[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MaterialForm) => {
      const { error } = await supabase
        .from("materiais_gratuitos")
        .insert({
          ...data,
          arquivos_url: arquivoUrls,
          links_url: linkUrls,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-admin"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-gratuitos"] });
      toast.success("Material criado com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao criar material");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MaterialForm> }) => {
      const { error } = await supabase
        .from("materiais_gratuitos")
        .update({
          ...data,
          arquivos_url: arquivoUrls,
          links_url: linkUrls,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-admin"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-gratuitos"] });
      toast.success("Material atualizado com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao atualizar material");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("materiais_gratuitos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-admin"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-gratuitos"] });
      toast.success("Material excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir material");
    },
  });

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingMaterial(null);
    setArquivoUrls([]);
    setLinkUrls([]);
    setNewLink("");
    setFormData({
      titulo: "",
      descricao: "",
      categoria: "templates",
      url: "",
      tipo: "download",
      imagem_url: "",
      ordem: 0,
      ativo: true,
      arquivos_url: [],
      links_url: [],
    });
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setArquivoUrls(getArquivoUrls(material.arquivos_url));
    setLinkUrls(getLinksUrls(material.links_url));
    setNewLink("");
    setFormData({
      titulo: material.titulo,
      descricao: material.descricao || "",
      categoria: material.categoria,
      url: material.url,
      tipo: material.tipo,
      imagem_url: material.imagem_url || "",
      ordem: material.ordem,
      ativo: material.ativo,
      arquivos_url: getArquivoUrls(material.arquivos_url),
      links_url: getLinksUrls(material.links_url),
    });
    setIsOpen(true);
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    let url = newLink.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setLinkUrls(prev => [...prev, url]);
    setNewLink("");
  };

  const handleRemoveLink = (urlToRemove: string) => {
    setLinkUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.pdf', '.csv', '.xml', '.doc', '.docx', '.html', '.htm', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Formato não suportado. Use: PDF, CSV, XML, DOC, HTML ou XLSX');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('materiais-gratuitos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('materiais-gratuitos')
        .getPublicUrl(data.path);

      setArquivoUrls(prev => [...prev, publicUrl]);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = async (urlToRemove: string) => {
    try {
      const fileName = urlToRemove.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('materiais-gratuitos')
          .remove([fileName]);
      }
      setArquivoUrls(prev => prev.filter(url => url !== urlToRemove));
      toast.success('Arquivo removido');
    } catch (error) {
      console.error('Remove error:', error);
      setArquivoUrls(prev => prev.filter(url => url !== urlToRemove));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const autoUrl = linkUrls[0] || arquivoUrls[0] || null;
    const payload = { ...formData, url: autoUrl };
    if (editingMaterial) {
      updateMutation.mutate({ id: editingMaterial.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleAtivo = (material: Material) => {
    updateMutation.mutate({
      id: material.id,
      data: { ativo: !material.ativo },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este material?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materiais Gratuitos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os materiais disponíveis para download
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Editar Material" : "Novo Material"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multiple Links Section */}
              <div className="space-y-3">
                <Label>Links Externos (apresentações, etc.)</Label>
                
                {/* Links list */}
                {linkUrls.length > 0 && (
                  <div className="space-y-2">
                    {linkUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-sm truncate">{url}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => handleRemoveLink(url)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add link input */}
                <div className="flex gap-2">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddLink}
                    disabled={!newLink.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-3">
                <Label>Arquivos para Download</Label>
                 <p className="text-xs text-muted-foreground">
                   Formatos aceitos: PDF, CSV, XML, DOC, DOCX, HTML, XLSX
                 </p>
                
                {/* Uploaded files list */}
                {arquivoUrls.length > 0 && (
                  <div className="space-y-2">
                    {arquivoUrls.map((url, index) => {
                      const Icon = getFileIcon(url);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-sm truncate">{getFileName(url)}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleRemoveFile(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload button */}
                <div>
                  <input
                    type="file"
                    id="file-upload-material"
                    className="hidden"
                    accept=".pdf,.csv,.xml,.doc,.docx,.html,.htm,.xlsx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload-material')?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar arquivo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  type="url"
                  value={formData.imagem_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imagem_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) =>
                    setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked })
                  }
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMaterial ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Arquivos</TableHead>
                <TableHead className="text-center">Ordem</TableHead>
                <TableHead className="text-center">Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materiais?.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.titulo}</TableCell>
                  <TableCell>
                    {CATEGORIAS.find((c) => c.value === material.categoria)?.label}
                  </TableCell>
                  <TableCell>
                    {TIPOS.find((t) => t.value === material.tipo)?.label}
                  </TableCell>
                  <TableCell className="text-center">
                    {getArquivoUrls(material.arquivos_url).length}
                  </TableCell>
                  <TableCell className="text-center">{material.ordem}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={material.ativo}
                      onCheckedChange={() => handleToggleAtivo(material)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}