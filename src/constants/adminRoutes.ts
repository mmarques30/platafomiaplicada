/**
 * Constantes centralizadas de rotas administrativas
 * Usar estas constantes em vez de strings hardcoded para evitar navegações quebradas
 */

export const ADMIN_ROUTES = {
  // Seletor de ambientes
  selector: "/admin",
  
  // Ambiente Projetos
  projetos: {
    dashboard: "/admin/projetos",
    mentorados: "/admin/projetos/mentorados",
    tarefas: "/admin/projetos/minhas-tarefas",
    // Adicione mais rotas de projetos conforme necessário
  },
  
  // Ambiente Gestão (apenas admin)
  gestao: {
    dashboard: "/admin/gestao",
    
    // Usuários
    usuarios: "/admin/gestao/usuarios",
    cadastrarUsuario: "/admin/gestao/cadastrar-usuario",
    importarUsuarios: "/admin/gestao/importar-usuarios",
    visitantes: "/admin/gestao/visitantes",
    candidaturas: "/admin/gestao/candidaturas",
    
    // Conteúdo
    conteudo: "/admin/gestao/conteudo",
    bibliotecas: "/admin/gestao/bibliotecas",
    materiais: "/admin/gestao/materiais",
    
    // Mentoria
    mentoria: {
      bonus: "/admin/gestao/mentoria/bonus",
      academy: "/admin/gestao/mentoria/academy",
      business: "/admin/gestao/mentoria/business",
      previewPaineis: "/admin/gestao/mentoria/preview-paineis",
    },
    formularios: "/admin/gestao/formularios",
    duvidas: "/admin/gestao/duvidas",
    
    // Comunicação
    avisos: "/admin/gestao/avisos",
    comunidade: "/admin/gestao/comunidade",
    pesquisas: "/admin/gestao/pesquisas",
    
    // Gestão
    produtos: "/admin/gestao/produtos",
    
    // Sistema
    menus: "/admin/gestao/menus",
    auditoria: "/admin/gestao/auditoria",
    conhecimento: "/admin/gestao/conhecimento",
  },
} as const;

// Tipo para autocomplete
export type AdminRoutesType = typeof ADMIN_ROUTES;
