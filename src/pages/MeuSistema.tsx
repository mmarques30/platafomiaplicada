import { Monitor } from "lucide-react";

const MeuSistema = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Meu Sistema</h1>
      </div>
      <p className="text-muted-foreground">
        Acompanhe o sistema que está sendo desenvolvido para você.
      </p>
    </div>
  );
};

export default MeuSistema;
