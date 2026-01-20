import { ArrowLeft, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BonusGlobaisTab from "@/components/admin/mentoria/BonusGlobaisTab";
import { adminTheme } from "@/components/admin/adminTheme";

export default function MentoriaBonusPage() {
  const navigate = useNavigate();

  return (
    <div className={adminTheme.page}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => navigate("/admin/mentoria")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Gift className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Bônus Globais</h1>
      </div>

      <BonusGlobaisTab showHeader={false} />
    </div>
  );
}
