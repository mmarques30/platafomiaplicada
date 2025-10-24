import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  id: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters: Filter[];
  onClear: () => void;
  totalItems: number;
  filteredItems: number;
  actionButton?: React.ReactNode;
}

export function FilterBar({ filters, onClear, totalItems, filteredItems, actionButton }: FilterBarProps) {
  const hasActiveFilters = filters.some(f => f.value !== 'todos' && f.value !== 'todas');
  const showCounter = filteredItems !== totalItems;

  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filtros:</span>
          
          {filters.map((filter) => (
          <Select key={filter.id} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="ml-2"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {actionButton && (
          <div className="flex-shrink-0">
            {actionButton}
          </div>
        )}
      </div>

      {showCounter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Mostrando: {filteredItems} de {totalItems} itens
          </Badge>
        </div>
      )}
    </div>
  );
}