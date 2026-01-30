import { TextParallaxContent, ExampleContent } from "@/components/ui/text-parallax-content";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Building2 } from "lucide-react";

const Servicos = () => {
  return (
    <div className="bg-[#1a1c19] min-h-screen">
      <AuthHeader />
      
      {/* Hero Section */}
      <div className="h-[40vh] flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Nossos <span className="text-[#9EB038]">Serviços</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Soluções práticas para transformar sua operação com inteligência artificial
          </p>
        </motion.div>
      </div>

      {/* Academy Section */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
        subheading="Academy"
        heading="A escola que transforma sua carreira."
      >
        <ExampleContent>
          <div className="bg-[#2a2c28] rounded-2xl p-8 md:p-12 border border-[#9EB038]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#9EB038]/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#9EB038]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">IAplicada Academy</h3>
            </div>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              A escola que transforma sua carreira e decola ela em <span className="text-[#9EB038] font-semibold">90 dias</span>: 
              APLICA+ e ferramentas IA testadas pra você produzir <span className="text-[#9EB038] font-semibold">2-3x mais</span>, 
              sem programação, sem tentativa e erro, atualizado todo mês com as novas IAs.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                90 dias de transformação
              </span>
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                Sem programação
              </span>
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                Atualizado mensalmente
              </span>
            </div>
            <a 
              href="/aplique" 
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#9EB038] text-black font-semibold rounded-xl hover:bg-[#C5D63D] transition-colors"
            >
              Conhecer Academy
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      {/* Skills Section */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop"
        subheading="Skills"
        heading="Elimine 10-20h/semana de tarefas manuais."
      >
        <ExampleContent>
          <div className="bg-[#2a2c28] rounded-2xl p-8 md:p-12 border border-[#9EB038]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#9EB038]/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#9EB038]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">IAplicada Skills</h3>
            </div>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              A solução que elimina especificamente <span className="text-[#9EB038] font-semibold">10-20h/semana</span> de 
              tarefas manuais de equipes operacionais de <span className="text-[#9EB038] font-semibold">3-15 pessoas</span> em 
              empresas em crescimento, trocando planilhas + processos repetitivos por automações práticas que rodam no dia a dia, 
              em <span className="text-[#9EB038] font-semibold">12 semanas</span>, sem exigir conhecimento técnico ou consultoria cara.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                10-20h/semana economizadas
              </span>
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                Equipes de 3-15 pessoas
              </span>
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                12 semanas
              </span>
            </div>
            <a 
              href="/avance" 
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#9EB038] text-black font-semibold rounded-xl hover:bg-[#C5D63D] transition-colors"
            >
              Conhecer Skills
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      {/* Business Section */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
        subheading="Business"
        heading="A única solução que organiza sua operação."
      >
        <ExampleContent>
          <div className="bg-[#2a2c28] rounded-2xl p-8 md:p-12 border border-[#9EB038]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#9EB038]/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#9EB038]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">IAplicada Business</h3>
            </div>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              É a única solução que organiza especificamente a operação, trocando o caos de 
              <span className="text-[#9EB038] font-semibold"> planilhas + WhatsApp + sistemas desconectados</span> por 
              uma plataforma centralizada que automatiza tarefas e dá visibilidade total, em 
              <span className="text-[#9EB038] font-semibold"> 30 dias</span>, sem enrolação, sem soluções engessadas, sem dev.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                Implementação em 30 dias
              </span>
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                Visibilidade total
              </span>
              <span className="px-4 py-2 bg-[#9EB038]/10 text-[#9EB038] rounded-full text-sm font-medium">
                Sem desenvolvedores
              </span>
            </div>
            <a 
              href="/avance" 
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#9EB038] text-black font-semibold rounded-xl hover:bg-[#C5D63D] transition-colors"
            >
              Conhecer Business
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </ExampleContent>
      </TextParallaxContent>

      {/* Footer CTA */}
      <div className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar sua operação?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Entre em contato e descubra qual solução é ideal para você
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#9EB038] text-black font-bold rounded-xl hover:bg-[#C5D63D] transition-colors text-lg"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Servicos;
