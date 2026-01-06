import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, Brain, Wrench, BookOpen } from "lucide-react";

const categoriasDuvidas = [
  {
    id: "ia-geral",
    titulo: "Inteligência Artificial",
    icon: Brain,
    duvidas: [
      {
        pergunta: "Por onde começar a aprender sobre IA?",
        resposta: "Recomendamos iniciar pela trilha 'Fundamentos de IA' que cobre os conceitos básicos e te prepara para aplicações práticas no seu dia a dia profissional."
      },
      {
        pergunta: "Qual a melhor IA para usar no trabalho?",
        resposta: "Depende do seu objetivo! Para textos e análises, o ChatGPT e Claude são excelentes. Para imagens, Midjourney e DALL-E. Consulte nossa seção de Ferramentas IA para recomendações específicas."
      },
      {
        pergunta: "É seguro usar IA com dados da empresa?",
        resposta: "Sim, desde que você tome cuidados como não inserir dados sensíveis em ferramentas gratuitas e usar versões empresariais quando disponíveis. Veja nosso módulo de Segurança com IA."
      }
    ]
  },
  {
    id: "prompts",
    titulo: "Prompts e Técnicas",
    icon: Lightbulb,
    duvidas: [
      {
        pergunta: "Como criar prompts mais eficientes?",
        resposta: "Use a técnica CAPE: Contexto, Ação, Perspectiva e Especificação. Quanto mais detalhado e específico, melhores resultados você terá."
      },
      {
        pergunta: "Existe um prompt universal?",
        resposta: "Não existe um prompt único, mas existem frameworks que funcionam bem para diferentes situações. Explore nossa Biblioteca de Prompts para encontrar templates prontos."
      }
    ]
  },
  {
    id: "ferramentas",
    titulo: "Ferramentas e Aplicações",
    icon: Wrench,
    duvidas: [
      {
        pergunta: "Quais ferramentas são gratuitas?",
        resposta: "ChatGPT (versão básica), Claude, Gemini, Canva AI, e várias outras oferecem planos gratuitos. Consulte nossa página de Ferramentas IA para ver o filtro de gratuitas."
      },
      {
        pergunta: "Como integrar IA no meu fluxo de trabalho?",
        resposta: "Comece identificando tarefas repetitivas ou que consomem muito tempo. Depois, experimente automatizá-las gradualmente. Nossa trilha de Produtividade com IA aborda isso em detalhes."
      }
    ]
  },
  {
    id: "produtividade",
    titulo: "Produtividade",
    icon: Zap,
    duvidas: [
      {
        pergunta: "Quanto tempo posso economizar com IA?",
        resposta: "Estudos mostram economia de 30-50% em tarefas de escrita, análise e criação de conteúdo. O ganho real depende de quão bem você domina as ferramentas."
      },
      {
        pergunta: "A IA vai substituir meu trabalho?",
        resposta: "A IA é uma ferramenta de potencialização, não substituição. Profissionais que dominam IA serão mais valorizados. O foco deve ser em como usar IA para amplificar suas habilidades."
      }
    ]
  },
  {
    id: "mentoria",
    titulo: "Mentoria e Suporte",
    icon: BookOpen,
    duvidas: [
      {
        pergunta: "Como funciona o suporte de dúvidas?",
        resposta: "Você pode enviar suas dúvidas pela aba 'Minhas Dúvidas'. Nossa equipe responde em até 48h úteis para membros Academy e até 24h para membros Club/Lab."
      },
      {
        pergunta: "Posso tirar dúvidas ao vivo?",
        resposta: "Sim! Membros Club e Lab têm acesso a sessões de mentoria ao vivo. Consulte o Calendário para ver os próximos encontros."
      }
    ]
  }
];

export function DuvidasAplicadasTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Dúvidas Frequentes da Comunidade
          </CardTitle>
          <CardDescription>
            Respostas para as perguntas mais comuns dos mentorados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {categoriasDuvidas.map((categoria) => (
              <AccordionItem key={categoria.id} value={categoria.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <categoria.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{categoria.titulo}</span>
                    <Badge variant="secondary" className="ml-2">
                      {categoria.duvidas.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-11 pt-2">
                    {categoria.duvidas.map((duvida, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="font-medium text-foreground">
                          {duvida.pergunta}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {duvida.resposta}
                        </p>
                        {idx < categoria.duvidas.length - 1 && (
                          <hr className="border-border/50 mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function HelpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
