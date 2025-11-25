import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Produto, useCreateProduto, useUpdateProduto } from "@/hooks/admin/useProdutos";
import { X } from "lucide-react";

interface ProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto | null;
}

export function ProdutoModal({ open, onOpenChange, produto }: ProdutoModalProps) {
  const createProduto = useCreateProduto();
  const updateProduto = useUpdateProduto();
  
  const [formData, setFormData] = useState({
    slug: "",
    nome: "",
    tipo: "b2c" as "b2c" | "b2b",
    formato: "",
    valor: "",
    valor_com_desconto: "",
    valor_minimo: "",
    valor_maximo: "",
    periodicidade: "",
    duracao: "",
    descricao_curta: "",
    descricao_completa: "",
    beneficios: [] as string[],
    is_consultoria: false,
    licencas_minimas: "",
    ordem: "",
    ativo: true,
  });

  const [beneficioInput, setBeneficioInput] = useState("");

  useEffect(() => {
    if (produto) {
      setFormData({
        slug: produto.slug,
        nome: produto.nome,
        tipo: produto.tipo,
        formato: produto.formato,
        valor: produto.valor.toString(),
        valor_com_desconto: produto.valor_com_desconto?.toString() || "",
        valor_minimo: produto.valor_minimo?.toString() || "",
        valor_maximo: produto.valor_maximo?.toString() || "",
        periodicidade: produto.periodicidade || "",
        duracao: produto.duracao || "",
        descricao_curta: produto.descricao_curta,
        descricao_completa: produto.descricao_completa,
        beneficios: produto.beneficios,
        is_consultoria: produto.is_consultoria || false,
        licencas_minimas: produto.licencas_minimas?.toString() || "",
        ordem: produto.ordem.toString(),
        ativo: produto.ativo,
      });
    } else {
      setFormData({
        slug: "",
        nome: "",
        tipo: "b2c",
        formato: "",
        valor: "",
        valor_com_desconto: "",
        valor_minimo: "",
        valor_maximo: "",
        periodicidade: "",
        duracao: "",
        descricao_curta: "",
        descricao_completa: "",
        beneficios: [],
        is_consultoria: false,
        licencas_minimas: "",
        ordem: "",
        ativo: true,
      });
    }
    setBeneficioInput("");
  }, [produto, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      slug: formData.slug,
      nome: formData.nome,
      tipo: formData.tipo,
      formato: formData.formato,
      valor: parseFloat(formData.valor),
      valor_com_desconto: formData.valor_com_desconto ? parseFloat(formData.valor_com_desconto) : undefined,
      valor_minimo: formData.valor_minimo ? parseFloat(formData.valor_minimo) : undefined,
      valor_maximo: formData.valor_maximo ? parseFloat(formData.valor_maximo) : undefined,
      periodicidade: formData.periodicidade || undefined,
      duracao: formData.duracao || undefined,
      descricao_curta: formData.descricao_curta,
      descricao_completa: formData.descricao_completa,
      beneficios: formData.beneficios,
      is_consultoria: formData.is_consultoria,
      licencas_minimas: formData.licencas_minimas ? parseInt(formData.licencas_minimas) : undefined,
      ordem: parseInt(formData.ordem),
      ativo: formData.ativo,
    };

    if (produto) {
      await updateProduto.mutateAsync({ id: produto.id, ...data });
    } else {
      await createProduto.mutateAsync(data);
    }

    onOpenChange(false);
  };

  const addBeneficio = () => {
    if (beneficioInput.trim()) {
      setFormData({
        ...formData,
        beneficios: [...formData.beneficios, beneficioInput.trim()],
      });
      setBeneficioInput("");
    }
  };

  const removeBeneficio = (index: number) => {
    setFormData({
      ...formData,
      beneficios: formData.beneficios.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produto ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "b2c" | "b2b") => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2c">B2C</SelectItem>
                  <SelectItem value="b2b">B2B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="formato">Formato</Label>
              <Input
                id="formato"
                value={formData.formato}
                onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pb-4">
            <Switch
              id="is_consultoria"
              checked={formData.is_consultoria}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_consultoria: checked })
              }
            />
            <Label htmlFor="is_consultoria">É consultoria?</Label>
          </div>

          {!formData.is_consultoria ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor_com_desconto">Valor com Desconto</Label>
                <Input
                  id="valor_com_desconto"
                  type="number"
                  step="0.01"
                  value={formData.valor_com_desconto}
                  onChange={(e) => setFormData({ ...formData, valor_com_desconto: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="valor_minimo">Valor Mínimo (R$)</Label>
                <Input
                  id="valor_minimo"
                  type="number"
                  step="0.01"
                  value={formData.valor_minimo}
                  onChange={(e) => setFormData({ ...formData, valor_minimo: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor_maximo">Valor Máximo (R$)</Label>
                <Input
                  id="valor_maximo"
                  type="number"
                  step="0.01"
                  value={formData.valor_maximo}
                  onChange={(e) => setFormData({ ...formData, valor_maximo: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="licencas_minimas">Licenças Mín.</Label>
                <Input
                  id="licencas_minimas"
                  type="number"
                  value={formData.licencas_minimas}
                  onChange={(e) => setFormData({ ...formData, licencas_minimas: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodicidade">Periodicidade</Label>
              <Input
                id="periodicidade"
                value={formData.periodicidade}
                onChange={(e) => setFormData({ ...formData, periodicidade: e.target.value })}
                placeholder="anual, mensal, unico"
              />
            </div>

            <div>
              <Label htmlFor="duracao">Duração</Label>
              <Input
                id="duracao"
                value={formData.duracao}
                onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao_curta">Descrição Curta</Label>
            <Textarea
              id="descricao_curta"
              value={formData.descricao_curta}
              onChange={(e) => setFormData({ ...formData, descricao_curta: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao_completa">Descrição Completa</Label>
            <Textarea
              id="descricao_completa"
              value={formData.descricao_completa}
              onChange={(e) => setFormData({ ...formData, descricao_completa: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Benefícios</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={beneficioInput}
                onChange={(e) => setBeneficioInput(e.target.value)}
                placeholder="Adicionar benefício"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBeneficio())}
              />
              <Button type="button" onClick={addBeneficio}>Adicionar</Button>
            </div>
            <div className="space-y-2">
              {formData.beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{beneficio}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBeneficio(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Produto Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {produto ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
