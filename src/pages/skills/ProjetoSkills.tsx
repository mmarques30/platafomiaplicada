import { Briefcase } from "lucide-react";

export default function ProjetoSkills() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Projeto Skills</h1>
          <p className="text-muted-foreground mt-1">
            Em breve: acompanhe o projeto Skills da sua equipe
          </p>
        </div>
      </div>
    </div>
  );
}
