import { useState } from "react";
import { useMateriaisComunidade } from "@/hooks/useMateriaisComunidade";
import { MaterialComunidadeCard } from "./MaterialComunidadeCard";
import { MaterialComunidadeRow } from "./MaterialComunidadeRow";
import { MaterialComunidadeModal } from "./MaterialComunidadeModal";
import { AdicionarMaterialModal } from "./AdicionarMaterialModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List, Sparkles, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPlan } from "@/hooks/useUserPlan";

const TIPOS = [
  { value: "all", label: "Todos os Tipos" },
  { value: "prompt", label: "Prompt" },
  { value: "imagem", label: "Imagem" },
  { value: "documento", label: "Documento" },
  { value: "template", label: "Template" },
  { value: "outro", label: "Outro" },
];

const CATEGORIAS = [
  { value: "all", label: "Todas as Categorias" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "midjourney", label: "Midjourney" },
  { value: "canva", label: "Canva" },
  { value: "notion", label: "Notion" },
  { value: "excel", label: "Excel" },
  { value: "outro", label: "Outro" },
];

export function CriadoresComunidadeTab() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { isAcademy, isBusiness, isVisitante, isLoading: isPlanLoading } = useUserPlan();

  const { materiais, isLoading } = useMateriaisComunidade({
    tipo: tipoFilter,
    categoria: categoriaFilter,
  });

  // Mentorados Academy e Business podem contribuir (não visitantes)
  const canContribute = (isAcademy || isBusiness) && !isVisitante;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
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

        <div className="flex items-center gap-2">
          {/* Botão Contribuir - visível para Academy e Business */}
          {canContribute && (
            <Button onClick={() => setShowAddModal(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Contribuir
            </Button>
          )}

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("table")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      {materiais.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Os materiais criados pela comunidade aparecerao aqui. Fique atento as novidades!
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {materiais.map((material) => (
            <MaterialComunidadeCard
              key={material.id}
              material={material}
              onClick={() => setSelectedMaterial(material.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {materiais.map((material) => (
              <MaterialComunidadeRow
                key={material.id}
                material={material}
                onClick={() => setSelectedMaterial(material.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modal de detalhes */}
      <MaterialComunidadeModal
        materialId={selectedMaterial}
        open={!!selectedMaterial}
        onOpenChange={(open) => !open && setSelectedMaterial(null)}
      />

      {/* Modal de adicionar material */}
      <AdicionarMaterialModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
