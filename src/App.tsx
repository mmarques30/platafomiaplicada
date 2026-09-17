import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useAuth } from "./hooks/useAuth";
import { useVersionCheck } from "./hooks/useVersionCheck";
import { AdminViewProvider } from "./contexts/AdminViewContext";
import { SkillsAdminTeamProvider } from "./contexts/SkillsAdminTeamContext";
import { EnvironmentProvider } from "./contexts/EnvironmentContext";
import Auth from "./pages/Auth";
import Servicos from "./pages/Servicos";
import Dashboard from "./pages/Dashboard";
import Trilhas from "./pages/Trilhas";
import TrilhaDetalhes from "./pages/TrilhaDetalhes";
import TrilhasNovidades from "./pages/TrilhasNovidades";
import Calendario from "./pages/Calendario";
import VideoPlayer from "./pages/VideoPlayer";
import Chat from "./pages/Chat";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import Favoritos from "./pages/Favoritos";
import Notificacoes from "./pages/Notificacoes";
import Evolucao from "./pages/Evolucao";
import EvolucaoConquistas from "./pages/EvolucaoConquistas";
import EvolucaoCertificados from "./pages/EvolucaoCertificados";
import MinhaHistoria from "./pages/MinhaHistoria";
import Ecossistema from "./pages/Ecossistema";
import Indica from "./pages/Indica";
import Encontros from "./pages/Encontros";
import Documentos from "./pages/Documentos";
import MentoriaDiagnostico from "./pages/MentoriaDiagnostico";
import MeuDiagnostico from "./pages/MeuDiagnostico";
import DiagnosticoPainelAcademy from "./pages/DiagnosticoPainelAcademy";
import MinhasDuvidas from "./pages/MinhasDuvidas";

// SkillsMeuProgresso removido - redirecionado para /skills/projeto
// Squad removido - Painel do Líder agora em /skills/lider

import IACopieUse from "./pages/IACopieUse";
import BibliotecaFerramentas from "./pages/BibliotecaFerramentas";
import BibliotecaPrompts from "./pages/BibliotecaPrompts";
import MetodosAplicar from "./pages/MetodosAplicar";
import Sobre from "./pages/Sobre";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import BusinessWelcome from "./pages/BusinessWelcome";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import ConvitesIndica from "./pages/admin/ConvitesIndica";

import OnboardingMonitor from "./pages/admin/OnboardingMonitor";
import GerenciarConteudo from "./pages/admin/GerenciarConteudo";
import GerenciarBibliotecas from "./pages/admin/GerenciarBibliotecas";
import GerenciarAvisos from "./pages/admin/GerenciarAvisos";
import GerenciarConhecimento from "./pages/admin/GerenciarConhecimento";


