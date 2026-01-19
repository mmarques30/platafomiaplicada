import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TrocarSenhaModal } from "./components/auth/TrocarSenhaModal";
import { useAuth } from "./hooks/useAuth";
import { useVersionCheck } from "./hooks/useVersionCheck";
import { AdminViewProvider } from "./contexts/AdminViewContext";
import Auth from "./pages/Auth";
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
import Ecossistema from "./pages/Ecossistema";
import Mentoria from "./pages/Mentoria";
import MentoriaDiagnostico from "./pages/MentoriaDiagnostico";
import MeuDiagnostico from "./pages/MeuDiagnostico";
import DiagnosticoPainelAcademy from "./pages/DiagnosticoPainelAcademy";
import MinhasDuvidas from "./pages/MinhasDuvidas";

import MentoriaSessoes from "./pages/MentoriaSessoes";
import MentoriaRecursos from "./pages/MentoriaRecursos";
import MentoriaProjetos from "./pages/MentoriaProjetos";
import MentoriaTarefas from "./pages/MentoriaTarefas";
import MentoriaDuvidas from "./pages/MentoriaDuvidas";
import MentoriaPainelDiagnostico from "./pages/MentoriaPainelDiagnostico";
import MentoriaProcesso from "./pages/MentoriaProcesso";
import FormulariosDisponiveis from "./pages/FormulariosDisponiveis";
import ResponderFormulario from "./pages/ResponderFormulario";
import IACopieUse from "./pages/IACopieUse";
import BibliotecaFerramentas from "./pages/BibliotecaFerramentas";
import BibliotecaPrompts from "./pages/BibliotecaPrompts";
import MetodosAplicar from "./pages/MetodosAplicar";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEnvironmentSelector from "./pages/admin/AdminEnvironmentSelector";
import ProjetosDashboard from "./pages/admin/ProjetosDashboard";
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import CadastrarUsuario from "./pages/admin/CadastrarUsuario";
import GerenciarConteudo from "./pages/admin/GerenciarConteudo";
import GerenciarBibliotecas from "./pages/admin/GerenciarBibliotecas";
import GerenciarAvisos from "./pages/admin/GerenciarAvisos";
import VisualizarFormularios from "./pages/admin/VisualizarFormularios";
import GerenciarConhecimento from "./pages/admin/GerenciarConhecimento";
import GerenciarMentoria from "./pages/admin/GerenciarMentoria";
import MentoriaBonusPage from "./pages/admin/mentoria/MentoriaBonusPage";
import MentoriaAcademyPage from "./pages/admin/mentoria/MentoriaAcademyPage";
import MentoriaBusinessPage from "./pages/admin/mentoria/MentoriaBusinessPage";
import PreviewPaineisPage from "./pages/admin/mentoria/PreviewPaineisPage";
import GerenciarProdutos from "./pages/admin/GerenciarProdutos";
import MinhasTarefas from "./pages/admin/MinhasTarefas";
import Auditoria from "./pages/admin/Auditoria";
import GerenciarMenus from "./pages/admin/GerenciarMenus";
import ImportarUsuarios from "./pages/admin/ImportarUsuarios";
import GerenciarComunidade from "./pages/admin/GerenciarComunidade";
import GerenciarTodasDuvidas from "./pages/admin/GerenciarTodasDuvidas";
import Comunidade from "./pages/Comunidade";
import GerenciarVisitantes from "./pages/admin/GerenciarVisitantes";
import MateriaisGratuitos from "./pages/MateriaisGratuitos";
import GerenciarMateriais from "./pages/admin/GerenciarMateriais";
import Aplique from "./pages/Aplique";
import Avance from "./pages/Avance";
import CandidatarMentoria from "./pages/CandidatarMentoria";
import GerenciarCandidaturas from "./pages/admin/GerenciarCandidaturas";
import VideosBonus from "./pages/VideosBonus";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaServicos from "./pages/PoliticaServicos";
import PoliticaUso from "./pages/PoliticaUso";
import GerenciarPoliticas from "./pages/admin/GerenciarPoliticas";
import GerenciarPesquisas from "./pages/admin/GerenciarPesquisas";
import FormularioAplica from "./pages/FormularioAplica";
import Instalar from "./pages/Instalar";
import Central from "./pages/Central";
import RedefinirSenha from "./pages/RedefinirSenha";
import HistoricoSenhas from "./pages/admin/HistoricoSenhas";
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
        <Route path="/aplique" element={<Aplique />} />
        <Route path="/avance" element={<Avance />} />
        <Route path="/formularioaplica" element={<FormularioAplica />} />
        <Route path="/termos-uso" element={<PoliticaUso />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        

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
            <Route path="/meu-diagnostico" element={<MeuDiagnostico />} />
            <Route path="/minhas-duvidas" element={<MinhasDuvidas />} />
            <Route path="/diagnostico/formulario" element={<MentoriaDiagnostico />} />
            <Route path="/diagnostico/painel" element={<DiagnosticoPainelAcademy />} />
            <Route path="/ecossistema" element={<Ecossistema />} />
            <Route path="/mentoria" element={<Mentoria />} />
            <Route path="/mentoria/diagnostico" element={<MentoriaDiagnostico />} />
            <Route path="/mentoria/processo" element={<MentoriaProcesso />} />
            <Route path="/mentoria/painel-diagnostico" element={<MentoriaPainelDiagnostico />} />
            <Route path="/mentoria/painel-diagnostico/:userId" element={<MentoriaPainelDiagnostico />} />
            
            <Route path="/mentoria/sessoes" element={<MentoriaSessoes />} />
            <Route path="/mentoria/recursos" element={<MentoriaRecursos />} />
            <Route path="/mentoria/projetos" element={<MentoriaProjetos />} />
            <Route path="/mentoria/tarefas" element={<MentoriaTarefas />} />
            <Route path="/mentoria/duvidas" element={<MentoriaDuvidas />} />
            <Route path="/ia-copie-use" element={<IACopieUse />} />
            <Route path="/biblioteca-ferramentas" element={<BibliotecaFerramentas />} />
            <Route path="/biblioteca-prompts" element={<BibliotecaPrompts />} />
            <Route path="/metodos-aplicar" element={<MetodosAplicar />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/materiais-gratuitos" element={<MateriaisGratuitos />} />
            <Route path="/videos-bonus" element={<VideosBonus />} />
            <Route path="/central" element={<Central />} />
            <Route path="/instalar" element={<Instalar />} />
            <Route path="/politica-servicos" element={<PoliticaServicos />} />
          </Route>
          
          <Route path="/candidatar-mentoria" element={<CandidatarMentoria />} />
          
          <Route path="/admin" element={<ProtectedRoute requireAnyRole={["admin", "equipe"]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminEnvironmentSelector />} />
            
            {/* Ambiente Projetos - acessível por admin e equipe */}
            <Route path="projetos" element={<ProjetosDashboard />} />
            <Route path="projetos/tarefas" element={<MinhasTarefas />} />
            
            {/* Ambiente Gestão - apenas admin */}
            <Route path="gestao" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="gestao/usuarios" element={<ProtectedRoute requireRole="admin"><GerenciarUsuarios /></ProtectedRoute>} />
            <Route path="gestao/visitantes" element={<ProtectedRoute requireRole="admin"><GerenciarVisitantes /></ProtectedRoute>} />
            <Route path="gestao/candidaturas" element={<ProtectedRoute requireRole="admin"><GerenciarCandidaturas /></ProtectedRoute>} />
            <Route path="gestao/conteudo" element={<ProtectedRoute requireRole="admin"><GerenciarConteudo /></ProtectedRoute>} />
            <Route path="gestao/bibliotecas" element={<ProtectedRoute requireRole="admin"><GerenciarBibliotecas /></ProtectedRoute>} />
            <Route path="gestao/avisos" element={<ProtectedRoute requireRole="admin"><GerenciarAvisos /></ProtectedRoute>} />
            <Route path="gestao/conhecimento" element={<ProtectedRoute requireRole="admin"><GerenciarConhecimento /></ProtectedRoute>} />
            <Route path="gestao/mentoria/bonus" element={<ProtectedRoute requireRole="admin"><MentoriaBonusPage /></ProtectedRoute>} />
            <Route path="gestao/mentoria/academy" element={<ProtectedRoute requireRole="admin"><MentoriaAcademyPage /></ProtectedRoute>} />
            <Route path="gestao/mentoria/business" element={<ProtectedRoute requireRole="admin"><MentoriaBusinessPage /></ProtectedRoute>} />
            <Route path="gestao/mentoria/preview-paineis" element={<ProtectedRoute requireRole="admin"><PreviewPaineisPage /></ProtectedRoute>} />
            <Route path="gestao/duvidas" element={<ProtectedRoute requireRole="admin"><GerenciarTodasDuvidas /></ProtectedRoute>} />
            <Route path="gestao/produtos" element={<ProtectedRoute requireRole="admin"><GerenciarProdutos /></ProtectedRoute>} />
            <Route path="gestao/materiais" element={<ProtectedRoute requireRole="admin"><GerenciarMateriais /></ProtectedRoute>} />
            <Route path="gestao/formularios" element={<ProtectedRoute requireRole="admin"><VisualizarFormularios /></ProtectedRoute>} />
            <Route path="gestao/menus" element={<ProtectedRoute requireRole="admin"><GerenciarMenus /></ProtectedRoute>} />
            <Route path="gestao/auditoria" element={<ProtectedRoute requireRole="admin"><Auditoria /></ProtectedRoute>} />
            <Route path="gestao/importar-usuarios" element={<ProtectedRoute requireRole="admin"><ImportarUsuarios /></ProtectedRoute>} />
            <Route path="gestao/comunidade" element={<ProtectedRoute requireRole="admin"><GerenciarComunidade /></ProtectedRoute>} />
            <Route path="gestao/politicas" element={<ProtectedRoute requireRole="admin"><GerenciarPoliticas /></ProtectedRoute>} />
            <Route path="gestao/pesquisas" element={<ProtectedRoute requireRole="admin"><GerenciarPesquisas /></ProtectedRoute>} />
            <Route path="gestao/historico-senhas" element={<ProtectedRoute requireRole="admin"><HistoricoSenhas /></ProtectedRoute>} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <BrowserRouter>
          <AdminViewProvider>
            <AppContent />
          </AdminViewProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
