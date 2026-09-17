import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Copy, Link2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  programa,
  rotuloPapel,
  type PapelPrograma,
  type StatusConvite,
} from "@/integrations/supabase/programa";

interface Convite {
  id: string;
  email: string;
  nome: string | null;
  empresa: string | null;
  token: string;
  papel: PapelPrograma;
  status: StatusConvite;
  expira_em: string;
  creditar_a: string | null;
  created_at: string;
}

const ROTULO_STATUS: Record<StatusConvite, string> = {
  pendente: "Aguardando",
  aceito: "Aceito",
  expirado: "Expirado",
  cancelado: "Cancelado",
};

const PAPEIS: PapelPrograma[] = ["indicador", "parceria_aberta", "parceria_executora"];

function useConvites() {
  return useQuery({
    queryKey: ["convites-indica"],
    queryFn: async (): Promise<Convite[]> => {
      const { data, error } = await programa("convites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Convite[];
    },
    refetchOnWindowFocus: false,
  });
}

/** O link que a pessoa recebe. O token já vem gerado pelo banco. */
function linkDoConvite(token: string) {
  return `${window.location.origin}/auth?convite=${token}`;
}

/**
 * Convites do IAplicada Indica.
 *
 * Era o que faltava ficar claro: o convite é gerado aqui, pela equipe, com o
 * papel já escolhido. Quem define o formato é a IAplicada, e o papel pode ser
 * alterado depois, então o campo não é definitivo.
 *
 * O token vem do banco (`encode(gen_random_bytes(24), 'hex')`), não do
 * cliente: link de convite não é coisa que o navegador deva sortear.
 */
export default function ConvitesIndica() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: convites = [], isLoading } = useConvites();
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [campos, setCampos] = useState({
    email: "",
    nome: "",
    empresa: "",
    papel: "indicador" as PapelPrograma,
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Faça login.");
      const { data, error } = await programa("convites")
        .insert({
          email: campos.email.trim().toLowerCase(),
          nome: campos.nome.trim() || null,
          empresa: campos.empresa.trim() || null,
          papel: campos.papel,
          gerado_por: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Convite;
    },
    onSuccess: (convite) => {
      queryClient.invalidateQueries({ queryKey: ["convites-indica"] });
      setCampos({ email: "", nome: "", empresa: "", papel: "indicador" });
      setAberto(false);
      navigator.clipboard?.writeText(linkDoConvite(convite.token));
      toast.success("Convite criado. O link já está na sua área de transferência.");
    },
    onError: (erro: Error) => {
      const jaExiste = erro.message.includes("convites_email_pendente");
      toast.error(
        jaExiste
          ? "Já existe um convite pendente para esse e-mail."
          : erro.message,
      );
    },
  });

  const copiar = (convite: Convite) => {
    navigator.clipboard?.writeText(linkDoConvite(convite.token));
    setCopiado(convite.id);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="titulo-bloco text-2xl text-foreground">Convites do Indica</h1>
          <p className="text-sm text-muted-foreground">
            O convite é gerado aqui, com o papel já escolhido. O papel pode ser alterado
            depois, então nada aqui é definitivo.
          </p>
        </div>
        <Button onClick={() => setAberto(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Novo convite
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-skeleton-pulse rounded-lg bg-foreground/[0.05]" />
          ))}
        </div>
      ) : convites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Link2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Nenhum convite ainda. O primeiro link sai daqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {convites.map((convite) => (
            <li
              key={convite.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium text-foreground">
                  {convite.nome || convite.email}
                  {convite.empresa && (
                    <span className="text-muted-foreground"> · {convite.empresa}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rotuloPapel(convite.papel)} · {ROTULO_STATUS[convite.status]} · criado em{" "}
                  {format(new Date(convite.created_at), "d 'de' MMM", { locale: ptBR })}
                </p>
              </div>
              {convite.status === "pendente" && (
                <Button variant="outline" size="sm" onClick={() => copiar(convite)}>
                  {copiado === convite.id ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  {copiado === convite.id ? "Copiado" : "Copiar link"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo convite</DialogTitle>
            <DialogDescription>
              O link é gerado na hora e copiado para você mandar por onde quiser.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="convite-email">E-mail</Label>
              <Input
                id="convite-email"
                type="email"
                value={campos.email}
                onChange={(e) => setCampos((c) => ({ ...c, email: e.target.value }))}
                placeholder="pessoa@empresa.com"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="convite-nome">Nome</Label>
                <Input
                  id="convite-nome"
                  value={campos.nome}
                  onChange={(e) => setCampos((c) => ({ ...c, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="convite-empresa">Empresa</Label>
                <Input
                  id="convite-empresa"
                  value={campos.empresa}
                  onChange={(e) => setCampos((c) => ({ ...c, empresa: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Formato no programa</Label>
              <Select
                value={campos.papel}
                onValueChange={(v) => setCampos((c) => ({ ...c, papel: v as PapelPrograma }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAPEIS.map((papel) => (
                    <SelectItem key={papel} value={papel}>
                      {rotuloPapel(papel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criar.mutate()}
              disabled={!campos.email.includes("@") || criar.isPending}
            >
              {criar.isPending ? "Gerando..." : "Gerar link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
