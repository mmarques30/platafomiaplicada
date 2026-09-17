/**
 * O leitor do fluxo da MarIAna.
 *
 * A resposta chega por SSE, um pedaço de texto por vez, e os dois chats (o
 * balão flutuante e a página inteira) liam esse fluxo com o mesmo código
 * copiado. Agora leem daqui, porque os dois tinham os mesmos dois defeitos.
 *
 * O primeiro travava a resposta no meio. Quando uma linha `data:` não era JSON
 * válido, o código devolvia a linha para o começo da fila e parava o laço. Só
 * que a linha já estava completa: ela terminava em quebra de linha, então
 * devolver não conserta nada. Na volta o laço encontrava a mesma linha,
 * falhava de novo, parava de novo, e assim por diante. O texto continuava
 * chegando do servidor e nada mais aparecia na tela. Era exatamente o "ele
 * para de responder". Aqui uma linha que não dá para ler é descartada e o
 * fluxo segue.
 *
 * O segundo deixava a resposta lenta até parecer travada. Cada pedacinho de
 * texto forçava um `flushSync`, e num `flushSync` o React repinta a tela
 * inteira na hora, sem poder agrupar. Como o markdown é reprocessado por
 * inteiro a cada repintura, uma resposta longa ficava cada vez mais pesada.
 * Aqui os pedaços são acumulados e entregues no máximo uma vez por quadro, que
 * é o mais rápido que a tela consegue mostrar de qualquer jeito.
 *
 * E como o fluxo pode simplesmente emudecer sem fechar a conexão, existe um
 * relógio de silêncio: passado esse tempo sem nenhum pedaço novo, a leitura é
 * abortada e quem chamou trata como erro, em vez de esperar para sempre.
 */

/** Tempo sem nenhum pedaço novo antes de desistir do fluxo. */
const SILENCIO_MAXIMO = 60_000;

interface OpcoesFluxo {
  /** Chamado a cada quadro com o texto acumulado até ali. */
  aoReceber: (textoAcumulado: string) => void;
  /** Chamado uma vez, no primeiro pedaço de texto que chega. */
  aoComecar?: () => void;
  /** Abortado por quem chamou, para o relógio de silêncio poder interromper. */
  controle?: AbortController | null;
}

/** Extrai o pedaço de texto de uma linha `data:`, ou null se não houver. */
function pedacoDaLinha(linha: string): string | null {
  let texto = linha.endsWith("\r") ? linha.slice(0, -1) : linha;
  if (texto.startsWith(":") || texto.trim() === "") return null;
  if (!texto.startsWith("data:")) return null;

  texto = texto.slice(5).trim();
  if (texto === "" || texto === "[DONE]") return null;

  try {
    const analisado = JSON.parse(texto);
    const conteudo = analisado?.choices?.[0]?.delta?.content;
    return typeof conteudo === "string" && conteudo !== "" ? conteudo : null;
  } catch {
    // Linha completa que não é JSON: descarta e segue. Antes era aqui que o
    // fluxo travava.
    return null;
  }
}

/**
 * Lê a resposta até o fim e devolve o texto completo.
 *
 * Quem chama fica com a responsabilidade de gravar a conversa e de tratar o
 * erro: aqui só se lê.
 */
export async function lerFluxoResposta(
  corpo: ReadableStream<Uint8Array> | null,
  { aoReceber, aoComecar, controle }: OpcoesFluxo,
): Promise<string> {
  if (!corpo) return "";

  const leitor = corpo.getReader();
  const decodificador = new TextDecoder();

  let completo = "";
  let sobra = "";
  let comecou = false;

  // Entrega no máximo uma vez por quadro, e não mais de uma vez em fila.
  let quadroPendente = 0;
  let entregue = "";
  const entregar = () => {
    quadroPendente = 0;
    if (entregue === completo) return;
    entregue = completo;
    aoReceber(completo);
  };
  const agendarEntrega = () => {
    if (quadroPendente) return;
    quadroPendente =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame(entregar)
        : (setTimeout(entregar, 16) as unknown as number);
  };

  let relogio = setTimeout(() => controle?.abort(), SILENCIO_MAXIMO);
  const renovarRelogio = () => {
    clearTimeout(relogio);
    relogio = setTimeout(() => controle?.abort(), SILENCIO_MAXIMO);
  };

  const consumir = (linha: string) => {
    const pedaco = pedacoDaLinha(linha);
    if (pedaco === null) return;
    completo += pedaco;
    if (!comecou) {
      comecou = true;
      aoComecar?.();
    }
    agendarEntrega();
  };

  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      renovarRelogio();

      sobra += decodificador.decode(value, { stream: true });

      let quebra: number;
      while ((quebra = sobra.indexOf("\n")) !== -1) {
        const linha = sobra.slice(0, quebra);
        sobra = sobra.slice(quebra + 1);
        consumir(linha);
      }
    }

    // O que sobrou sem quebra de linha no fim.
    sobra += decodificador.decode();
    for (const linha of sobra.split("\n")) consumir(linha);
  } finally {
    clearTimeout(relogio);
    if (quadroPendente) {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(quadroPendente);
      else clearTimeout(quadroPendente);
    }
    // A última entrega é sempre síncrona, para nada ficar pela metade.
    entregar();
    leitor.releaseLock();
  }

  return completo;
}
