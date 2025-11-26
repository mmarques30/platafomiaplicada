import { useMemo } from "react";
import { useMinhaEvolucao } from "./useMinhaEvolucao";
import { useSequenciaEstudo } from "./useEvolucao";
import { useMeusCertificados } from "./useCertificados";

interface NivelUsuario {
  nivel: number;
  xpAtual: number;
  xpNecessario: number;
  porcentagemNivel: number;
  tituloNivel: string;
  proximoTitulo: string;
}

const TITULOS_NIVEL = [
  "Iniciante",
  "Explorador",
  "Aprendiz",
  "Praticante",
  "Conhecedor",
  "Especialista",
  "Mestre",
  "Guru",
  "Lenda"
];

export const useNivelUsuario = (): NivelUsuario => {
  const { data: evolucao } = useMinhaEvolucao();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados } = useMeusCertificados();

  return useMemo(() => {
    // Calcular XP total baseado em atividades
    const xpVideos = (evolucao?.totalVideos || 0) * 50;
    const xpCertificados = (certificados?.filter(c => c.status === "emitido").length || 0) * 500;
    const xpSequencia = (sequencia || 0) * 10;
    const xpFerramentas = (evolucao?.totalFerramentas || 0) * 100;
    const xpComentarios = (evolucao?.totalComentarios || 0) * 25;

    const xpTotal = xpVideos + xpCertificados + xpSequencia + xpFerramentas + xpComentarios;

    // Calcular nível (cada nível precisa de 1000 XP a mais que o anterior)
    let nivel = 1;
    let xpAcumulado = 0;
    let xpProximoNivel = 1000;

    while (xpTotal >= xpAcumulado + xpProximoNivel) {
      xpAcumulado += xpProximoNivel;
      nivel++;
      xpProximoNivel += 1000; // Cada nível fica progressivamente mais difícil
    }

    const xpAtual = xpTotal - xpAcumulado;
    const xpNecessario = xpProximoNivel;
    const porcentagemNivel = (xpAtual / xpNecessario) * 100;

    const indiceNivel = Math.min(nivel - 1, TITULOS_NIVEL.length - 1);
    const tituloNivel = TITULOS_NIVEL[indiceNivel];
    const proximoTitulo = TITULOS_NIVEL[Math.min(indiceNivel + 1, TITULOS_NIVEL.length - 1)];

    return {
      nivel,
      xpAtual,
      xpNecessario,
      porcentagemNivel,
      tituloNivel,
      proximoTitulo
    };
  }, [evolucao, sequencia, certificados]);
};
