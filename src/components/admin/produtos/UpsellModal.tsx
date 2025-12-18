import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RegraUpsell, useProdutosAtivos, useCreateRegraUpsell, useUpdateRegraUpsell } from "@/hooks/admin/useProdutos";

interface UpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regra?: RegraUpsell | null;
}

export function UpsellModal({ open, onOpenChange, regra }: UpsellModalProps) {
  const { data: produtos } = useProdutosAtivos();
  const createRegra = useCreateRegraUpsell();
  const updateRegra = useUpdateRegraUpsell();

  const [formData, setFormData] = useState({
    produto_origem_id: "",
    produto_destino_id: "",
    valor_desconto: "",
    economia: "",
    descricao_oferta: "",
    tipo: "upsell" as "upsell" | "renovacao",
    ativo: true,
  });

  useEffect(() => {
    if (regra) {
      setFormData({
        produto_origem_id: regra.produto_origem_id,
        produto_destino_id: regra.produto_destino_id,
        valor_desconto: regra.valor_desconto.toString(),
        economia: regra.economia.toString(),
        descricao_oferta: regra.descricao_oferta,
        tipo: regra.tipo,
        ativo: regra.ativo,
      });
    } else {
      setFormData({
        produto_origem_id: "",
        produto_destino_id: "",
        valor_desconto: "",
        economia: "",
        descricao_oferta: "",
        tipo: "upsell",
        ativo: true,
      });
    }
  }, [regra, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      produto_origem_id: formData.produto_origem_id,
      produto_destino_id: formData.tipo === 'renovacao' ? formData.produto_origem_id : formData.produto_destino_id,
      valor_desconto: parseFloat(formData.valor_desconto),
      economia: parseFloat(formData.economia),
      descricao_oferta: formData.descricao_oferta,
      tipo: formData.tipo,
      ativo: formData.ativo,
    };

    if (regra) {
      await updateRegra.mutateAsync({ id: regra.id, ...data });
    } else {
      await createRegra.mutateAsync(data);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {regra ? `Editar ${regra.tipo === 'renovacao' ? 'Renovação' : 'Upsell'}` : "Nova Regra"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo de Regra</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: "upsell" | "renovacao") => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upsell">Upsell</SelectItem>
                <SelectItem value="renovacao">Renovação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="produto_origem">
              {formData.tipo === 'renovacao' ? 'Produto' : 'Produto de Origem'}
            </Label>
            <Select
              value={formData.produto_origem_id}
              onValueChange={(value) => setFormData({ ...formData, produto_origem_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos?.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'upsell' && (
            <div>
              <Label htmlFor="produto_destino">Produto de Destino</Label>
              <Select
                value={formData.produto_destino_id}
                onValueChange={(value) => setFormData({ ...formData, produto_destino_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos?.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_desconto">
                {formData.tipo === 'renovacao' ? 'Valor Renovação (R$)' : 'Valor com Desconto (R$)'}
              </Label>
              <Input
                id="valor_desconto"
                type="number"
                step="0.01"
                value={formData.valor_desconto}
                onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="economia">Economia (R$)</Label>
              <Input
                id="economia"
                type="number"
                step="0.01"
                value={formData.economia}
                onChange={(e) => setFormData({ ...formData, economia: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao_oferta">Descrição da Oferta</Label>
            <Textarea
              id="descricao_oferta"
              value={formData.descricao_oferta}
              onChange={(e) => setFormData({ ...formData, descricao_oferta: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Regra Ativa</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {regra ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
