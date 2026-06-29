import { TextParallaxContent, ExampleContent } from "@/components/ui/text-parallax-content";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import academyParallaxBg from "@/assets/academy-parallax-bg.jpg";
import businessParallaxBg from "@/assets/business-parallax-bg.jpg";

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

  return (
    <div className="bg-[#1a1c19]">
      <AuthHeader />
      
      <TextParallaxContent
        imgUrl={academyParallaxBg}
        subheading="Academy"
        heading={<><span className="whitespace-nowrap font-bold">A escola que transforma</span><br /><span className="whitespace-nowrap font-bold">sua carreira.</span></>}
      >
        <ExampleContent>
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-white mt-8">
            IAplicada Academy
          </h2>
          <div className="col-span-1 md:col-span-8 mt-8">
            <p className="mb-4 text-base text-neutral-400 md:text-lg">
              A escola que transforma sua carreira e decola ela em 90 dias. Feita Para profissionais que querem ser 2-3x mais produtivos e indispensáveis na empresa, não mais uma plataforma de IAs soltas nem curso genérico de 6 horas. Acesse a versão gratuita da plataforma por tempo limitado ao se cadastrar.
            </p>
            <button
              onClick={handleAcademyClick}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1c19] border border-[#2a2c29] text-[#9EB038] font-medium rounded-sm hover:border-[#9EB038] transition-all duration-300 uppercase tracking-wider text-xs"
            >
              Saiba mais <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </button>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl={businessParallaxBg}
        subheading="Builder"
        heading="A única solução que organiza sua operação."
      >
        <ExampleContent>
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-white mt-8">
            IAplicada Builder
          </h2>
          <div className="col-span-1 md:col-span-8 mt-8">
            <p className="mb-4 text-base text-neutral-400 md:text-lg">
              É a única solução que organiza especificamente a operação, trocando o caos de planilhas + WhatsApp + sistemas desconectados por uma plataforma centralizada que automatiza tarefas e dá visibilidade total, em 30 dias, sem enrolação, sem soluções engessadas, sem dev.
            </p>
            <a
              href="https://iaplicada.com/business/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1c19] border border-[#2a2c29] text-[#9EB038] font-medium rounded-sm hover:border-[#9EB038] transition-all duration-300 uppercase tracking-wider text-xs"
            >
              Saber mais <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>
    </div>
  );
};

export default Servicos;
