import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, Trash2, FileText, FileUp, Upload } from 'lucide-react';
import { useParseContratoTexto, ContratoParseResult } from '@/hooks/useParseContratoTexto';
import { toast } from 'sonner';

interface ContratoImportSectionProps {
  onDataParsed: (data: ContratoParseResult) => void;
}

export const ContratoImportSection = ({ onDataParsed }: ContratoImportSectionProps) => {
  const [texto, setTexto] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseTexto, extractTextFromFile, isParsing, isExtracting } = useParseContratoTexto();

  const handleProcess = async () => {
    const result = await parseTexto(texto);
    if (result) {
      onDataParsed(result);
    }
  };

  const handleClear = () => {
    setTexto('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'text/html'];
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.html', '.htm'];
    
    const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast.error('Formato não suportado. Use PDF, DOCX ou TXT.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    const extractedText = await extractTextFromFile(file);
    if (extractedText) {
      setTexto(extractedText);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing = isParsing || isExtracting;

  return (
    <Card className="border-border/50 border-dashed bg-muted/20">
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Importar Contrato Existente</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <FileUp className="h-4 w-4 mr-1.5" />
            Upload PDF/DOCX
          </Button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {isExtracting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Extraindo texto do documento...
          </div>
        )}

        <Textarea
          placeholder="Faça upload de um arquivo ou cole o texto do contrato aqui...

O sistema extrairá automaticamente:
• Dados da empresa (Razão Social, CNPJ, endereço)
• Representante legal (nome, CPF, email)
• Valores (contrato, entrada, parcelas)
• Módulos contratados
• Entregas previstas"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="min-h-[150px] text-sm bg-background"
          disabled={isProcessing}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {texto.length > 0 ? `${texto.length} caracteres` : 'PDF, DOCX ou texto'}
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isProcessing || !texto}
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