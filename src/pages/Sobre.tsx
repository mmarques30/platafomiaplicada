import { AboutSection } from "@/components/ui/about-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sobre() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Botão Voltar */}
      <div className="sticky top-0 left-0 z-20 p-4">
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-muted"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
      </div>
      
      {/* About Section - Flex grow to fill available space */}
      <div className="flex-1 flex items-center justify-center">
        <AboutSection />
      </div>
    </div>
  );
}
