import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function ImportarUsuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const usuariosParaImportar = [
    {
      email: "casatelihomehealth@gmail.com",
      nomeCompleto: "Flavia Aparecida De Oliveira",
      password: "aplica2025"
    },
    {
      email: "alessandro.tubini@gmail.com",
      nomeCompleto: "Alessandro Tubini",
      password: "aplica2025"
    },
    {
      email: "patriciat.nakamura@gmail.com",
      nomeCompleto: "Patricia Nakamura",
      password: "aplica2025"
    }
  ];

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-users-batch', {
        body: {
          users: usuariosParaImportar,
          planoMentoria: "academy",
          roles: ["aluno_trilha"]
        }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast({
          title: "Importação concluída!",
          description: `${data.imported} usuários importados com sucesso.`,
        });
      }
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro ao importar os usuários.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Importar Usuários Academy</CardTitle>
          <CardDescription>
            Importação em lote de 3 novos usuários com plano Academy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold">Usuários a importar:</h3>
            <ul className="space-y-2">
              {usuariosParaImportar.map((user, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">{user.nomeCompleto}</span>
                  <span className="text-muted-foreground">({user.email})</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Plano:</strong> Academy
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> aluno_trilha
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Senha temporária:</strong> aplica2025
            </p>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={isImporting || result?.success}
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : result?.success ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Importação Concluída
              </>
            ) : (
              "Iniciar Importação"
            )}
          </Button>

          {result && (
            <Card className={result.success ? "border-green-500" : "border-red-500"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Resultado da Importação
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      Erro na Importação
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{result.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                    <p className="text-sm text-muted-foreground">Importados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                  </div>
                </div>

                {result.results?.success?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">✓ Sucesso:</h4>
                    <ul className="space-y-1">
                      {result.results.success.map((email: string) => (
                        <li key={email} className="text-sm text-muted-foreground">
                          {email}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.results?.errors?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">✗ Erros:</h4>
                    <ul className="space-y-2">
                      {result.results.errors.map((err: any, idx: number) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium">{err.email}:</span>{" "}
                          <span className="text-red-600">{err.error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
