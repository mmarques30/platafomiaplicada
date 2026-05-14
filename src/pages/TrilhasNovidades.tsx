import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageTitle } from "@/components/shared/PageTitle";

export default function TrilhasNovidades() {
  return (
    <PageContainer>
      <PageTitle
        primary="Novidades"
        secondary="do mês"
        eyebrow="Aprender"
        description="Últimos conteúdos adicionados nos últimos 15 dias, organizados por trilha."
      />

      <UltimosConteudos apenasRecentes />
    </PageContainer>
  );
}
