import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { useMetodos, useFerramentasIA } from "@/hooks/useFerramentas";
import { Zap, BookOpen, FileText, ExternalLink, ArrowLeft, Sparkles, Copy, Check } from "lucide-react";
import { ARSENAL_FERRAMENTAS, FERRAMENTA_INFO, normalizarFerramenta, ARSENAL_NIVEIS, ARSENAL_TIPOS } from "@/lib/metodosCategories";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { BarraFiltros } from "@/components/bibliotecas/BarraFiltros";
import { ChipMeta, ChipNivel } from "@/components/bibliotecas/ChipsRecurso";
import { CartaoRecurso, MarcadorCapa } from "@/components/bibliotecas/CartaoRecurso";
import type { Database } from "@/integrations/supabase/types";
import { ModelosProntosTab } from "@/components/bibliotecas/ModelosProntosTab";
import { toast } from "sonner";

type MetodoAplicar = Database["public"]["Tables"]["metodos_aplicar"]["Row"];

export default function MetodosAplicar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "skills";
  
  const { data: metodos, isLoading } = useMetodos();
  const { data: ferramentasIA } = useFerramentasIA();

  // Logo da ferramenta: primeiro o cadastro da Biblioteca de Ferramentas
  // (logo_url / link), depois o logo local ou o favicon do site oficial.
  const logoProps = (nome: string) => {
    const alvo = normalizarFerramenta(nome) ?? nome;
    const daBase = (ferramentasIA || []).find((f: any) => normalizarFerramenta(f.nome) === alvo);
    const info = FERRAMENTA_INFO[alvo];
    return {
      logoUrl: daBase?.logo_url || info?.logo || null,
      linkFerramenta: daBase?.link_ferramenta || info?.link || null,
    };
  };
  /*
   * O cartão de uma skill, num lugar só.
   *
   * A mesma skill era desenhada de dois jeitos na mesma aba: um cartão na
   * lista e outro, menor e com outra hierarquia, em "últimas adicionadas".
   * Quem via as últimas e depois abria a lista via a mesma coisa duas vezes,
   * com duas caras. Agora é o cartão padrão das bibliotecas, nos dois.
   */
  const cartaoDeSkill = (skill: MetodoAplicar) => {
    const daFerramenta = skill.ferramenta ? logoProps(skill.ferramenta) : null;
    return (
      <CartaoRecurso
        key={skill.id}
        chaveCapa={skill.titulo}
        marcador={
          daFerramenta ? (
            <ToolLogo
              logoUrl={daFerramenta.logoUrl}
              toolName={skill.ferramenta as string}
              linkFerramenta={daFerramenta.linkFerramenta}
              size="lg"
              className="border border-border/70 bg-card/80 backdrop-blur"
            />
          ) : (
            <MarcadorCapa>
              <Zap className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </MarcadorCapa>
          )
        }
        capaRotulo={skill.categoria || "Skill"}
        capaTitulo={skill.ferramenta || "Qualquer ferramenta"}
        titulo={skill.titulo}
        descricao={skill.descricao}
        favorito={<FavoriteButton tipo="metodo" itemId={skill.id} variant="icon-only" size="sm" />}
        rodape={<ChipNivel nivel={skill.nivel} />}
        aoClicar={() => setDetailItem(skill)}
      />
    );
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFerramenta, setSelectedFerramenta] = useState<string | null>(null);
  const [selectedBibliotecaTipo, setSelectedBibliotecaTipo] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Conteúdo copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione manualmente.");
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "skills") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", value);
    }
    setSearchParams(searchParams);
    setSelectedFerramenta(null);
    setSelectedBibliotecaTipo(null);
    setSearchTerm("");
  };

  // Separar itens por tipo
  const skills = useMemo(() => 
    (metodos || []).filter(m => !m.tipo || m.tipo === "skill"), [metodos]
  );

  const bibliotecaItems = useMemo(() => 
    (metodos || []).filter(m => m.tipo && ["prompt_master", "artigo", "documento"].includes(m.tipo)), [metodos]
  );

  // Contagem por ferramenta
  const contagemPorFerramenta = useMemo(() => {
    const counts: Record<string, number> = {};
    ARSENAL_FERRAMENTAS.forEach(f => { counts[f.value] = 0; });
    skills.forEach(s => {
      const f = normalizarFerramenta(s.ferramenta);
      if (f && counts[f] !== undefined) {
        counts[f]++;
      }
    });
    return counts;
  }, [skills]);

  // Filtrar skills pela ferramenta selecionada. "todas" → todas as skills
  // (inclui as que não têm ferramenta associada).
  const filteredSkills = useMemo(() => {
    let items = skills;
    if (selectedFerramenta && selectedFerramenta !== "todas") {
      items = items.filter(s => normalizarFerramenta(s.ferramenta) === selectedFerramenta);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(s =>
        s.titulo.toLowerCase().includes(term) ||
        s.descricao.toLowerCase().includes(term)
      );
    }
    return items;
  }, [skills, selectedFerramenta, searchTerm]);

  // Filtrar biblioteca por sub-tipo
  const filteredBiblioteca = useMemo(() => {
    let items = bibliotecaItems;
    if (selectedBibliotecaTipo) {
      items = items.filter(b => b.tipo === selectedBibliotecaTipo);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(b => 
        b.titulo.toLowerCase().includes(term) || 
        b.descricao.toLowerCase().includes(term)
      );
    }
    return items;
  }, [bibliotecaItems, selectedBibliotecaTipo, searchTerm]);

  // O nível era verde, âmbar ou vermelho, o que fazia "avançado" parecer um
  // defeito do item em vez de uma escala. Agora são três traços na cor da
  // marca, iguais aos da biblioteca de prompts.
  const getNivelBadge = (nivel: string | null) => {
    if (nivel) return <ChipNivel nivel={nivel} />;
    const found = ARSENAL_NIVEIS.find(n => n.value === nivel);
    if (!found) return null;
    return <Badge variant="outline" className={`text-xs ${found.color}`}>{found.label}</Badge>;
  };

  const getTipoBadge = (tipo: string | null) => {
    const found = ARSENAL_TIPOS.find(t => t.value === tipo);
    if (!found) return null;
    return <ChipMeta>{found.label}</ChipMeta>;
  };

  return (
    <PageContainer className="min-w-0 overflow-hidden">
      <PageTitle
        primary="Métodos"
        secondary="práticos"
        description="O passo a passo de quem já aplica IA no trabalho, com os modelos e o material prontos para você seguir."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:inline-flex md:w-auto mb-6">
          <TabsTrigger 
            value="skills"
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Zap className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger 
            value="biblioteca"
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <BookOpen className="h-4 w-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger
            value="modelos"
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Copy className="h-4 w-4" />
            Modelos
          </TabsTrigger>
        </TabsList>

        {/* ============ Tab Skills ============ */}
        <TabsContent value="skills" className="mt-0 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="p-6"><Skeleton className="h-16 w-full" /></Card>
              ))}
            </div>
          ) : selectedFerramenta ? (
            <>
              {/* Header com voltar */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSelectedFerramenta(null); setSearchTerm(""); }}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {selectedFerramenta === "todas" ? (
                      <>
                        <Sparkles className="h-5 w-5 text-brand-strong" />
                        Todas as skills
                      </>
                    ) : (
                      <>
                        {ARSENAL_FERRAMENTAS.find(f => f.value === selectedFerramenta)?.icon}
                        Skills para {selectedFerramenta}
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">{filteredSkills.length} skill(s) disponível(is)</p>
                </div>
              </div>

              <BarraFiltros
                busca={searchTerm}
                aoBuscar={setSearchTerm}
                placeholderBusca="Buscar skills"
                total={filteredSkills.length}
                substantivo="skill"
              />

              {/* Grid de skills */}
              {filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSkills.map(skill => cartaoDeSkill(skill))}
                </div>
              ) : (
                <Card className="flex flex-col items-center justify-center py-12">
                  <Zap className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma skill encontrada</p>
                </Card>
              )}
            </>
          ) : (
            <>
              {/*
                A escolha da ferramenta.
                
                Eram cartões do shadcn com padding escrito à mão e a contagem
                em texto cinza comum: a primeira coisa que a aba mostra, e a
                única que não falava a língua do resto. Agora são ladrilhos de
                superfície, com o logo grande, o nome e a contagem em mono —
                e a contagem vira o dado, não uma legenda.
              */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <LadrilhoFerramenta
                  rotulo="Todas"
                  contagem={skills.length}
                  aoClicar={() => setSelectedFerramenta("todas")}
                  marcador={
                    <span className="grid h-14 w-14 place-items-center rounded-xl border border-border/70 bg-surface">
                      <Sparkles className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </span>
                  }
                />

                {ARSENAL_FERRAMENTAS.map(ferramenta => (
                  <LadrilhoFerramenta
                    key={ferramenta.value}
                    rotulo={ferramenta.label}
                    contagem={contagemPorFerramenta[ferramenta.value] || 0}
                    aoClicar={() => setSelectedFerramenta(ferramenta.value)}
                    marcador={
                      <ToolLogo
                        toolName={ferramenta.label}
                        {...logoProps(ferramenta.value)}
                        size="lg"
                        className="border border-border/70 bg-surface"
                      />
                    }
                  />
                ))}
              </div>

              {/* Últimas skills adicionadas */}
              {skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Últimas skills adicionadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.slice(0, 6).map(skill => cartaoDeSkill(skill))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ============ Tab Biblioteca ============ */}
        <TabsContent value="biblioteca" className="mt-0 space-y-6">
          {/* Sub-filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={!selectedBibliotecaTipo ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedBibliotecaTipo(null)}
              >
                Todos ({bibliotecaItems.length})
              </Button>
              {ARSENAL_TIPOS.filter(t => t.value !== "skill").map(tipo => {
                const count = bibliotecaItems.filter(b => b.tipo === tipo.value).length;
                return (
                  <Button 
                    key={tipo.value}
                    variant={selectedBibliotecaTipo === tipo.value ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedBibliotecaTipo(tipo.value)}
                  >
                    {tipo.label} ({count})
                  </Button>
                );
              })}
            </div>
            <div className="flex-1">
              <BarraFiltros
                busca={searchTerm}
                aoBuscar={setSearchTerm}
                placeholderBusca="Buscar na biblioteca"
                total={filteredBiblioteca.length}
                substantivo="item"
              />
            </div>
          </div>

          {/* Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <Card key={i} className="p-5"><Skeleton className="h-24 w-full" /></Card>
              ))}
            </div>
          ) : filteredBiblioteca.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBiblioteca.map(item => {
                const tipo = ARSENAL_TIPOS.find(t => t.value === item.tipo);
                return (
                  <CartaoRecurso
                    key={item.id}
                    chaveCapa={item.titulo}
                    imagemUrl={item.imagem_url}
                    marcador={
                      <MarcadorCapa>
                        <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
                      </MarcadorCapa>
                    }
                    capaRotulo={item.categoria || "Biblioteca"}
                    capaTitulo={tipo?.label ?? "Material"}
                    titulo={item.titulo}
                    descricao={item.descricao}
                    favorito={
                      <FavoriteButton tipo="metodo" itemId={item.id} variant="icon-only" size="sm" />
                    }
                    rodape={<ChipNivel nivel={item.nivel} />}
                    aoClicar={() => setDetailItem(item)}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum item encontrado na biblioteca</p>
            </Card>
          )}
        </TabsContent>

        {/* Tab Materiais */}
        {/* ============ Tab Modelos ============ */}
        <TabsContent value="modelos" className="mt-0">
          <ModelosProntosTab />
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes — exibe template/prompt copiável + link + metadados */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-brand-cream-soft border-brand-hairline">
          {detailItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif-display text-2xl text-foreground leading-tight tracking-tight pr-6">
                  {detailItem.titulo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {detailItem.tipo && getTipoBadge(detailItem.tipo)}
                  {detailItem.nivel && getNivelBadge(detailItem.nivel)}
                  {detailItem.ferramenta && (
                    <Badge variant="outline" className="text-xs">
                      {ARSENAL_FERRAMENTAS.find(f => f.value === detailItem.ferramenta)?.icon} {detailItem.ferramenta}
                    </Badge>
                  )}
                  {detailItem.categoria && (
                    <ChipMeta>{detailItem.categoria}</ChipMeta>
                  )}
                </div>

                {/* Descrição */}
                {detailItem.descricao && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium mb-1.5">
                      Descrição
                    </p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {detailItem.descricao}
                    </p>
                  </div>
                )}

                {/* Template/Prompt — o conteúdo que estava escondido */}
                {detailItem.template && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
                        Prompt / Template
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleCopy(detailItem.template)}
                        className="h-7 bg-brand-strong hover:bg-brand-strong/90 text-brand-cream rounded-full px-3 text-xs"
                      >
                        {copied ? (
                          <><Check className="h-3.5 w-3.5 mr-1" />Copiado</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5 mr-1" />Copiar</>
                        )}
                      </Button>
                    </div>
                    <pre className="text-sm text-foreground whitespace-pre-wrap bg-background border border-brand-hairline rounded-xl p-4 font-sans leading-relaxed select-text">
                      {detailItem.template}
                    </pre>
                  </div>
                )}

                {/* Link documento */}
                {detailItem.link_documento && (
                  <Button asChild className="bg-brand-strong hover:bg-brand-strong/90 text-brand-cream w-full sm:w-auto">
                    <a
                      href={detailItem.link_documento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      Acessar documento
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                )}

                {!detailItem.template && !detailItem.link_documento && (
                  <p className="text-sm text-muted-foreground italic">
                    Sem conteúdo adicional disponível para este item.
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

/**
 * Um ladrilho de escolha de ferramenta.
 *
 * É a porta de entrada da aba Skills: seis quadrados que filtram a lista.
 * Como só precisam dizer "qual ferramenta" e "quantas skills", não levam
 * capa — levam a superfície da plataforma, o logo grande e a contagem em
 * mono, que é como o resto do sistema escreve número.
 */
function LadrilhoFerramenta({
  rotulo,
  contagem,
  marcador,
  aoClicar,
}: {
  rotulo: string;
  contagem: number;
  marcador: React.ReactNode;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="superficie superficie-interativa group flex flex-col items-center gap-3 p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {marcador}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          {rotulo}
        </span>
        <span className="rotulo-mono mt-1 block text-[10px]">
          {contagem} {contagem === 1 ? "skill" : "skills"}
        </span>
      </span>
    </button>
  );
}
