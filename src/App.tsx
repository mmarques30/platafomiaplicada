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
import { EnvironmentProvider } from "./contexts/EnvironmentContext";
import Auth from "./pages/Auth";
import Servicos from "./pages/Servicos";
import EnvironmentSelector from "./pages/EnvironmentSelector";
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
import SkillsDiagnostico from "./pages/skills/SkillsDiagnostico";
import SkillsEquipe from "./pages/skills/SkillsEquipe";
import SkillsBacklog from "./pages/skills/SkillsBacklog";
import SkillsRoadmap from "./pages/skills/SkillsRoadmap";
import SkillsEntregas from "./pages/skills/SkillsEntregas";
import SkillsLiderDashboard from "./pages/skills/SkillsLiderDashboard";

import MentoriaSessoes from "./pages/MentoriaSessoes";
import MentoriaRecursos from "./pages/MentoriaRecursos";
import MentoriaProjetos from "./pages/MentoriaProjetos";
import MentoriaTarefas from "./pages/MentoriaTarefas";
import MentoriaDuvidas from "./pages/MentoriaDuvidas";
import MentoriaPainelDiagnostico from "./pages/MentoriaPainelDiagnostico";
import MentoriaProcesso from "./pages/MentoriaProcesso";
import MentoriaEtapa from "./pages/MentoriaEtapa";
import MentoriaEtapasBusiness from "./pages/MentoriaEtapasBusiness";
import MentoriaInstrucoesBusiness from "./pages/MentoriaInstrucoesBusiness";
import MentoriaTasksBusiness from "./pages/MentoriaTasksBusiness";
import MentoriaValidacoes from "./pages/MentoriaValidacoes";
import MentoriaReports from "./pages/MentoriaReports";
import MentoriaDocumentos from "./pages/MentoriaDocumentos";
import MentoriaEntregas from "./pages/MentoriaEntregas";
import MentoriaEntregaDetalhe from "./pages/MentoriaEntregaDetalhe";
import FormulariosDisponiveis from "./pages/FormulariosDisponiveis";
import ResponderFormulario from "./pages/ResponderFormulario";
import IACopieUse from "./pages/IACopieUse";
import BibliotecaFerramentas from "./pages/BibliotecaFerramentas";
import BibliotecaPrompts from "./pages/BibliotecaPrompts";
import MetodosAplicar from "./pages/MetodosAplicar";
import Sobre from "./pages/Sobre";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
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
import AdminEtapaBusinessPage from "./pages/admin/mentoria/AdminEtapaBusinessPage";
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
import CandidatarMentoria from "./pages/CandidatarMentoria";
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
import Cupons from "./pages/Cupons";
import AcessoExpirado from "./pages/AcessoExpirado";
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
        <Route path="/selecionar-ambiente" element={<EnvironmentSelector />} />
        <Route path="/formularioaplica" element={<FormularioAplica />} />
        <Route path="/termos-uso" element={<PoliticaUso />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/acesso-expirado" element={<AcessoExpirado />} />
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
            <Route path="/meu-diagnostico" element={<MeuDiagnostico />} />
            <Route path="/minhas-duvidas" element={<MinhasDuvidas />} />
            <Route path="/diagnostico/formulario" element={<MentoriaDiagnostico />} />
            <Route path="/diagnostico/painel" element={<DiagnosticoPainelAcademy />} />
            
            {/* Skills routes */}
            <Route path="/skills/diagnostico" element={<SkillsDiagnostico />} />
            <Route path="/skills/equipe" element={<SkillsEquipe />} />
            <Route path="/skills/backlog" element={<SkillsBacklog />} />
            <Route path="/skills/roadmap" element={<SkillsRoadmap />} />
            <Route path="/skills/entregas" element={<SkillsEntregas />} />
            <Route path="/skills/lider" element={<SkillsLiderDashboard />} />
            <Route path="/skills/entregas" element={<SkillsEntregas />} />
            
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
            <Route path="/mentoria/etapa/:etapaId" element={<MentoriaEtapa />} />
            <Route path="/mentoria/etapas-business" element={<MentoriaEtapasBusiness />} />
            <Route path="/mentoria/instrucoes-business" element={<MentoriaInstrucoesBusiness />} />
            <Route path="/mentoria/tasks-business" element={<MentoriaTasksBusiness />} />
            <Route path="/mentoria/validacoes" element={<MentoriaValidacoes />} />
            <Route path="/mentoria/reports" element={<MentoriaReports />} />
            <Route path="/mentoria/entregas" element={<MentoriaEntregas />} />
            <Route path="/mentoria/entrega/:entregaId" element={<MentoriaEntregaDetalhe />} />
            <Route path="/mentoria/documentos" element={<MentoriaDocumentos />} />
            <Route path="/ia-copie-use" element={<IACopieUse />} />
            <Route path="/biblioteca-ferramentas" element={<BibliotecaFerramentas />} />
            <Route path="/biblioteca-prompts" element={<BibliotecaPrompts />} />
            <Route path="/metodos-aplicar" element={<MetodosAplicar />} />
            <Route path="/comunidade" element={<Comunidade />} />
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
            <Route path="visitantes" element={<GerenciarVisitantes />} />
            <Route path="conteudo" element={<GerenciarConteudo />} />
            <Route path="bibliotecas" element={<GerenciarBibliotecas />} />
            <Route path="avisos" element={<GerenciarAvisos />} />
            <Route path="conhecimento" element={<GerenciarConhecimento />} />
            <Route path="mentoria/bonus" element={<MentoriaBonusPage />} />
            <Route path="mentoria/academy" element={<MentoriaAcademyPage />} />
            <Route path="mentoria/business" element={<MentoriaBusinessPage />} />
            <Route path="mentoria/business/etapa/:etapaId" element={<AdminEtapaBusinessPage />} />
            <Route path="mentoria/preview-paineis" element={<PreviewPaineisPage />} />
            <Route path="duvidas" element={<GerenciarTodasDuvidas />} />
            <Route path="produtos" element={<GerenciarProdutos />} />
            <Route path="materiais" element={<GerenciarMateriais />} />
            <Route path="formularios" element={<VisualizarFormularios />} />
            <Route path="minhas-tarefas" element={<MinhasTarefas />} />
            <Route path="menus" element={<GerenciarMenus />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route path="importar-usuarios" element={<ImportarUsuarios />} />
            <Route path="comunidade" element={<GerenciarComunidade />} />
            <Route path="politicas" element={<GerenciarPoliticas />} />
            <Route path="pesquisas" element={<GerenciarPesquisas />} />
            <Route path="historico-senhas" element={<HistoricoSenhas />} />
            <Route path="permissoes-equipe" element={<GerenciarPermissoesEquipe />} />
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
            <EnvironmentProvider>
              <AppContent />
            </EnvironmentProvider>
          </AdminViewProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
