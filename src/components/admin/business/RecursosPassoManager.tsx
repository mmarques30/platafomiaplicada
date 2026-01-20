import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link2, Upload, Trash2, ExternalLink, FileText, Image, Video, File } from 'lucide-react';
import { RecursoItem, useUploadRecurso, getTipoRecurso, getRecursoIcon } from '@/hooks/useInstrucaoRecursos';
import { RecursoUploadModal } from './RecursoUploadModal';

interface RecursosPassoManagerProps {
  recursos: RecursoItem[];
  onChange: (recursos: RecursoItem[]) => void;
  etapaId: string;
  passoNumero: number;
}

export function RecursosPassoManager({ recursos, onChange, etapaId, passoNumero }: RecursosPassoManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'link' | 'upload'>('link');
  const { deleteRecurso } = useUploadRecurso();

  const handleAddRecurso = (recurso: RecursoItem) => {
    onChange([...recursos, recurso]);
    setModalOpen(false);
  };

  const handleRemoveRecurso = async (id: string) => {
    const recurso = recursos.find(r => r.id === id);
    if (recurso && recurso.url.includes('instrucoes-recursos')) {
      await deleteRecurso(recurso.url);
    }
    onChange(recursos.filter(r => r.id !== id));
  };

  const openModal = (mode: 'link' | 'upload') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const getIconComponent = (tipo: RecursoItem['tipo']) => {
    switch (tipo) {
      case 'pdf': return <FileText className="h-4 w-4 text-destructive" />;
      case 'imagem': return <Image className="h-4 w-4 text-primary" />;
      case 'video': return <Video className="h-4 w-4 text-accent-foreground" />;
      case 'documento': return <File className="h-4 w-4 text-secondary-foreground" />;
      case 'link': return <Link2 className="h-4 w-4 text-primary" />;
      default: return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Recursos ({recursos.length})
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openModal('link')}
            className="h-7 text-xs"
          >
            <Link2 className="h-3 w-3 mr-1" />
            Link
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openModal('upload')}
            className="h-7 text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {recursos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recursos.map((recurso) => (
            <div
              key={recurso.id}
              className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1.5 text-sm group"
            >
              {getIconComponent(recurso.tipo)}
              <a
                href={recurso.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 max-w-[150px] truncate"
                title={recurso.titulo}
              >
                {recurso.titulo}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRecurso(recurso.id)}
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <RecursoUploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        onAdd={handleAddRecurso}
        etapaId={etapaId}
        passoNumero={passoNumero}
      />
    </div>
  );
}
