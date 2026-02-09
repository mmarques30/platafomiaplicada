import { PageTitle } from "@/components/shared/PageTitle";

const MeuSistema = () => {
  return (
    <div className="container max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6 space-y-6">
      <PageTitle primary="Meu Sistema" />
      <p className="text-muted-foreground">
        Acompanhe o sistema que está sendo desenvolvido para você.
      </p>
    </div>
  );
};

export default MeuSistema;
