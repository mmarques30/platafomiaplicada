import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BonusGlobaisTab from "@/components/admin/mentoria/BonusGlobaisTab";

export default function MentoriaBonusPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/gestao")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bônus Globais</h1>
          <p className="text-muted-foreground">
            Gerencie bônus disponíveis para todos os mentorados
          </p>
        </div>
      </div>

      <BonusGlobaisTab />
    </div>
  );
}
