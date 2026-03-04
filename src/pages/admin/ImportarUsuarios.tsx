import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Trash2, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkillsEquipeSelector, type SkillsEquipeData } from "@/components/admin/SkillsEquipeSelector";

interface ParsedUser {
  email: string;
  nomeCompleto: string;
  isValid: boolean;
  errors: string[];
}

export default function ImportarUsuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [csvText, setCsvText] = useState("");
  const [plano, setPlano] = useState<string>("");
  const [roles, setRoles] = useState<string[]>(["aluno_trilha"]);
  const [password, setPassword] = useState("aplica2025");
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [skillsEquipeData, setSkillsEquipeData] = useState<SkillsEquipeData>({
    equipeId: null,
    novaEquipe: null,
    papelEquipe: "membro",
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const processCSV = () => {
    setIsProcessing(true);
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      toast({
        title: "CSV vazio",
        description: "Cole os dados no formato: email,nome_completo",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    // Detectar se primeira linha é header
    const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
    
    const users: ParsedUser[] = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [email, ...nameParts] = line.split(',').map(part => part.trim());
      const nomeCompleto = nameParts.join(',').trim();
      
      const errors: string[] = [];
      if (!email) errors.push("Email vazio");
      else if (!validateEmail(email)) errors.push("Email inválido");
      if (!nomeCompleto) errors.push("Nome vazio");
      
      users.push({
        email,
        nomeCompleto,
        isValid: errors.length === 0,
        errors
      });
    }
    
    setParsedUsers(users);
    setIsProcessing(false);
    
    const validCount = users.filter(u => u.isValid).length;
    toast({
      title: "CSV processado",
      description: `${validCount} usuário(s) válido(s) encontrado(s)`,
    });
  };

  const removeUser = (index: number) => {
    setParsedUsers(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRole = (role: string) => {
    setRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const isSkillsValid = () => {
    if (plano !== "skills") return true;
    
    // Must have either existing team or valid new team data
    if (skillsEquipeData.equipeId) return true;
    if (skillsEquipeData.novaEquipe?.nome && skillsEquipeData.novaEquipe?.empresa) return true;
    
    return false;
  };

  const handleImport = async () => {
    const validUsers = parsedUsers.filter(u => u.isValid);
    
    if (validUsers.length === 0) {
      toast({
        title: "Nenhum usuário válido",
        description: "Não há usuários válidos para importar",
        variant: "destructive"
      });
      return;
    }

    if (roles.length === 0) {
      toast({
        title: "Selecione pelo menos uma role",
        description: "É necessário selecionar pelo menos uma role para os usuários",
        variant: "destructive"
      });
      return;
    }

    if (plano === "skills" && !isSkillsValid()) {
      toast({
        title: "Equipe obrigatória",
        description: "Para o plano Skills, é necessário selecionar ou criar uma equipe.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const usersToImport = validUsers.map(u => ({
        email: u.email,
        nomeCompleto: u.nomeCompleto,
        password: password
      }));

      const { data, error } = await supabase.functions.invoke('import-users-batch', {
        body: {
          users: usersToImport,
          planoMentoria: plano || undefined,
          roles: roles,
          equipeId: plano === "skills" ? skillsEquipeData.equipeId : undefined,
          novaEquipe: plano === "skills" ? skillsEquipeData.novaEquipe : undefined,
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

  const handleNovaImportacao = () => {
    setCsvText("");
    setParsedUsers([]);
    setResult(null);
    setPlano("");
    setRoles(["aluno_trilha"]);
    setPassword("aplica2025");
    setSkillsEquipeData({
      equipeId: null,
      novaEquipe: null,
      papelEquipe: "membro",
    });
  };

  const validUsersCount = parsedUsers.filter(u => u.isValid).length;

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
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
          <CardTitle>Importar Usuários em Lote</CardTitle>
          <CardDescription>
            Cole os dados em formato CSV (email,nome_completo)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Textarea para CSV */}
          <div className="space-y-2">
            <Label>Dados dos usuários (formato CSV)</Label>
            <Textarea
              placeholder="email,nome_completo&#10;joao@email.com,João Silva&#10;maria@email.com,Maria Santos"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="font-mono text-sm min-h-[150px]"
              disabled={result?.success}
            />
            <p className="text-xs text-muted-foreground">
              Formato: email,nome_completo (um por linha, com ou sem header)
            </p>
          </div>

          {/* Configurações */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Seletor de Plano */}
            <div className="space-y-3">
              <Label>Plano (opcional)</Label>
              <RadioGroup value={plano} onValueChange={setPlano} disabled={result?.success}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="nenhum" />
                  <Label htmlFor="nenhum" className="cursor-pointer font-normal">Nenhum</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="academy" id="academy" />
                  <Label htmlFor="academy" className="cursor-pointer font-normal">Academy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skills" id="skills" />
                  <Label htmlFor="skills" className="cursor-pointer font-normal">Skills</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business_parceria" id="business_parceria" />
                  <Label htmlFor="business_parceria" className="cursor-pointer font-normal">Business Parceria</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business_sistemas" id="business_sistemas" />
                  <Label htmlFor="business_sistemas" className="cursor-pointer font-normal">Business Sistemas</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Seletor de Roles */}
            <div className="space-y-3">
              <Label>Roles (pelo menos uma)</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="aluno_trilha" 
                    checked={roles.includes("aluno_trilha")}
                    onCheckedChange={() => toggleRole("aluno_trilha")}
                    disabled={result?.success}
                  />
                  <Label htmlFor="aluno_trilha" className="cursor-pointer font-normal">aluno_trilha</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mentorado" 
                    checked={roles.includes("mentorado")}
                    onCheckedChange={() => toggleRole("mentorado")}
                    disabled={result?.success}
                  />
                  <Label htmlFor="mentorado" className="cursor-pointer font-normal">mentorado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="admin" 
                    checked={roles.includes("admin")}
                    onCheckedChange={() => toggleRole("admin")}
                    disabled={result?.success}
                  />
                  <Label htmlFor="admin" className="cursor-pointer font-normal">admin</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Team Selector - apenas para plano Skills */}
          {plano === "skills" && !result?.success && (
            <SkillsEquipeSelector
              value={skillsEquipeData}
              onChange={setSkillsEquipeData}
              showLiderOption={false}
              disabled={result?.success}
            />
          )}

          {/* Senha padrão */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha padrão</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="aplica2025"
              disabled={result?.success}
            />
          </div>

          {/* Botão Processar CSV */}
          {!result && (
            <Button 
              onClick={processCSV} 
              disabled={!csvText.trim() || isProcessing}
              className="w-full"
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Processar CSV
                </>
              )}
            </Button>
          )}

          {/* Preview da lista */}
          {parsedUsers.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Preview ({validUsersCount} usuário(s) válido(s))</Label>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedUsers.map((user, index) => (
                      <TableRow key={index} className={!user.isValid ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <TableCell className="font-mono text-sm">{user.email}</TableCell>
                        <TableCell>{user.nomeCompleto}</TableCell>
                        <TableCell>
                          {user.isValid ? (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Válido
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              {user.errors.join(", ")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUser(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Botão Importar */}
          {parsedUsers.length > 0 && !result && (
            <Button 
              onClick={handleImport} 
              disabled={isImporting || validUsersCount === 0 || (plano === "skills" && !isSkillsValid())}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                `Importar ${validUsersCount} Usuário(s)`
              )}
            </Button>
          )}

          {/* Resultado */}
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
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Sucesso:
                    </h4>
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
                    <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Erros:
                    </h4>
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

                <Button onClick={handleNovaImportacao} className="w-full" variant="outline">
                  Nova Importação
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
