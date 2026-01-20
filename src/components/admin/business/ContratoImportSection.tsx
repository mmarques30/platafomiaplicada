import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, Trash2, FileText } from 'lucide-react';
import { useParseContratoTexto, ContratoParseResult } from '@/hooks/useParseContratoTexto';

interface ContratoImportSectionProps {
  onDataParsed: (data: ContratoParseResult) => void;
}

export const ContratoImportSection = ({ onDataParsed }: ContratoImportSectionProps) => {
  const [texto, setTexto] = useState('');
  const { parseTexto, isParsing } = useParseContratoTexto();

  const handleProcess = async () => {
    const result = await parseTexto(texto);
    if (result) {
      onDataParsed(result);
    }
  };

  const handleClear = () => {
    setTexto('');
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Importar Dados do Contrato
        </CardTitle>
        <CardDescription>
          Cole o texto ou transcrição do contrato. A IA extrairá automaticamente todas as informações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Cole aqui o texto completo do contrato, proposta comercial ou transcrição de reunião...

Exemplo:
A empresa XYZ Tecnologia LTDA, CNPJ 12.345.678/0001-90, com sede na Rua das Flores, 123 - São Paulo/SP, representada por João Silva, CPF 123.456.789-00...

Módulos contratados: CRM, Financeiro, Geração de Documentos...

Valor total: R$ 50.000,00
Entrada: R$ 10.000,00
6 parcelas de R$ 6.666,67..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
          disabled={isParsing}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            ✨ A IA extrairá: dados da empresa, representante, valores, módulos, prazos e entregas
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isParsing || !texto}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            
            <Button
              onClick={handleProcess}
              disabled={isParsing || texto.length < 50}
              size="sm"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Processar com IA
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
