import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

interface GoogleLoginVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VerificationResponse {
  permitido: boolean;
  motivo?: string;
  mensagem?: string;
}

export function GoogleLoginVerificationModal({ open, onOpenChange }: GoogleLoginVerificationModalProps) {
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Digite seu email para continuar");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Chamar edge function para verificar permissão
      const { data, error: fetchError } = await supabase.functions.invoke<VerificationResponse>(
        "verificar-google-login",
        { body: { email: email.trim().toLowerCase() } }
      );

      if (fetchError) {
        console.error("Erro na verificação:", fetchError);
        setError("Erro ao verificar permissão. Tente novamente.");
        return;
      }

      if (!data?.permitido) {
        setError(data?.mensagem || "Não foi possível usar o login com Google.");
        return;
      }

      // Verificação passou - iniciar OAuth
      setIsRedirecting(true);
      
      const { error: oauthError } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (oauthError) {
        console.error("Erro no OAuth:", oauthError);
        setError("Erro ao iniciar login com Google. Tente novamente.");
        setIsRedirecting(false);
      }
      
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    if (!isVerifying && !isRedirecting) {
      setEmail("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Entrar com Google</DialogTitle>
          <DialogDescription className="text-white/60">
            Digite seu email cadastrado para continuar com o login via Google.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerifyAndLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-email" className="text-white/80">
              Email cadastrado
            </Label>
            <Input
              id="google-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="seu@email.com"
              className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
              disabled={isVerifying || isRedirecting}
              autoComplete="email"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isVerifying || isRedirecting}
              className="flex-1 border-white/10 text-white hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || isRedirecting || !email.trim()}
              className="flex-1 bg-[#9EB038] hover:bg-[#8a9a31] text-white"
            >
              {isVerifying || isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRedirecting ? "Redirecionando..." : "Verificando..."}
                </>
              ) : (
                "Continuar com Google"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
