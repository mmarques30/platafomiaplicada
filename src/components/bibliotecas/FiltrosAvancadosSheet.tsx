import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FiltrosAvancados {
  categoria: string | null;
  preco: "todas" | "gratuitas" | "pagas";
  valeAPena: "todas" | "sim" | "nao";
}

interface FiltrosAvancadosSheetProps {
  filtros: FiltrosAvancados;
  onFiltrosChange: (filtros: FiltrosAvancados) => void;
  categorias: string[];
}

export function FiltrosAvancadosSheet({
  filtros,
  onFiltrosChange,
  categorias,
}: FiltrosAvancadosSheetProps) {
  const [tempFiltros, setTempFiltros] = useState<FiltrosAvancados>(filtros);
  const [open, setOpen] = useState(false);

  const handleAplicar = () => {
    onFiltrosChange(tempFiltros);
    setOpen(false);
  };

  const handleLimpar = () => {
    const filtrosLimpos: FiltrosAvancados = {
      categoria: null,
      preco: "todas",
      valeAPena: "todas",
    };
    setTempFiltros(filtrosLimpos);
    onFiltrosChange(filtrosLimpos);
  };

  const filtrosAtivos =
    tempFiltros.categoria !== null ||
    tempFiltros.preco !== "todas" ||
    tempFiltros.valeAPena !== "todas";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="w-4 h-4" />
          {filtrosAtivos && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Refine sua busca por ferramentas
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Tipo de Ferramenta */}
          <div className="space-y-3">
            <Label>Tipo de Ferramenta</Label>
            <Select
              value={tempFiltros.categoria || "todas"}
              onValueChange={(value) =>
                setTempFiltros({
                  ...tempFiltros,
                  categoria: value === "todas" ? null : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preço */}
          <div className="space-y-3">
            <Label>Preço</Label>
            <RadioGroup
              value={tempFiltros.preco}
              onValueChange={(value: "todas" | "gratuitas" | "pagas") =>
                setTempFiltros({ ...tempFiltros, preco: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todas" id="preco-todas" />
                <Label htmlFor="preco-todas" className="font-normal cursor-pointer">
                  Todas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gratuitas" id="preco-gratuitas" />
                <Label htmlFor="preco-gratuitas" className="font-normal cursor-pointer">
                  Apenas Gratuitas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pagas" id="preco-pagas" />
                <Label htmlFor="preco-pagas" className="font-normal cursor-pointer">
                  Apenas Pagas
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Vale a Pena */}
          <div className="space-y-3">
            <Label>Recomendação</Label>
            <RadioGroup
              value={tempFiltros.valeAPena}
              onValueChange={(value: "todas" | "sim" | "nao") =>
                setTempFiltros({ ...tempFiltros, valeAPena: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todas" id="recom-todas" />
                <Label htmlFor="recom-todas" className="font-normal cursor-pointer">
                  Todas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="recom-sim" />
                <Label htmlFor="recom-sim" className="font-normal cursor-pointer">
                  Vale a Pena
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="recom-nao" />
                <Label htmlFor="recom-nao" className="font-normal cursor-pointer">
                  Não Vale a Pena
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleLimpar}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button onClick={handleAplicar} className="flex-1">
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
