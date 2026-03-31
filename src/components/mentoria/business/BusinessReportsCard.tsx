import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useContratosBusiness } from '@/hooks/useContratosBusiness';
import { useBusinessUserId } from '@/hooks/useBusinessUserId';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const BusinessReportsCard: React.FC = () => {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { reports, isLoading } = useContratosBusiness(businessUserId);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando reports...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum report disponível ainda.</p>
        </CardContent>
      </Card>
    );
  }

  const visibleReports = reports.slice(0, 2);
  const hiddenReports = reports.slice(2);

  const renderReportItem = (report: typeof reports[0]) => (
    <div
      key={report.id}
      onClick={() => navigate(`/mentoria/reports#${report.id}`)}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{report.titulo}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(report.created_at), "dd MMM yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleReports.map(renderReportItem)}

          {hiddenReports.length > 0 && (
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver mais {hiddenReports.length} report{hiddenReports.length > 1 ? 's' : ''}
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {hiddenReports.map(renderReportItem)}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessReportsCard;
