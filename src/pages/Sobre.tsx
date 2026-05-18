import { AboutSection } from "@/components/ui/about-section";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center pt-20">
        <AboutSection />
      </div>
    </div>
  );
}