import MinhasTarefas from "./pages/admin/MinhasTarefas";
import Auditoria from "./pages/admin/Auditoria";
import GerenciarMenus from "./pages/admin/GerenciarMenus";
import GerenciarTodasDuvidas from "./pages/admin/GerenciarTodasDuvidas";
import MateriaisGratuitos from "./pages/MateriaisGratuitos";
import CandidatarMentoria from "./pages/CandidatarMentoria";
import VideosBonus from "./pages/VideosBonus";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaServicos from "./pages/PoliticaServicos";
import PoliticaUso from "./pages/PoliticaUso";
import GerenciarPoliticas from "./pages/admin/GerenciarPoliticas";
import FormularioAplica from "./pages/FormularioAplica";
import Instalar from "./pages/Instalar";
import Central from "./pages/Central";
import RedefinirSenha from "./pages/RedefinirSenha";
import Cupons from "./pages/Cupons";
import SemAcesso from "./pages/SemAcesso";
import HistoricoSenhas from "./pages/admin/HistoricoSenhas";
import GerenciarPermissoesEquipe from "./pages/admin/GerenciarPermissoesEquipe";
import { PWAUpdatePrompt } from "./components/shared/PWAUpdatePrompt";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();
  useVersionCheck();

  return (
    <>
      <Toaster />
      <Sonner />
      <PWAUpdatePrompt />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/formularioaplica" element={<FormularioAplica />} />
        <Route path="/termos-uso" element={<PoliticaUso />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/sem-acesso" element={<SemAcesso />} />
        {/* Rota antiga do visitante expirado: hoje todo cadastro gratuito cai em /sem-acesso */}
        <Route path="/acesso-expirado" element={<Navigate to="/sem-acesso" replace />} />
        <Route path="/onboarding-welcome" element={<OnboardingWelcome />} />
        <Route path="/welcome-business" element={<ProtectedRoute><BusinessWelcome /></ProtectedRoute>} />
        <Route path="/sobre" element={<Sobre />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/trilhas/novidades" element={<TrilhasNovidades />} />
            <Route path="/trilhas/:id" element={<TrilhaDetalhes />} />
            <Route path="/videos/:id" element={<VideoPlayer />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/notificacoes/calendario" element={<Calendario />} />
            <Route path="/evolucao" element={<Evolucao />} />
            <Route path="/evolucao/conquistas" element={<EvolucaoConquistas />} />
            <Route path="/evolucao/certificados" element={<EvolucaoCertificados />} />
            <Route path="/minha-historia" element={<MinhaHistoria />} />
            <Route path="/meu-diagnostico" element={<MeuDiagnostico />} />
            <Route path="/minhas-duvidas" element={<MinhasDuvidas />} />
            <Route path="/diagnostico/formulario" element={<MentoriaDiagnostico />} />
            <Route path="/diagnostico/painel" element={<DiagnosticoPainelAcademy />} />
            
            {/* Skills routes */}
            

            {/* Squad removido → redireciona para Skills */}

            {/* Aliases/redirects para evitar 404 por links antigos ou barra final */}
            
            <Route path="/ecossistema" element={<Ecossistema />} />
            <Route path="/indica" element={<Indica />} />
            <Route path="/encontros" element={<Encontros />} />
            <Route path="/documentos" element={<Documentos />} />
            
            <Route path="/ia-copie-use" element={<IACopieUse />} />
            <Route path="/biblioteca-ferramentas" element={<BibliotecaFerramentas />} />
            <Route path="/biblioteca-prompts" element={<BibliotecaPrompts />} />
            <Route path="/metodos-aplicar" element={<MetodosAplicar />} />
            <Route path="/materiais-gratuitos" element={<MateriaisGratuitos />} />
            <Route path="/videos-bonus" element={<VideosBonus />} />
            <Route path="/central" element={<Central />} />
            <Route path="/cupons" element={<Cupons />} />
            <Route path="/instalar" element={<Instalar />} />
            <Route path="/politica-servicos" element={<PoliticaServicos />} />
          </Route>
          
          <Route path="/candidatar-mentoria" element={<CandidatarMentoria />} />
          
          <Route path="/admin" element={<ProtectedRoute requireAnyRole={["admin", "equipe"]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<GerenciarUsuarios />} />
            <Route path="convites" element={<ConvitesIndica />} />
            <Route path="conteudo" element={<GerenciarConteudo />} />
            <Route path="bibliotecas" element={<GerenciarBibliotecas />} />
            <Route path="avisos" element={<GerenciarAvisos />} />
            <Route path="conhecimento" element={<GerenciarConhecimento />} />
            
            <Route path="duvidas" element={<GerenciarTodasDuvidas />} />
            <Route path="minhas-tarefas" element={<MinhasTarefas />} />
            <Route path="onboarding-monitor" element={<OnboardingMonitor />} />
            <Route path="menus" element={<GerenciarMenus />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route path="politicas" element={<GerenciarPoliticas />} />
            <Route path="historico-senhas" element={<HistoricoSenhas />} />
            <Route path="permissoes-equipe" element={<GerenciarPermissoesEquipe />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
        <TooltipProvider>
          <BrowserRouter>
            <AdminViewProvider>
              <EnvironmentProvider>
                <AppContent />
              </EnvironmentProvider>
            </AdminViewProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
