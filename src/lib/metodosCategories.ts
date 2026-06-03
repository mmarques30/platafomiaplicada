// Categorias padrão para Métodos de Aplicação (mantido para compatibilidade)
export const METODOS_CATEGORIAS = [
  "Produtividade",
  "Comunicação & Escrita",
  "Análise de Dados",
  "Gestão de Projetos",
  "Marketing",
  "Vendas",
  "Automação",
  "Apresentações",
  "Pesquisa & Conhecimento",
  "Criação de Conteúdo",
  "Atendimento ao Cliente",
  "Recursos Humanos",
] as const;

export type MetodoCategoria = typeof METODOS_CATEGORIAS[number];

// ==================== ARSENAL IA ====================

export const ARSENAL_TIPOS = [
  { value: "skill", label: "Skill" },
  { value: "prompt_master", label: "Prompt Master" },
  { value: "artigo", label: "Artigo" },
  { value: "documento", label: "Documento" },
] as const;

export const ARSENAL_FERRAMENTAS = [
  { value: "Claude", label: "Claude", icon: "🟠", color: "bg-orange-500/10 text-orange-700 border-orange-500/30" },
  { value: "ChatGPT", label: "ChatGPT", icon: "🟢", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  { value: "Gemini", label: "Gemini", icon: "🔵", color: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  { value: "Copilot", label: "Copilot", icon: "🟣", color: "bg-violet-500/10 text-violet-700 border-violet-500/30" },
  { value: "Perplexity", label: "Perplexity", icon: "🔷", color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30" },
] as const;

export const ARSENAL_NIVEIS = [
  { value: "iniciante", label: "Iniciante", color: "bg-green-500/10 text-green-700 border-green-500/30" },
  { value: "intermediario", label: "Intermediário", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
  { value: "avancado", label: "Avançado", color: "bg-red-500/10 text-red-700 border-red-500/30" },
] as const;

export type ArsenalTipo = typeof ARSENAL_TIPOS[number]["value"];
export type ArsenalFerramenta = typeof ARSENAL_FERRAMENTAS[number]["value"];
export type ArsenalNivel = typeof ARSENAL_NIVEIS[number]["value"];
