import { useState } from "react";
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
import { Mail, Loader2, CheckCircle } from "lucide-react";

interface RecuperarSenhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecuperarSenhaModal({ open, onOpenChange }: RecuperarSenhaModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailLower = email.toLowerCase().trim();

    try {
      // 1. Verificar se o email existe no sistema
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, conta_ativa")
        .eq("email", emailLower)
        .maybeSingle();

      // Registrar a solicitação independente do resultado
      const registrarSolicitacao = async (status: string, userId?: string, erro?: string) => {
        try {
          await supabase.from("password_reset_requests").insert({
            email: emailLower,
            user_id: userId || null,
            status,
            user_agent: navigator.userAgent,
            erro_mensagem: erro || null,
          });
        } catch (logError) {
          console.error("Erro ao registrar solicitação:", logError);
        }
      };

      // Email não encontrado
      if (!profile) {
        await registrarSolicitacao("email_nao_encontrado", undefined, "Email não cadastrado no sistema");
        // Por segurança, mostramos mensagem genérica
        toast.error("Se este email estiver cadastrado, você receberá um link de recuperação.");
        setIsLoading(false);
        return;
      }

      // Conta inativa
      if (!profile.conta_ativa) {
        await registrarSolicitacao("conta_inativa", profile.id, "Conta inativa");
        toast.error("Esta conta está inativa. Entre em contato com o suporte.");
        setIsLoading(false);
        return;
      }

      // 2. Enviar email de recuperação via Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailLower, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (resetError) {
        await registrarSolicitacao("erro_envio", profile.id, resetError.message);
        throw resetError;
      }

      // 3. Registrar sucesso
      await registrarSolicitacao("link_enviado", profile.id);

      setEmailEnviado(true);
      toast.success("Email de recuperação enviado!");
    } catch (error: any) {
      console.error("Erro ao recuperar senha:", error);
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailEnviado(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#9EB038]" />
            Recuperar Senha
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {emailEnviado
              ? "Verifique sua caixa de entrada"
              : "Digite o email cadastrado para receber o link de recuperação"}
          </DialogDescription>
        </DialogHeader>

        {emailEnviado ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-[#9EB038] mx-auto" />
            <div className="space-y-2">
              <p className="text-white font-medium">Email enviado com sucesso!</p>
              <p className="text-white/60 text-sm">
                Enviamos um link de recuperação para <strong className="text-white">{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-[#9EB038] hover:bg-[#8a9a31] text-white"
            >
              Entendi
            </Button>
          </div>
        ) : (
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
              />
              <p className="text-xs text-white/50">
                Você receberá um link para criar uma nova senha
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="flex-1 bg-[#9EB038] hover:bg-[#8a9a31] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
