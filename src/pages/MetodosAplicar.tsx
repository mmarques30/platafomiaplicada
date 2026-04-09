import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { useMetodos } from "@/hooks/useFerramentas";
import { Search, Zap, BookOpen, FileText, ExternalLink, ArrowLeft, Users, Sparkles } from "lucide-react";
import { ARSENAL_FERRAMENTAS, ARSENAL_NIVEIS, ARSENAL_TIPOS } from "@/lib/metodosCategories";
import { PageTitle } from "@/components/shared/PageTitle";
import { MateriaisBibliotecaTab } from "@/components/biblioteca/MateriaisBibliotecaTab";

export default function MetodosAplicar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "skills";
  
  const { data: metodos, isLoading } = useMetodos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFerramenta, setSelectedFerramenta] = useState<string | null>(null);
  const [selectedBibliotecaTipo, setSelectedBibliotecaTipo] = useState<string | null>(null);

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
      if (s.ferramenta && counts[s.ferramenta] !== undefined) {
        counts[s.ferramenta]++;
      }
    });
    return counts;
  }, [skills]);

  // Filtrar skills pela ferramenta selecionada
  const filteredSkills = useMemo(() => {
    let items = skills;
    if (selectedFerramenta) {
      items = items.filter(s => s.ferramenta === selectedFerramenta);
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

  const getNivelBadge = (nivel: string | null) => {
    const found = ARSENAL_NIVEIS.find(n => n.value === nivel);
    if (!found) return null;
    return <Badge variant="outline" className={`text-xs ${found.color}`}>{found.label}</Badge>;
  };

  const getTipoBadge = (tipo: string | null) => {
    const found = ARSENAL_TIPOS.find(t => t.value === tipo);
    if (!found) return null;
    return <Badge variant="outline" className="text-xs">{found.label}</Badge>;
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 min-w-0 overflow-hidden">
      <div className="mb-6 md:mb-8">
        <PageTitle primary="Arsenal" secondary="IA" />
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Skills, prompts e recursos para maximizar sua inteligência artificial
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 mb-6">
          <TabsTrigger 
            value="skills"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Zap className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger 
            value="biblioteca"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <BookOpen className="h-4 w-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger 
            value="materiais"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Users className="h-4 w-4" />
            Materiais
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
                    {ARSENAL_FERRAMENTAS.find(f => f.value === selectedFerramenta)?.icon}
                    Skills para {selectedFerramenta}
                  </h2>
                  <p className="text-sm text-muted-foreground">{filteredSkills.length} skill(s) disponível(is)</p>
                </div>
              </div>

              {/* Busca */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Grid de skills */}
              {filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSkills.map(skill => (
                    <Card key={skill.id} className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{skill.titulo}</h3>
                        <FavoriteButton tipo="metodo" itemId={skill.id} variant="ghost" className="h-7 w-7 shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{skill.descricao}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-auto">
                        {getNivelBadge(skill.nivel)}
                        {skill.categoria && <Badge variant="secondary" className="text-xs">{skill.categoria}</Badge>}
                      </div>
                      {(skill.link_documento || skill.template) && (
                        <div className="flex gap-2 mt-1">
                          {skill.link_documento && (
                            <Button asChild size="sm" className="flex-1">
                              <a href={skill.link_documento} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                Acessar
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
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
              {/* Grid de ferramentas */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {ARSENAL_FERRAMENTAS.map(ferramenta => {
                  const count = contagemPorFerramenta[ferramenta.value] || 0;
                  return (
                    <Card 
                      key={ferramenta.value}
                      className={`p-5 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/40 flex flex-col items-center text-center gap-3 ${ferramenta.color}`}
                      onClick={() => setSelectedFerramenta(ferramenta.value)}
                    >
                      <span className="text-3xl">{ferramenta.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{ferramenta.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count} skill{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Últimas skills adicionadas */}
              {skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Últimas skills adicionadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skills.slice(0, 6).map(skill => (
                      <Card key={skill.id} className="p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm line-clamp-1 flex-1">{skill.titulo}</h3>
                          <FavoriteButton tipo="metodo" itemId={skill.id} variant="ghost" className="h-7 w-7 shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{skill.descricao}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {skill.ferramenta && (
                            <Badge variant="outline" className="text-xs">
                              {ARSENAL_FERRAMENTAS.find(f => f.value === skill.ferramenta)?.icon} {skill.ferramenta}
                            </Badge>
                          )}
                          {getNivelBadge(skill.nivel)}
                        </div>
                      </Card>
                    ))}
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
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar na biblioteca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
              {filteredBiblioteca.map(item => (
                <Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {item.imagem_url && (
                    <div className="h-36 bg-muted overflow-hidden">
                      <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{item.titulo}</h3>
                      <FavoriteButton tipo="metodo" itemId={item.id} variant="ghost" className="h-7 w-7 shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.descricao}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-auto">
                      {getTipoBadge(item.tipo)}
                      {getNivelBadge(item.nivel)}
                    </div>
                    {item.link_documento && (
                      <Button asChild size="sm" className="mt-1">
                        <a href={item.link_documento} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Acessar
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum item encontrado na biblioteca</p>
            </Card>
          )}
        </TabsContent>

        {/* Tab Materiais */}
        <TabsContent value="materiais" className="mt-0">
          <MateriaisBibliotecaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
