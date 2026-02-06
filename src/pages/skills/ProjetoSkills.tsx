import { Briefcase } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";

export default function ProjetoSkills() {
  return (
    <div className="p-6 space-y-6">
      <PageTitle
        primary="Projeto"
        secondary="Skills"
        icon={<Briefcase className="h-7 w-7 text-[hsl(72,50%,35%)]" />}
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Em breve: acompanhe o projeto Skills da sua equipe
        </p>
      </div>
    </div>
  );
}
