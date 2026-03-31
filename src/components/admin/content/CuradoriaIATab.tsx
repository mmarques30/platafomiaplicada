import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, X, Pencil, Loader2 } from "lucide-react";
import { useCuradoriaIA, type CuradoriaItem } from "@/hooks/admin/useCuradoriaIA";
import type { TipoConteudo } from "@/hooks/admin/useConteudosDashboardAdmin";

const TIPO_LABELS: Record<TipoConteudo, string> = {
  noticia: "Notícias IA",
  dica: "Dicas Práticas",
  newsletter: "Newsletter",
  material: "Material",
  criador: "Criador",
};

const TIPO_COLORS: Record<string, string> = {
  noticia: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  dica: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  newsletter: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

function CuradoriaCard({
  item,
  onApprove,
  onDiscard,
  onUpdate,
}: {
  item: CuradoriaItem;
  onApprove: () => void;
  onDiscard: () => void;
  onUpdate: (updates: Partial<Pick<CuradoriaItem, "titulo" | "resumo" | "conteudo" | "tags">>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.titulo);
  const [editResumo, setEditResumo] = useState(item.resumo);

  const isDone = item.status !== "pendente";

  const handleSaveEdit = () => {
    onUpdate({ titulo: editTitle, resumo: editResumo });
    setEditing(false);
  };

  return (
    <Card className={`border-border/50 transition-opacity ${isDone ? "opacity-50" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            {editing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-sm font-semibold"
              />
            ) : (
              <CardTitle className="text-sm">{item.titulo}</CardTitle>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={TIPO_COLORS[item.tipo] || ""}>
                {TIPO_LABELS[item.tipo]}
              </Badge>
              {item.status === "aprovado" && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Aprovado</Badge>
              )}
              {item.status === "descartado" && (
                <Badge variant="secondary">Descartado</Badge>
              )}
            </div>
          </div>
          {!isDone && (
            <div className="flex items-center gap-1 shrink-0">
              {editing ? (
                <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                  Salvar
                </Button>
              ) : (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={onApprove}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onDiscard}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {editing ? (
          <Textarea
            value={editResumo}
            onChange={(e) => setEditResumo(e.target.value)}
            rows={3}
            className="text-xs"
          />
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">{item.resumo}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{item.autor}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CuradoriaIATab() {
  const { items, isGenerating, generateCuradoria, approveItem, discardItem, updateItem } = useCuradoriaIA();

  const sections: { tipo: TipoConteudo; label: string }[] = [
    { tipo: "noticia", label: "Notícias IA" },
    { tipo: "dica", label: "Dicas Práticas" },
    { tipo: "newsletter", label: "Newsletter" },
  ];

  const pendingCount = items.filter((i) => i.status === "pendente").length;
  const approvedCount = items.filter((i) => i.status === "aprovado").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Curadoria Semanal com IA</h2>
          <p className="text-sm text-muted-foreground">
            Gere conteúdo curado automaticamente via Perplexity e aprove o que vai para cada aba da Central.
          </p>
        </div>
        <Button onClick={generateCuradoria} disabled={isGenerating} className="gap-2">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? "Gerando..." : "Gerar Curadoria Semanal"}
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex gap-3 text-sm">
          <span className="text-muted-foreground">
            {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
          </span>
          <span className="text-green-600">
            {approvedCount} aprovado{approvedCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {items.length === 0 && !isGenerating && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>Clique em "Gerar Curadoria Semanal" para buscar conteúdo da última semana.</p>
          </CardContent>
        </Card>
      )}

      {sections.map(({ tipo, label }) => {
        const sectionItems = items.filter((i) => i.tipo === tipo);
        if (sectionItems.length === 0) return null;
        return (
          <div key={tipo} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {sectionItems.map((item) => (
                <CuradoriaCard
                  key={item.id}
                  item={item}
                  onApprove={() => approveItem(item.id)}
                  onDiscard={() => discardItem(item.id)}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
