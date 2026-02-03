import { TextParallaxContent, ExampleContent } from "@/components/ui/text-parallax-content";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import academyParallaxBg from "@/assets/academy-parallax-bg.jpg";
import businessParallaxBg from "@/assets/business-parallax-bg.jpg";
import skillsParallaxBg from "@/assets/skills-parallax-bg.jpg";

const Servicos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAcademyClick = () => {
    if (user) {
      navigate("/cupons");
    } else {
      navigate("/auth?tab=signup");
    }
  };

  const handleSpecialistClick = () => {
    window.open("https://wa.me/5511950566101", "_blank");
  };

  return (
    <div className="bg-[#1a1c19]">
      <AuthHeader />
      
      <TextParallaxContent
        imgUrl={academyParallaxBg}
        subheading="Academy"
        heading={<><span className="whitespace-nowrap font-bold">A escola que transforma</span><br /><span className="whitespace-nowrap font-bold">sua carreira.</span></>}
      >
        <ExampleContent>
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-white">
            IAplicada Academy
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-400 md:text-2xl">
              A escola que transforma sua carreira e decola ela em 90 dias. Feita Para profissionais que querem ser 2-3x mais produtivos e indispensáveis na empresa, não mais uma plataforma de IAs soltas nem curso genérico de 6 horas. Acesse a versão gratuita da plataforma por tempo limitado ao se cadastrar.
            </p>
            <button
              onClick={handleAcademyClick}
              className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
            >
              Saiba mais <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl={skillsParallaxBg}
        subheading="Skills"
        heading={<><span className="whitespace-nowrap font-bold">Sua equipe até 50%</span><br /><span className="whitespace-nowrap font-bold">mais produtiva</span></>}
      >
        <ExampleContent>
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-white">
            IAplicada Skills
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-400 md:text-2xl">
              A solução que elimina até 20h/semana de tarefas manuais de equipes, trocando planilhas + processos repetitivos por automações práticas que rodam no dia a dia, em 12 semanas. O Skills é para líderes que querem sua equipe performando ao máximo, resolvendo os problemas reais do dia a dia - não certificados individuais ou nem conhecimento teórico.
            </p>
            <button
              onClick={handleSpecialistClick}
              className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
            >
              Falar com especialista <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl={businessParallaxBg}
        subheading="Business"
        heading="A única solução que organiza sua operação."
      >
        <ExampleContent>
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-white">
            IAplicada Business
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-400 md:text-2xl">
              É a única solução que organiza especificamente a operação, trocando o caos de planilhas + WhatsApp + sistemas desconectados por uma plataforma centralizada que automatiza tarefas e dá visibilidade total, em 30 dias, sem enrolação, sem soluções engessadas, sem dev.
            </p>
            <button
              onClick={handleSpecialistClick}
              className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
            >
              Falar com especialista <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </ExampleContent>
      </TextParallaxContent>
    </div>
  );
};

export default Servicos;
