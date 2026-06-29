import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/shared/PageTitle";

interface MentoriaPageHeaderProps {
  primary: string;
  /** Texto secundário em itálico/accent ao lado do principal */
  secondary?: string;
  /** Linha de apoio sob o título */
  description?: ReactNode;
  /** Eyebrow acima do título (padrão: Mentoria) */
  eyebrow?: string;
  /** Rota do botão "Voltar" (padrão: /mentoria) */
  backTo?: string;
  /** Label do botão "Voltar" (padrão: Voltar) */
  backLabel?: string;
  /** Ações alinhadas à direita do título (botões, badges, etc.) */
  actions?: ReactNode;
}

/**
 * Cabeçalho padrão das páginas internas de Mentoria (Builder/System).
 * Garante o mesmo posicionamento de "Voltar" + título + ações em todas as telas,
 * evitando divergências de ícone, tamanho e formato entre páginas.
 */
export function MentoriaPageHeader({
  primary,
  secondary,
  description,
  eyebrow = "Mentoria",
  backTo = "/mentoria",
  backLabel = "Voltar",
  actions,
}: MentoriaPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(backTo)}
        className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {backLabel}
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle
          primary={primary}
          secondary={secondary}
          eyebrow={eyebrow}
          description={description}
        />
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
