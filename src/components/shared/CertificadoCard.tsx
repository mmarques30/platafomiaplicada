import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface CertificadoCardProps {
  trilhaTitulo: string;
  nomeCompleto: string;
  dataConclusao: string;
  progresso: number;
  certificadoUrl?: string;
}

export function CertificadoCard({
  trilhaTitulo,
  nomeCompleto,
  dataConclusao,
  progresso,
  certificadoUrl,
}: CertificadoCardProps) {
  const handleDownload = () => {
    if (certificadoUrl) {
      window.open(certificadoUrl, "_blank");
    } else {
      toast.info("PDF do certificado em preparação");
    }
  };

  const handleShare = () => {
    const texto = `Acabei de concluir a trilha "${trilhaTitulo}" com ${progresso}% de aproveitamento! 🎉`;
    if (navigator.share) {
      navigator.share({
        title: "Certificado de Conclusão",
        text: texto,
      });
    } else {
      navigator.clipboard.writeText(texto);
      toast.success("Texto copiado para área de transferência!");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">📜</div>
          <h3 className="font-bold text-lg mb-2">Certificado de Conclusão</h3>
          <h4 className="text-xl font-semibold text-primary mb-4">{trilhaTitulo}</h4>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-center">
            <span className="font-medium">{nomeCompleto}</span>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Concluída em: {new Date(dataConclusao).toLocaleDateString("pt-BR")}
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Aproveitamento: {progresso}%
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
