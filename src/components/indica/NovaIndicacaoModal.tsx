import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCriarIndicacao } from "@/hooks/useIndicacoes";

interface NovaIndicacaoModalProps {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
}

const VAZIO = {
  empresa_nome: "",
  contato_nome: "",
  contato_whatsapp: "",
  contato_email: "",
  observacao: "",
};

/**
 * O formulário da indicação. O material promete "nome e WhatsApp", então é
 * só isso que é obrigatório; o resto ajuda a equipe a chegar preparada.
 */
export function NovaIndicacaoModal({ aberto, onAbertoChange }: NovaIndicacaoModalProps) {
  const [campos, setCampos] = useState(VAZIO);
  const criar = useCriarIndicacao();

  const podeEnviar = campos.empresa_nome.trim().length > 1 && !criar.isPending;

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!podeEnviar) return;
    await criar.mutateAsync(campos);
    setCampos(VAZIO);
    onAbertoChange(false);
  };

  const definir = (chave: keyof typeof VAZIO) => (evento: { target: { value: string } }) =>
    setCampos((atual) => ({ ...atual, [chave]: evento.target.value }));

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="titulo-bloco text-xl">Nova indicação</DialogTitle>
          <DialogDescription>
            Manda o nome e o WhatsApp. A equipe fala com a pessoa em até 24 horas e conduz
            proposta e fechamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa_nome">Empresa</Label>
            <Input
              id="empresa_nome"
              value={campos.empresa_nome}
              onChange={definir("empresa_nome")}
              placeholder="Nome da empresa"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contato_nome">Quem decide</Label>
            <Input
              id="contato_nome"
              value={campos.contato_nome}
              onChange={definir("contato_nome")}
              placeholder="Nome da pessoa"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contato_whatsapp">WhatsApp</Label>
              <Input
                id="contato_whatsapp"
                value={campos.contato_whatsapp}
                onChange={definir("contato_whatsapp")}
                placeholder="(31) 99999-9999"
                inputMode="tel"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato_email">E-mail</Label>
              <Input
                id="contato_email"
                type="email"
                value={campos.contato_email}
                onChange={definir("contato_email")}
                placeholder="contato@empresa.com"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">O que está travado lá</Label>
            <Textarea
              id="observacao"
              value={campos.observacao}
              onChange={definir("observacao")}
              placeholder="O contexto que você já conhece: o que trava a operação, o tamanho do time, o que já tentaram."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onAbertoChange(false)}
              disabled={criar.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!podeEnviar} className="cta-lime">
              {criar.isPending ? "Enviando..." : "Enviar indicação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
