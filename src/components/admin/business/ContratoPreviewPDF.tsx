import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileDown, Eye, Loader2, Upload } from 'lucide-react';
import { CONTRATADA, gerarClausulas, formatCurrency, formatDate, ContratoData } from '@/lib/contratoBusinessTemplate';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContratoPreviewPDFProps {
  contratoData: ContratoData;
  nomeCliente?: string;
  contratoId?: string;
}

export const ContratoPreviewPDF = ({ contratoData, nomeCliente, contratoId }: ContratoPreviewPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const clausulas = gerarClausulas(contratoData);

  const gerarPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;
        
        addNewPageIfNeeded(lines.length * lineHeight + 5);
        
        lines.forEach((line: string) => {
          let xPos = margin;
          if (align === 'center') xPos = pageWidth / 2;
          if (align === 'right') xPos = pageWidth - margin;
          
          doc.text(line, xPos, yPosition, { align });
          yPosition += lineHeight;
        });
        
        yPosition += 2;
      };

      // Título
      addText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 16, true, 'center');
      addText('DE CONSULTORIA EMPRESARIAL E INTELIGÊNCIA ARTIFICIAL', 12, true, 'center');
      yPosition += 10;

      // Partes
      addText('PARTES ENVOLVIDAS', 12, true);
      yPosition += 3;
      
      addText(`CONTRATADA: ${CONTRATADA.nome}`, 10, true);
      addText(`CNPJ: ${CONTRATADA.cnpj}`);
      addText(`Endereço: ${CONTRATADA.endereco}`);
      yPosition += 5;
      
      addText(`CONTRATANTE: ${contratoData.razao_social || '[RAZÃO SOCIAL]'}`, 10, true);
      addText(`CNPJ: ${contratoData.cnpj || '[CNPJ]'}`);
      addText(`Endereço: ${contratoData.endereco || '[ENDEREÇO]'}`);
      addText(`Representada por: ${contratoData.representante_nome || '[REPRESENTANTE]'}`);
      addText(`CPF: ${contratoData.representante_cpf || '[CPF]'} | RG: ${contratoData.representante_rg || '[RG]'}`);
      addText(`E-mail: ${contratoData.representante_email || '[EMAIL]'}`);
      yPosition += 10;

      // Cláusulas
      clausulas.forEach((clausula, index) => {
        addNewPageIfNeeded(30);
        const paragrafos = clausula.split('\n');
        paragrafos.forEach((paragrafo, pIndex) => {
          const isTitulo = pIndex === 0 && paragrafo.startsWith('CLÁUSULA');
          addText(paragrafo, isTitulo ? 11 : 10, isTitulo);
        });
        yPosition += 5;
      });

      // Assinaturas
      addNewPageIfNeeded(50);
      yPosition += 15;
      
      addText(`São Paulo, ${formatDate(contratoData.data_assinatura || new Date().toISOString())}`, 10, false, 'center');
      yPosition += 20;

      // Linhas de assinatura
      const signatureY = yPosition;
      doc.setLineWidth(0.3);
      
      // Contratada
      doc.line(margin, signatureY, margin + 70, signatureY);
      doc.setFontSize(9);
      doc.text('CONTRATADA', margin + 35, signatureY + 5, { align: 'center' });
      doc.text(CONTRATADA.nome, margin + 35, signatureY + 10, { align: 'center' });
      
      // Contratante
      doc.line(pageWidth - margin - 70, signatureY, pageWidth - margin, signatureY);
      doc.text('CONTRATANTE', pageWidth - margin - 35, signatureY + 5, { align: 'center' });
      doc.text(contratoData.representante_nome || '[REPRESENTANTE]', pageWidth - margin - 35, signatureY + 10, { align: 'center' });

      // Download
      const fileName = `Contrato_IAplicada_Business_${(contratoData.razao_social || nomeCliente || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF gerado com sucesso!",
        description: `Arquivo ${fileName} baixado`
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para gerar PDF como blob
  const gerarPDFBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        const addNewPageIfNeeded = (requiredSpace: number) => {
          if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
          }
          return false;
        };

        const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          
          const lines = doc.splitTextToSize(text, contentWidth);
          const lineHeight = fontSize * 0.4;
          
          addNewPageIfNeeded(lines.length * lineHeight + 5);
          
          lines.forEach((line: string) => {
            let xPos = margin;
            if (align === 'center') xPos = pageWidth / 2;
            if (align === 'right') xPos = pageWidth - margin;
            
            doc.text(line, xPos, yPosition, { align });
            yPosition += lineHeight;
          });
          
          yPosition += 2;
        };

        // Título
        addText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 16, true, 'center');
        addText('DE CONSULTORIA EMPRESARIAL E INTELIGÊNCIA ARTIFICIAL', 12, true, 'center');
        yPosition += 10;

        // Partes
        addText('PARTES ENVOLVIDAS', 12, true);
        yPosition += 3;
        
        addText(`CONTRATADA: ${CONTRATADA.nome}`, 10, true);
        addText(`CNPJ: ${CONTRATADA.cnpj}`);
        addText(`Endereço: ${CONTRATADA.endereco}`);
        yPosition += 5;
        
        addText(`CONTRATANTE: ${contratoData.razao_social || '[RAZÃO SOCIAL]'}`, 10, true);
        addText(`CNPJ: ${contratoData.cnpj || '[CNPJ]'}`);
        addText(`Endereço: ${contratoData.endereco || '[ENDEREÇO]'}`);
        addText(`Representada por: ${contratoData.representante_nome || '[REPRESENTANTE]'}`);
        addText(`CPF: ${contratoData.representante_cpf || '[CPF]'} | RG: ${contratoData.representante_rg || '[RG]'}`);
        addText(`E-mail: ${contratoData.representante_email || '[EMAIL]'}`);
        yPosition += 10;

        // Cláusulas
        clausulas.forEach((clausula) => {
          addNewPageIfNeeded(30);
          const paragrafos = clausula.split('\n');
          paragrafos.forEach((paragrafo, pIndex) => {
            const isTitulo = pIndex === 0 && paragrafo.startsWith('CLÁUSULA');
            addText(paragrafo, isTitulo ? 11 : 10, isTitulo);
          });
          yPosition += 5;
        });

        // Assinaturas
        addNewPageIfNeeded(50);
        yPosition += 15;
        
        addText(`São Paulo, ${formatDate(contratoData.data_assinatura || new Date().toISOString())}`, 10, false, 'center');
        yPosition += 20;

        // Linhas de assinatura
        const signatureY = yPosition;
        doc.setLineWidth(0.3);
        
        // Contratada
        doc.line(margin, signatureY, margin + 70, signatureY);
        doc.setFontSize(9);
        doc.text('CONTRATADA', margin + 35, signatureY + 5, { align: 'center' });
        doc.text(CONTRATADA.nome, margin + 35, signatureY + 10, { align: 'center' });
        
        // Contratante
        doc.line(pageWidth - margin - 70, signatureY, pageWidth - margin, signatureY);
        doc.text('CONTRATANTE', pageWidth - margin - 35, signatureY + 5, { align: 'center' });
        doc.text(contratoData.representante_nome || '[REPRESENTANTE]', pageWidth - margin - 35, signatureY + 10, { align: 'center' });

        // Retornar como blob
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Função para salvar contrato no sistema
  const salvarContratoNoSistema = async () => {
    if (!contratoId) {
      toast({
        title: "Erro",
        description: "Salve o contrato primeiro antes de disponibilizá-lo para o mentorado.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Gerar PDF como blob
      const pdfBlob = await gerarPDFBlob();

      // 2. Upload para storage
      const fileName = `${contratoId}/${Date.now()}_contrato.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('contratos-business')
        .upload(fileName, pdfBlob, { 
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Registrar na tabela documentos_business
      const tituloDoc = `Contrato - ${contratoData.razao_social || nomeCliente || 'Cliente'}`;
      const { error: dbError } = await supabase
        .from('documentos_business')
        .insert({
          contrato_id: contratoId,
          titulo: tituloDoc,
          tipo: 'proposta',
          arquivo_url: fileName, // path relativo, não URL pública
          processado: true
        });

      if (dbError) throw dbError;

      toast({
        title: "Contrato disponibilizado!",
        description: "O mentorado já pode baixar o contrato na área de Documentos."
      });

    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      toast({
        title: "Erro ao salvar contrato",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Visualizar / Gerar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <span>Preview do Contrato</span>
            <div className="flex items-center gap-2">
              <Button onClick={gerarPDF} disabled={isGenerating} size="sm" variant="outline">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </>
                )}
              </Button>
              <Button onClick={salvarContratoNoSistema} disabled={isSaving || !contratoId} size="sm">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Disponibilizar
                  </>
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="bg-white text-black p-8 rounded-lg shadow-inner space-y-6 font-serif text-sm">
            {/* Header */}
            <div className="text-center space-y-2 border-b pb-6">
              <h1 className="text-xl font-bold">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
              <h2 className="text-base font-semibold">DE CONSULTORIA EMPRESARIAL E INTELIGÊNCIA ARTIFICIAL</h2>
            </div>

            {/* Partes */}
            <div className="space-y-4">
              <h3 className="font-bold text-base">PARTES ENVOLVIDAS</h3>
              
              <div className="space-y-1">
                <p><strong>CONTRATADA:</strong> {CONTRATADA.nome}</p>
                <p>CNPJ: {CONTRATADA.cnpj}</p>
                <p>Endereço: {CONTRATADA.endereco}</p>
              </div>
              
              <div className="space-y-1">
                <p><strong>CONTRATANTE:</strong> {contratoData.razao_social || '[RAZÃO SOCIAL]'}</p>
                <p>CNPJ: {contratoData.cnpj || '[CNPJ]'}</p>
                <p>Endereço: {contratoData.endereco || '[ENDEREÇO]'}</p>
                <p>Representada por: {contratoData.representante_nome || '[REPRESENTANTE]'}</p>
                <p>CPF: {contratoData.representante_cpf || '[CPF]'} | RG: {contratoData.representante_rg || '[RG]'}</p>
                <p>E-mail: {contratoData.representante_email || '[EMAIL]'}</p>
              </div>
            </div>

            {/* Cláusulas */}
            {clausulas.map((clausula, index) => (
              <div key={index} className="space-y-2">
                {clausula.split('\n').map((paragrafo, pIndex) => {
                  const isTitulo = pIndex === 0 && paragrafo.startsWith('CLÁUSULA');
                  return (
                    <p 
                      key={pIndex} 
                      className={isTitulo ? 'font-bold text-base mt-4' : 'text-justify'}
                    >
                      {paragrafo}
                    </p>
                  );
                })}
              </div>
            ))}

            {/* Assinaturas */}
            <div className="pt-8 mt-8 border-t">
              <p className="text-center mb-12">
                São Paulo, {formatDate(contratoData.data_assinatura || new Date().toISOString())}
              </p>
              
              <div className="flex justify-between mt-16">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-2"></div>
                  <p className="font-bold">CONTRATADA</p>
                  <p className="text-xs">{CONTRATADA.nome}</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-2"></div>
                  <p className="font-bold">CONTRATANTE</p>
                  <p className="text-xs">{contratoData.representante_nome || '[REPRESENTANTE]'}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
