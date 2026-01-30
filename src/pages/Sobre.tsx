import { AboutSection } from "@/components/ui/about-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sobre() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Botão Voltar */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-muted"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
      </div>
      
      {/* About Section */}
      <div className="pt-16">
        <AboutSection />
      </div>
    </div>
  );
}
