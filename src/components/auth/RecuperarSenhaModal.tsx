import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

interface RecuperarSenhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecuperarSenhaModal({ open, onOpenChange }: RecuperarSenhaModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Digite seu email");
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Digite um email válido");
      return;
    }

    setIsLoading(true);

    try {
      const emailLower = email.toLowerCase().trim();

      // Chamar edge function para gerar token
      const { data, error } = await supabase.functions.invoke('generate-reset-token', {
        body: { email: emailLower }
      });

      if (error) {
        console.error("Error generating token:", error);
        toast.error("Erro ao processar solicitação. Tente novamente.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.token) {
        toast.success("Email verificado! Redirecionando...");
        handleClose();
        
        // Redirecionar para página de redefinição com token
        navigate(`/redefinir-senha?token=${data.token}&email=${encodeURIComponent(emailLower)}`);
      }
    } catch (error) {
      console.error("Error in password recovery:", error);
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Recuperar Senha
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Digite o email cadastrado para criar uma nova senha
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="recuperar-email" className="text-white/80 text-sm font-medium">
              Email cadastrado
            </Label>
            <Input
              id="recuperar-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-primary focus:ring-primary/30"
            />
            <p className="text-xs text-white/50">
              Apenas emails já cadastrados podem recuperar a senha
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 bg-brand-strong hover:bg-brand-strong/90 text-brand-strong-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
