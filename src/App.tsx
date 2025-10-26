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
import VideoPlayer from "./pages/VideoPlayer";
import Chat from "./pages/Chat";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import Favoritos from "./pages/Favoritos";
import Notificacoes from "./pages/Notificacoes";
import Evolucao from "./pages/Evolucao";
import Mentoria from "./pages/Mentoria";
import MentoriaDiagnostico from "./pages/MentoriaDiagnostico";
import MentoriaObjetivos from "./pages/MentoriaObjetivos";
import MentoriaSessoes from "./pages/MentoriaSessoes";
import MentoriaRecursos from "./pages/MentoriaRecursos";
import MentoriaProjetos from "./pages/MentoriaProjetos";
import MentoriaTarefas from "./pages/MentoriaTarefas";
import MentoriaDuvidas from "./pages/MentoriaDuvidas";
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
import Auditoria from "./pages/admin/Auditoria";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/trilhas/:id" element={<TrilhaDetalhes />} />
            <Route path="/videos/:id" element={<VideoPlayer />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/evolucao" element={<Evolucao />} />
              <Route path="/mentoria" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><Mentoria /></ProtectedRoute>} />
              <Route path="/mentoria/diagnostico" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaDiagnostico /></ProtectedRoute>} />
              <Route path="/mentoria/objetivos" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaObjetivos /></ProtectedRoute>} />
              <Route path="/mentoria/sessoes" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaSessoes /></ProtectedRoute>} />
              <Route path="/mentoria/recursos" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaRecursos /></ProtectedRoute>} />
              <Route path="/mentoria/projetos" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaProjetos /></ProtectedRoute>} />
              <Route path="/mentoria/tarefas" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaTarefas /></ProtectedRoute>} />
              <Route path="/mentoria/duvidas" element={<ProtectedRoute requireAnyRole={["admin", "mentorado"]}><MentoriaDuvidas /></ProtectedRoute>} />
            <Route path="/ia-copie-use" element={<IACopieUse />} />
            <Route path="/biblioteca-ferramentas" element={<BibliotecaFerramentas />} />
            <Route path="/biblioteca-prompts" element={<BibliotecaPrompts />} />
            <Route path="/metodos-aplicar" element={<MetodosAplicar />} />
          </Route>
          
          <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<GerenciarUsuarios />} />
            <Route path="conteudo" element={<GerenciarConteudo />} />
            <Route path="bibliotecas" element={<GerenciarBibliotecas />} />
            <Route path="avisos" element={<GerenciarAvisos />} />
            <Route path="conhecimento" element={<GerenciarConhecimento />} />
            <Route path="mentoria" element={<GerenciarMentoria />} />
            <Route path="auditoria" element={<Auditoria />} />
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
