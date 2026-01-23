import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileDown, Eye, Loader2, Upload } from 'lucide-react';
import { 
  CONTRATADA, 
  MODULOS_DISPONIVEIS,
  MODULOS_DESCRICOES,
  TABELA_MANUTENCAO,
  gerarClausulas, 
  formatCurrency, 
  formatDateExtended, 
  ContratoData 
} from '@/lib/contratoBusinessTemplate';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  // Função para adicionar tabela de módulos ao PDF
  const addModulosTable = (doc: jsPDF, startY: number, margin: number, contentWidth: number): number => {
    let y = startY;
    const rowHeight = 8;
    const col1Width = 50;
    const col2Width = contentWidth - col1Width;
    
    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Módulo', margin + 2, y + 5.5);
    doc.text('Descrição', margin + col1Width + 2, y + 5.5);
    y += rowHeight;
    
    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    MODULOS_DISPONIVEIS.forEach((modulo) => {
      const descricao = MODULOS_DESCRICOES[modulo] || '';
      const lines = doc.splitTextToSize(descricao, col2Width - 4);
      const cellHeight = Math.max(rowHeight, lines.length * 3.5 + 3);
      
      // Draw cell borders
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, col1Width, cellHeight);
      doc.rect(margin + col1Width, y, col2Width, cellHeight);
      
      doc.text(modulo, margin + 2, y + 5);
      lines.forEach((line: string, i: number) => {
        doc.text(line, margin + col1Width + 2, y + 5 + (i * 3.5));
      });
      
      y += cellHeight;
    });
    
    return y + 5;
  };

  // Função para adicionar tabela de manutenção ao PDF
  const addManutencaoTable = (doc: jsPDF, startY: number, margin: number, contentWidth: number): number => {
    let y = startY;
    const rowHeight = 8;
    const colWidths = [40, 35, 35, contentWidth - 110];
    
    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    let xPos = margin;
    const headers = ['Nível', 'Módulos', 'Usuários', 'Valor Mensal'];
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, y + 5.5);
      xPos += colWidths[i];
    });
    y += rowHeight;
    
    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    TABELA_MANUTENCAO.forEach((row) => {
      doc.setDrawColor(200, 200, 200);
      xPos = margin;
      colWidths.forEach((w) => {
        doc.rect(xPos, y, w, rowHeight);
        xPos += w;
      });
      
      xPos = margin;
      doc.text(row.nivel, xPos + 2, y + 5.5);
      xPos += colWidths[0];
      doc.text(row.modulos, xPos + 2, y + 5.5);
      xPos += colWidths[1];
      doc.text(row.usuarios, xPos + 2, y + 5.5);
      xPos += colWidths[2];
      doc.text(row.valor ? formatCurrency(row.valor) : 'Sob consulta', xPos + 2, y + 5.5);
      
      y += rowHeight;
    });
    
    return y + 5;
  };

  // Função para adicionar tabela de entregas esperadas ao PDF
  const addEntregasTable = (doc: jsPDF, startY: number, margin: number, contentWidth: number): number => {
    const entregas = contratoData.entregas_esperadas || [];
    if (!entregas.length) return startY;
    
    let y = startY;
    const rowHeight = 8;
    const colWidths = [25, contentWidth - 85, 30, 30];
    
    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    let xPos = margin;
    const headers = ['Prazo', 'Entrega', 'Tipo', 'Status'];
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, y + 5.5);
      xPos += colWidths[i];
    });
    y += rowHeight;
    
    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    entregas.forEach((entrega) => {
      doc.setDrawColor(200, 200, 200);
      xPos = margin;
      colWidths.forEach((w) => {
        doc.rect(xPos, y, w, rowHeight);
        xPos += w;
      });
      
      xPos = margin;
      const prazoFormatted = entrega.prazo ? new Date(entrega.prazo).toLocaleDateString('pt-BR') : '-';
      doc.text(prazoFormatted, xPos + 2, y + 5.5);
      xPos += colWidths[0];
      
      const titulo = doc.splitTextToSize(entrega.titulo, colWidths[1] - 4)[0] || '';
      doc.text(titulo, xPos + 2, y + 5.5);
      xPos += colWidths[1];
      
      doc.text(entrega.tipo || '-', xPos + 2, y + 5.5);
      xPos += colWidths[2];
      
      doc.text(entrega.status || 'pendente', xPos + 2, y + 5.5);
      
      y += rowHeight;
    });
    
    return y + 5;
  };

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
      addText('IAPLICADA BUSINESS', 14, true, 'center');
      yPosition += 10;

      // Partes
      addText('PARTES ENVOLVIDAS', 12, true);
      yPosition += 3;
      
      addText(`CONTRATADA: ${CONTRATADA.nome}`, 10, true);
      addText(`CNPJ: ${CONTRATADA.cnpj}`);
      yPosition += 5;
      
      addText(`CONTRATANTE: ${contratoData.razao_social || '[RAZÃO SOCIAL]'}`, 10, true);
      addText(`CNPJ: ${contratoData.cnpj || '[CNPJ]'}`);
      addText(`Endereço: ${contratoData.endereco || '[ENDEREÇO]'}`);
      if (contratoData.representante_nome) {
        addText(`Neste ato representada por ${contratoData.representante_nome}, portador(a) do RG nº ${contratoData.representante_rg || '[RG]'} e inscrito(a) no CPF nº ${contratoData.representante_cpf || '[CPF]'}. Com endereço eletrônico ${contratoData.representante_email || '[EMAIL]'}`);
      }
      yPosition += 5;
      
      addText('As partes acima qualificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.');
      yPosition += 10;

      // Cláusulas
      clausulas.forEach((clausula, index) => {
        addNewPageIfNeeded(30);
        
        // Para a cláusula 2, adicionar tabela de módulos
        if (index === 1) {
          // Título da cláusula
          const linhas = clausula.split('\n');
          const titulo = linhas[0];
          addText(titulo, 11, true);
          yPosition += 3;
          
          // Texto até "MÓDULOS DISPONÍVEIS:"
          const preTableText = linhas.slice(1).join('\n').split('MÓDULOS DISPONÍVEIS:')[0];
          addText(preTableText.trim());
          
          addText('MÓDULOS DISPONÍVEIS:', 10, true);
          yPosition += 3;
          
          // Adicionar tabela
          addNewPageIfNeeded(100);
          yPosition = addModulosTable(doc, yPosition, margin, contentWidth);
          
          // Texto após a tabela
          const postTableParts = clausula.split('Geração de Documentos - Criação automática de propostas, contratos e relatórios.');
          if (postTableParts[1]) {
            const remainingText = postTableParts[1].trim();
            addText(remainingText);
          }
        }
        // Para a cláusula 9, adicionar tabela de manutenção
        else if (index === 8) {
          const linhas = clausula.split('\n');
          const titulo = linhas[0];
          addText(titulo, 11, true);
          yPosition += 3;
          
          // Texto até "TABELA DE NÍVEIS DE MANUTENÇÃO:"
          const preTableText = clausula.split('TABELA DE NÍVEIS DE MANUTENÇÃO:')[0].replace(titulo, '').trim();
          addText(preTableText);
          
          addText('TABELA DE NÍVEIS DE MANUTENÇÃO:', 10, true);
          yPosition += 3;
          
          // Adicionar tabela
          addNewPageIfNeeded(50);
          yPosition = addManutencaoTable(doc, yPosition, margin, contentWidth);
          
          // Texto após a tabela
          const postTableParts = clausula.split('• Corporativo: 11+ módulos, 31+ usuários - Sob consulta');
          if (postTableParts[1]) {
            const remainingText = postTableParts[1].trim();
            addText(remainingText);
          }
        }
        else {
          const paragrafos = clausula.split('\n');
          paragrafos.forEach((paragrafo, pIndex) => {
            const isTitulo = pIndex === 0 && (paragrafo.startsWith('CLÁUSULA') || paragrafo.startsWith('Parágrafo'));
            addText(paragrafo, isTitulo ? 11 : 10, isTitulo);
          });
        }
        yPosition += 5;
      });

      // Assinaturas
      addNewPageIfNeeded(60);
      yPosition += 15;
      
      addText(`São Paulo, ${formatDateExtended(contratoData.data_assinatura || new Date().toISOString())}`, 10, false, 'center');
      yPosition += 25;

      // Linhas de assinatura
      const signatureY = yPosition;
      doc.setLineWidth(0.3);
      
      // Contratada
      doc.line(margin, signatureY, margin + 70, signatureY);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATADA:', margin, signatureY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(CONTRATADA.nome, margin, signatureY + 10);
      doc.text(`CNPJ: ${CONTRATADA.cnpj}`, margin, signatureY + 14);
      
      // Contratante
      doc.line(pageWidth - margin - 70, signatureY, pageWidth - margin, signatureY);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATANTE:', pageWidth - margin - 70, signatureY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(contratoData.razao_social || '[RAZÃO SOCIAL]', pageWidth - margin - 70, signatureY + 10);
      doc.text(`CNPJ: ${contratoData.cnpj || '[CNPJ]'}`, pageWidth - margin - 70, signatureY + 14);
      if (contratoData.representante_nome) {
        doc.text(`Representada por: ${contratoData.representante_nome}`, pageWidth - margin - 70, signatureY + 18);
      }

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

  // Função para gerar PDF como blob (para salvar no sistema)
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
        addText('IAPLICADA BUSINESS', 14, true, 'center');
        yPosition += 10;

        // Partes
        addText('PARTES ENVOLVIDAS', 12, true);
        yPosition += 3;
        
        addText(`CONTRATADA: ${CONTRATADA.nome}`, 10, true);
        addText(`CNPJ: ${CONTRATADA.cnpj}`);
        yPosition += 5;
        
        addText(`CONTRATANTE: ${contratoData.razao_social || '[RAZÃO SOCIAL]'}`, 10, true);
        addText(`CNPJ: ${contratoData.cnpj || '[CNPJ]'}`);
        addText(`Endereço: ${contratoData.endereco || '[ENDEREÇO]'}`);
        if (contratoData.representante_nome) {
          addText(`Neste ato representada por ${contratoData.representante_nome}, portador(a) do RG nº ${contratoData.representante_rg || '[RG]'} e inscrito(a) no CPF nº ${contratoData.representante_cpf || '[CPF]'}. Com endereço eletrônico ${contratoData.representante_email || '[EMAIL]'}`);
        }
        yPosition += 5;
        
        addText('As partes acima qualificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.');
        yPosition += 10;

        // Cláusulas
        clausulas.forEach((clausula) => {
          addNewPageIfNeeded(30);
          const paragrafos = clausula.split('\n');
          paragrafos.forEach((paragrafo, pIndex) => {
            const isTitulo = pIndex === 0 && (paragrafo.startsWith('CLÁUSULA') || paragrafo.startsWith('Parágrafo'));
            addText(paragrafo, isTitulo ? 11 : 10, isTitulo);
          });
          yPosition += 5;
        });

        // Assinaturas
        addNewPageIfNeeded(60);
        yPosition += 15;
        
        addText(`São Paulo, ${formatDateExtended(contratoData.data_assinatura || new Date().toISOString())}`, 10, false, 'center');
        yPosition += 25;

        const signatureY = yPosition;
        doc.setLineWidth(0.3);
        
        doc.line(margin, signatureY, margin + 70, signatureY);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATADA:', margin, signatureY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(CONTRATADA.nome, margin, signatureY + 10);
        doc.text(`CNPJ: ${CONTRATADA.cnpj}`, margin, signatureY + 14);
        
        doc.line(pageWidth - margin - 70, signatureY, pageWidth - margin, signatureY);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATANTE:', pageWidth - margin - 70, signatureY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(contratoData.razao_social || '[RAZÃO SOCIAL]', pageWidth - margin - 70, signatureY + 10);
        doc.text(`CNPJ: ${contratoData.cnpj || '[CNPJ]'}`, pageWidth - margin - 70, signatureY + 14);

        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        reject(error);
      }
    });
  };

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
      const pdfBlob = await gerarPDFBlob();

      const fileName = `${contratoId}/${Date.now()}_contrato.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('contratos-business')
        .upload(fileName, pdfBlob, { 
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const tituloDoc = `Contrato - ${contratoData.razao_social || nomeCliente || 'Cliente'}`;
      const { error: dbError } = await supabase
        .from('documentos_business')
        .insert({
          contrato_id: contratoId,
          titulo: tituloDoc,
          tipo: 'proposta',
          arquivo_url: fileName,
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
              <h2 className="text-lg font-semibold">IAPLICADA BUSINESS</h2>
            </div>

            {/* Partes */}
            <div className="space-y-4">
              <h3 className="font-bold text-base">PARTES ENVOLVIDAS</h3>
              
              <div className="space-y-1">
                <p><strong>CONTRATADA:</strong> {CONTRATADA.nome}</p>
                <p>CNPJ: {CONTRATADA.cnpj}</p>
              </div>
              
              <div className="space-y-1">
                <p><strong>CONTRATANTE:</strong> {contratoData.razao_social || '[RAZÃO SOCIAL]'}</p>
                <p>CNPJ: {contratoData.cnpj || '[CNPJ]'}</p>
                <p>Endereço: {contratoData.endereco || '[ENDEREÇO]'}</p>
                {contratoData.representante_nome && (
                  <p>Neste ato representada por {contratoData.representante_nome}, portador(a) do RG nº {contratoData.representante_rg || '[RG]'} e inscrito(a) no CPF nº {contratoData.representante_cpf || '[CPF]'}. Com endereço eletrônico {contratoData.representante_email || '[EMAIL]'}</p>
                )}
              </div>
              
              <p className="text-justify italic">
                As partes acima qualificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.
              </p>
            </div>

            {/* Tabela de Módulos (preview visual) */}
            <div className="space-y-4">
              <h3 className="font-bold text-base">CLÁUSULA SEGUNDA - DA DESCRIÇÃO DOS SERVIÇOS E METODOLOGIA</h3>
              <p className="text-justify">
                A CONTRATADA se compromete a prestar os seguintes serviços durante a vigência do contrato:
              </p>
              <p className="font-semibold">Parágrafo Primeiro - Desenvolvimento da Plataforma IAplicada Business:</p>
              <p>Construção de uma plataforma de gestão e automação inteligente, construída sob medida para a CONTRATANTE, com os seguintes módulos e funcionalidades:</p>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-black">Módulo</TableHead>
                      <TableHead className="font-bold text-black">Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULOS_DISPONIVEIS.map((modulo) => (
                      <TableRow key={modulo}>
                        <TableCell className="font-medium">{modulo}</TableCell>
                        <TableCell>{MODULOS_DESCRICOES[modulo]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <p className="text-justify">
                <strong>Módulos Contratados:</strong> Conforme o plano de investimento, a CONTRATANTE tem direito à implementação de {contratoData.modulos_contratados || '___'} módulos a serem definidos em conjunto com a CONTRATADA durante a fase de diagnóstico
                {contratoData.modulos_selecionados && contratoData.modulos_selecionados.length > 0 && (
                  <>, sugerindo-se iniciar com: {contratoData.modulos_selecionados.slice(0, 3).join(", ")}</>
                )}.
              </p>

              {/* Tabela de Entregas Esperadas */}
              {contratoData.entregas_esperadas && contratoData.entregas_esperadas.length > 0 && (
                <>
                  <p className="font-semibold mt-4">Cronograma Previsto de Entregas:</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-bold text-black">Prazo</TableHead>
                          <TableHead className="font-bold text-black">Entrega</TableHead>
                          <TableHead className="font-bold text-black">Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contratoData.entregas_esperadas.map((entrega, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {entrega.prazo ? new Date(entrega.prazo).toLocaleDateString('pt-BR') : '-'}
                            </TableCell>
                            <TableCell>{entrega.titulo}</TableCell>
                            <TableCell className="capitalize">{entrega.tipo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>

            {/* Tabela de Manutenção (na cláusula 9) */}
            <div className="space-y-4">
              <h3 className="font-bold text-base">CLÁUSULA NONA - DO SUPORTE E MANUTENÇÃO PÓS-ENTREGA</h3>
              <p className="font-semibold">Parágrafo Segundo - Manutenção Essencial Escalável:</p>
              <p>A partir do início do pós-venda, será cobrada uma taxa mensal de manutenção, cujo valor será definido com base na complexidade da aplicação:</p>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-black">Nível</TableHead>
                      <TableHead className="font-bold text-black">Módulos</TableHead>
                      <TableHead className="font-bold text-black">Usuários</TableHead>
                      <TableHead className="font-bold text-black">Valor Mensal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TABELA_MANUTENCAO.map((row) => (
                      <TableRow key={row.nivel}>
                        <TableCell className="font-medium">{row.nivel}</TableCell>
                        <TableCell>{row.modulos}</TableCell>
                        <TableCell>{row.usuarios}</TableCell>
                        <TableCell>{row.valor ? formatCurrency(row.valor) : 'Sob consulta'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <p className="text-justify">
                <strong>Parágrafo Quarto - Suporte e Correções Sob Demanda:</strong> Qualquer solicitação de suporte, correção de bugs (não críticos), ajustes ou desenvolvimento de novas funcionalidades será tratada como um serviço sob demanda, orçado e faturado separadamente, com base no valor da hora técnica de {formatCurrency(contratoData.valor_hora_tecnica || 250)}.
              </p>
            </div>

            {/* Demais Cláusulas (resumidas no preview) */}
            {clausulas.filter((_, i) => ![1, 8].includes(i)).map((clausula, index) => (
              <div key={index} className="space-y-2">
                {clausula.split('\n').map((paragrafo, pIndex) => {
                  const isTitulo = pIndex === 0 && (paragrafo.startsWith('CLÁUSULA') || paragrafo.startsWith('Parágrafo'));
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
                São Paulo, {formatDateExtended(contratoData.data_assinatura || new Date().toISOString())}
              </p>
              
              <div className="flex justify-between mt-16">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-2"></div>
                  <p className="font-bold">CONTRATADA:</p>
                  <p className="text-xs">{CONTRATADA.nome}</p>
                  <p className="text-xs">CNPJ: {CONTRATADA.cnpj}</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-2"></div>
                  <p className="font-bold">CONTRATANTE:</p>
                  <p className="text-xs">{contratoData.razao_social || '[RAZÃO SOCIAL]'}</p>
                  <p className="text-xs">CNPJ: {contratoData.cnpj || '[CNPJ]'}</p>
                  {contratoData.representante_nome && (
                    <p className="text-xs">Representada por: {contratoData.representante_nome}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
