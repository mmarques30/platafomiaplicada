import { TextParallaxContent, ExampleContent } from "@/components/ui/text-parallax-content";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ArrowUpRight } from "lucide-react";

const Servicos = () => {
  return (
    <div className="bg-[#1a1c19]">
      <AuthHeader />
      
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
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
            <a
              href="/aplique"
              className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
            >
              Saiba mais <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop"
        subheading="Skills"
        heading="Elimine 10-20h/semana de tarefas manuais."
      >
        <ExampleContent>
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-white">
            IAplicada Skills
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-400 md:text-2xl">
              A solução que elimina especificamente 10-20h/semana de tarefas manuais de equipes operacionais de 3-15 pessoas em empresas em crescimento, trocando planilhas + processos repetitivos por automações práticas que rodam no dia a dia, em 12 semanas, sem exigir conhecimento técnico ou consultoria cara.
            </p>
            <a
              href="/avance"
              className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
            >
              Saiba mais <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
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
            <a
              href="/avance"
              className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
            >
              Saiba mais <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>
    </div>
  );
};

export default Servicos;
