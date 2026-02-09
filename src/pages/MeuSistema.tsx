import { PageTitle } from "@/components/shared/PageTitle";

const MeuSistema = () => {
  return (
    <div className="space-y-6">
      <PageTitle primary="Meu Sistema" />
      <p className="text-muted-foreground">
        Acompanhe o sistema que está sendo desenvolvido para você.
      </p>
    </div>
  );
};

export default MeuSistema;
