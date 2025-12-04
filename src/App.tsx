import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TrocarSenhaModal } from "./components/auth/TrocarSenhaModal";
import { useAuth } from "./hooks/useAuth";
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
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import CadastrarUsuario from "./pages/admin/CadastrarUsuario";
import GerenciarConteudo from "./pages/admin/GerenciarConteudo";
import GerenciarBibliotecas from "./pages/admin/GerenciarBibliotecas";
import GerenciarAvisos from "./pages/admin/GerenciarAvisos";
import VisualizarFormularios from "./pages/admin/VisualizarFormularios";
import GerenciarConhecimento from "./pages/admin/GerenciarConhecimento";
import GerenciarMentoria from "./pages/admin/GerenciarMentoria";
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
import PoliticaVendas from "./pages/PoliticaVendas";
import PoliticaUso from "./pages/PoliticaUso";
import GerenciarPoliticas from "./pages/admin/GerenciarPoliticas";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/auth" element={<Auth />} />
          <Route path="/aplique" element={<Aplique />} />
          <Route path="/avance" element={<Avance />} />
          
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
            <Route path="/diagnostico/formulario" element={<MentoriaDiagnostico />} />
            <Route path="/diagnostico/painel" element={<MentoriaPainelDiagnostico />} />
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
            <Route path="/politicavendas" element={<PoliticaVendas />} />
            <Route path="/politicauso" element={<PoliticaUso />} />
          </Route>
          
          <Route path="/candidatar-mentoria" element={<CandidatarMentoria />} />
          
          <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<GerenciarUsuarios />} />
            <Route path="visitantes" element={<GerenciarVisitantes />} />
            <Route path="candidaturas" element={<GerenciarCandidaturas />} />
            <Route path="conteudo" element={<GerenciarConteudo />} />
            <Route path="bibliotecas" element={<GerenciarBibliotecas />} />
            <Route path="avisos" element={<GerenciarAvisos />} />
            <Route path="conhecimento" element={<GerenciarConhecimento />} />
            <Route path="mentoria" element={<GerenciarMentoria />} />
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
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
