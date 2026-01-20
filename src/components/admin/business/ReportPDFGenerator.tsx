import { jsPDF } from "jspdf";
import { ReportBusiness } from "@/hooks/useContratosBusiness";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportPDFData {
  report: ReportBusiness;
  nomeEmpresa?: string;
  nomeMentorado?: string;
}

export function generateReportPDF({ report, nomeEmpresa, nomeMentorado }: ReportPDFData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  // Cores
  const primaryColor: [number, number, number] = [124, 58, 237]; // Violet
  const textColor: [number, number, number] = [26, 26, 26];
  const mutedColor: [number, number, number] = [102, 102, 102];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("IAplicada", margin, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Consultoria em IA", margin, 30);

  yPos = 50;

  // Título do Report
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(report.titulo, margin, yPos);
  yPos += 10;

  // Meta info
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const metaLines = [];
  if (nomeEmpresa) metaLines.push(`Cliente: ${nomeEmpresa}`);
  if (nomeMentorado) metaLines.push(`Responsável: ${nomeMentorado}`);
  if (report.periodo_referencia) metaLines.push(`Período: ${report.periodo_referencia}`);
  metaLines.push(`Gerado em: ${format(new Date(report.data_envio), "dd/MM/yyyy", { locale: ptBR })}`);

  metaLines.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  yPos += 5;

  // Linha separadora
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Métricas (se disponíveis)
  const metricas = report.metricas as Record<string, any> | null;
  if (metricas) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Métricas de Progresso", margin, yPos);
    yPos += 10;

    const boxWidth = (contentWidth - 15) / 4;
    const boxHeight = 25;
    const boxes = [
      { label: "Etapas", value: `${metricas.etapas?.percentual || 0}%` },
      { label: "Entregas", value: `${metricas.entregas?.concluidas || 0}/${metricas.entregas?.total || 0}` },
      { label: "Tarefas", value: `${metricas.tarefas?.concluidas || 0}` },
      { label: "Vídeos", value: `${metricas.videos_assistidos || 0}` },
    ];

    boxes.forEach((box, index) => {
      const xPos = margin + index * (boxWidth + 5);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 3, 3, 'F');
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(box.value, xPos + boxWidth / 2, yPos + 12, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedColor);
      doc.text(box.label, xPos + boxWidth / 2, yPos + 20, { align: "center" });
    });

    yPos += boxHeight + 15;
  }

  // Resumo Executivo
  const resumo = report.resumo_executivo || report.descricao;
  if (resumo) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Resumo Executivo", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedColor);
    
    const splitResumo = doc.splitTextToSize(resumo, contentWidth);
    splitResumo.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    yPos += 10;
  }

  // Footer
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      `Página ${pageNum} de ${totalPages} | IAplicada - Consultoria em IA`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );
  };

  // Adicionar footer em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Download
  const fileName = `report-${report.periodo_referencia?.replace(/\//g, '-') || format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export function ReportPDFButton({ 
  report, 
  nomeEmpresa, 
  nomeMentorado,
  children 
}: ReportPDFData & { children: React.ReactNode }) {
  const handleClick = () => {
    generateReportPDF({ report, nomeEmpresa, nomeMentorado });
  };

  return (
    <span onClick={handleClick} className="cursor-pointer">
      {children}
    </span>
  );
}
