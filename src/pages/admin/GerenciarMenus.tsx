import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMenuConfig, MenuConfig } from "@/hooks/useMenuConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Save, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { adminTheme } from "@/components/admin/adminTheme";

export default function GerenciarMenus() {
  const { menuConfig, isLoading, refetch } = useMenuConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MenuConfig>>({});
  const [saving, setSaving] = useState(false);

  const sidebarMenus = menuConfig?.filter(m => m.tipo === 'sidebar') || [];
  const headerMenus = menuConfig?.filter(m => m.tipo === 'header') || [];
  const adminMenus = menuConfig?.filter(m => m.tipo === 'admin_sidebar') || [];

  const adminPages = [
    { grupo: "Dashboard", items: [{ path: "/admin", label: "Dashboard" }] },
    { grupo: "Usuários", items: [
      { path: "/admin/usuarios", label: "Gerenciar Usuários" },
      { path: "/admin/visitantes", label: "Visitantes" },
      { path: "/admin/importar-usuarios", label: "Importar Usuários" },
    ]},
    { grupo: "Conteúdo", items: [
      { path: "/admin/conteudo", label: "Gerenciar Conteúdo" },
      { path: "/admin/bibliotecas", label: "Gerenciar Bibliotecas" },
      { path: "/admin/materiais", label: "Materiais Gratuitos" },
    ]},
    { grupo: "Mentoria", items: [
      { path: "/admin/mentoria/bonus", label: "Bônus Globais" },
      { path: "/admin/mentoria/academy", label: "Academy" },
      { path: "/admin/mentoria/skills", label: "Skills" },
      { path: "/admin/mentoria/business", label: "Business" },
      { path: "/admin/mentoria/business-iaplicada", label: "Business iAplicada" },
      { path: "/admin/mentoria/preview-paineis", label: "Preview Painéis" },
      { path: "/admin/formularios", label: "Diagnósticos" },
      { path: "/admin/duvidas", label: "Central de Dúvidas" },
    ]},
    { grupo: "Comunicação", items: [
      { path: "/admin/avisos", label: "Gerenciar Avisos" },
      { path: "/admin/comunidade", label: "Comunidade" },
      { path: "/admin/pesquisas", label: "Pesquisas" },
    ]},
    { grupo: "Gestão", items: [
      { path: "/admin/produtos", label: "Produtos" },
      { path: "/admin/minhas-tarefas", label: "Minhas Tarefas" },
    ]},
    { grupo: "Sistema", items: [
      { path: "/admin/menus", label: "Menus" },
      { path: "/admin/auditoria", label: "Auditoria do Sistema" },
      { path: "/admin/conhecimento", label: "Base de Conhecimento" },
      { path: "/admin/permissoes-equipe", label: "Permissões Equipe" },
      { path: "/admin/politicas", label: "Políticas" },
      { path: "/admin/historico-senhas", label: "Histórico de Senhas" },
    ]},
  ];

  const handleToggleVisivel = async (id: string, currentValue: boolean) => {
    setSaving(true);
    const { error } = await supabase
      .from("menu_config")
      .update({ visivel: !currentValue })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar visibilidade");
      console.error(error);
    } else {
      toast.success("Visibilidade atualizada");
      refetch();
    }
    setSaving(false);
  };

  const handleToggleEditavel = async (id: string, currentValue: boolean) => {
    setSaving(true);
    const { error } = await supabase
      .from("menu_config")
      .update({ editavel: !currentValue })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar editável");
      console.error(error);
    } else {
      toast.success("Status editável atualizado");
      refetch();
    }
    setSaving(false);
  };

  const handleEdit = (menu: MenuConfig) => {
    setEditingId(menu.id);
    setFormData({
      label: menu.label,
      url: menu.url || "",
      ordem: menu.ordem,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("menu_config")
      .update(formData)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar alterações");
      console.error(error);
    } else {
      toast.success("Menu atualizado com sucesso");
      setEditingId(null);
      setFormData({});
      refetch();
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const renderMenuRow = (menu: MenuConfig) => {
    const isEditing = editingId === menu.id;

    return (
      <div
        key={menu.id}
        className="flex items-center gap-4 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <>
              <div className="grid gap-2">
                <Label className="text-xs">Nome do Menu</Label>
                <Input
                  value={formData.label || ""}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Nome do menu"
                  className="h-9"
                />
              </div>
              {menu.url && (
                <div className="grid gap-2">
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={formData.url || ""}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/caminho"
                    className="h-9"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label className="text-xs">Ordem</Label>
                <Input
                  type="number"
                  value={formData.ordem || 0}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  className="h-9"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{menu.label}</h4>
                <Badge variant="outline" className="text-xs">
                  {menu.menu_key}
                </Badge>
              </div>
              {menu.url && (
                <p className="text-xs text-muted-foreground">{menu.url}</p>
              )}
              <p className="text-xs text-muted-foreground">Ordem: {menu.ordem}</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Visível</Label>
            <Switch
              checked={menu.visivel}
              onCheckedChange={() => handleToggleVisivel(menu.id, menu.visivel)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Editável</Label>
            <Switch
              checked={menu.editavel}
              onCheckedChange={() => handleToggleEditavel(menu.id, menu.editavel)}
              disabled={saving}
            />
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8"
                onClick={() => handleSave(menu.id)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => handleEdit(menu)}
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <Menu className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Gerenciar Menus e Páginas</h1>
      </div>

      <Card className={adminTheme.card}>
        <CardHeader className={adminTheme.cardHeader}>
          <CardTitle className={adminTheme.cardTitle}>Menus da Sidebar</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Gerencie os itens que aparecem na barra lateral de navegação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sidebarMenus.map(renderMenuRow)}
        </CardContent>
      </Card>

      <Card className={adminTheme.card}>
        <CardHeader className={adminTheme.cardHeader}>
          <CardTitle className={adminTheme.cardTitle}>Menus do Header</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Gerencie os itens que aparecem no cabeçalho superior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {headerMenus.map(renderMenuRow)}
        </CardContent>
      </Card>

      {adminMenus.length > 0 && (
        <Card className={adminTheme.card}>
          <CardHeader className={adminTheme.cardHeader}>
            <CardTitle className={adminTheme.cardTitle}>Menus Admin (Configuráveis)</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Itens do painel administrativo gerenciáveis pelo banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminMenus.map(renderMenuRow)}
          </CardContent>
        </Card>
      )}

      <Card className={adminTheme.card}>
        <CardHeader className={adminTheme.cardHeader}>
          <CardTitle className={adminTheme.cardTitle}>Referência: Todas as Páginas Admin</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Lista completa de todas as páginas disponíveis no painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminPages.map((grupo) => (
            <div key={grupo.grupo}>
              <h4 className="font-semibold text-sm mb-2 text-foreground">{grupo.grupo}</h4>
              <div className="space-y-1 ml-2">
                {grupo.items.map((item) => (
                  <div key={item.path} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {item.path}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
