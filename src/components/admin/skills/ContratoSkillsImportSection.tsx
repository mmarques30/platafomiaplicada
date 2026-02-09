import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, Trash2, FileText, FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  onDataParsed: (data: any) => void;
}

export const ContratoSkillsImportSection = ({ onDataParsed }: Props) => {
  const [texto, setTexto] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (texto.length < 50) { toast.error('Texto muito curto'); return; }
    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('processar-contrato-skills', { body: { texto } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      toast.success('Contrato processado com sucesso!');
      onDataParsed(data.dados || data);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao processar contrato');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10MB'); return; }
    setIsExtracting(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke('parse-documento-contrato', {
        body: { fileBase64: base64, fileName: file.name, fileType: file.type }
      });
      if (error) throw error;
      if (data?.texto) { setTexto(data.texto); toast.success('Texto extraído!'); }
    } catch (e: any) {
      toast.error(e.message || 'Erro ao extrair texto');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-border/50 border-dashed bg-muted/20">
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Importar Contrato Skills</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isParsing || isExtracting}>
            <FileUp className="h-4 w-4 mr-1.5" /> Upload PDF/DOCX
          </Button>
          <input type="file" ref={fileInputRef} accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleFileUpload} />
        </div>
        {isExtracting && <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg"><Loader2 className="h-4 w-4 animate-spin" /> Extraindo texto...</div>}
        <Textarea placeholder="Cole o texto do contrato Skills aqui ou faça upload de um arquivo..." value={texto} onChange={e => setTexto(e.target.value)} className="min-h-[120px] text-sm bg-background" disabled={isParsing || isExtracting} />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{texto.length > 0 ? `${texto.length} caracteres` : 'PDF, DOCX ou texto'}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTexto('')} disabled={isParsing || !texto}><Trash2 className="h-4 w-4 mr-1" /> Limpar</Button>
            <Button onClick={handleProcess} disabled={isParsing || texto.length < 50} size="sm">
              {isParsing ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Processando...</> : <><Wand2 className="h-4 w-4 mr-1" /> Processar com IA</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
