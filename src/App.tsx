import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Trilhas from "./pages/Trilhas";
import TrilhaDetalhes from "./pages/TrilhaDetalhes";
import VideoPlayer from "./pages/VideoPlayer";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import CadastrarUsuario from "./pages/admin/CadastrarUsuario";
import GerenciarConteudo from "./pages/admin/GerenciarConteudo";
import GerenciarAvisos from "./pages/admin/GerenciarAvisos";
import VisualizarFormularios from "./pages/admin/VisualizarFormularios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/trilhas/:id" element={<TrilhaDetalhes />} />
            <Route path="/videos/:id" element={<VideoPlayer />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
          
          <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<GerenciarUsuarios />} />
            <Route path="usuarios/novo" element={<CadastrarUsuario />} />
            <Route path="conteudo" element={<GerenciarConteudo />} />
            <Route path="avisos" element={<GerenciarAvisos />} />
            <Route path="formularios" element={<VisualizarFormularios />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
