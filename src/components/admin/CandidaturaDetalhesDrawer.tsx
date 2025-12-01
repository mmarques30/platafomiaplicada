import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAtualizarCandidatura, Candidatura } from "@/hooks/useCandidaturasMentoria";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CandidaturaDetalhesDrawerProps {
  candidatura: Candidatura | null;
  open: boolean;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em Análise",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  aguardando_contato: "Aguardando Contato",
};

export function CandidaturaDetalhesDrawer({
  candidatura,
  open,
  onClose,
}: CandidaturaDetalhesDrawerProps) {
  const [notas, setNotas] = useState(candidatura?.notas_admin || "");
  const [status, setStatus] = useState(candidatura?.status || "nova");
  const { mutate: atualizar } = useAtualizarCandidatura();

  if (!candidatura) return null;

  const handleSalvar = () => {
    atualizar(
      {
        id: candidatura.id,
        updates: {
          status,
          notas_admin: notas,
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Detalhes da Candidatura</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-6 pb-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="font-bold text-lg mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <p className="font-medium">{candidatura.nome_completo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{candidatura.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">WhatsApp</Label>
                <p className="font-medium">{candidatura.whatsapp}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">LinkedIn</Label>
                <p className="font-medium">{candidatura.linkedin_url || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Cidade/Estado</Label>
                <p className="font-medium">{candidatura.cidade_estado || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Data da Candidatura</Label>
                <p className="font-medium">
                  {format(new Date(candidatura.created_at), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Situação Profissional */}
          <div>
            <h3 className="font-bold text-lg mb-3">Situação Profissional</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Empresa</Label>
                <p className="font-medium">{candidatura.empresa_atual || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Cargo</Label>
                <p className="font-medium capitalize">
                  {candidatura.cargo_atual || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tempo no Cargo</Label>
                <p className="font-medium">{candidatura.tempo_cargo || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Liderados</Label>
                <p className="font-medium">{candidatura.qtd_liderados || 0}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Porte da Empresa</Label>
                <p className="font-medium capitalize">
                  {candidatura.porte_empresa || "-"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Conhecimento em IA */}
          <div>
            <h3 className="font-bold text-lg mb-3">Conhecimento em IA</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Nível de IA</Label>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-[#9EB038]">
                    {candidatura.nivel_ia || 0}/10
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Ferramentas</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {candidatura.ferramentas_ia?.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
              {candidatura.ja_implementou_ia && (
                <div>
                  <Label className="text-muted-foreground">
                    Implementação de IA
                  </Label>
                  <p className="text-sm">
                    {candidatura.descricao_implementacao || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Situação Financeira */}
          <div>
            <h3 className="font-bold text-lg mb-3">Situação Financeira</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Faixa de Renda</Label>
                <p className="font-medium capitalize">
                  {candidatura.faixa_renda || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Autonomia</Label>
                <p className="font-medium">{candidatura.autonomia_contratacao || "-"}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">
                  Tem R$4k-10k para investir?
                </Label>
                <p className="font-medium capitalize">
                  {candidatura.tem_4k_10k_investir || "-"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Motivações */}
          <div>
            <h3 className="font-bold text-lg mb-3">Motivações e Objetivos</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">
                  O que significa sucesso com IA?
                </Label>
                <p className="text-sm">{candidatura.significado_sucesso_ia}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  3 Maiores Desafios
                </Label>
                <p className="text-sm">{candidatura.tres_maiores_desafios}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Meta em 2 anos
                </Label>
                <p className="text-sm">
                  {candidatura.onde_quer_estar_2_anos || "-"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Perguntas de Inversão */}
          <div>
            <h3 className="font-bold text-lg mb-3">Perguntas de Inversão</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">
                  Por que escolher você?
                </Label>
                <p className="text-sm">{candidatura.por_que_escolher_voce}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Como contribuir com o grupo?
                </Label>
                <p className="text-sm">
                  {candidatura.como_contribuir_grupo || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Impedimentos para começar
                </Label>
                <p className="text-sm">
                  {candidatura.impedimento_comecar_hoje || "-"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Controle Admin */}
          <div>
            <h3 className="font-bold text-lg mb-3">Controle</h3>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notas Administrativas</Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={4}
                  placeholder="Adicione observações sobre esta candidatura..."
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button onClick={handleSalvar} className="flex-1">
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
