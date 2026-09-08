/**
 * IAplicadaBackground — fundo escuro "quadriculado" do acesso inicial.
 *
 * Porta direta da camada `IABackground` da LP iaplicada.com (repo
 * ia-transform): grade blueprint deslizando + glows verdes que derivam +
 * feixe varrendo + sparks ✱ + grão. Cores/valores idênticos aos da LP
 * (grid rgba(158,176,56,.1) em 58px, lime #d5e95a, olive #7a8f30).
 *
 * Fica atrás do conteúdo (absolute inset-0 z-0, pointer-events off); o
 * wrapper precisa ser `relative overflow-hidden` e o conteúdo z-10.
 * O CSS mora em index.css sob o prefixo `.ia-entry-bg`.
 */
export function IAplicadaBackground() {
  return (
    <div className="ia-entry-bg" aria-hidden="true">
      <div className="ia-entry-bg__grid" />
      <div className="ia-entry-bg__glow ia-entry-bg__glow--1" />
      <div className="ia-entry-bg__glow ia-entry-bg__glow--2" />
      <div className="ia-entry-bg__sweep" />
      <div className="ia-entry-bg__spark" style={{ top: "14%", left: "38%" }}>
        ✱
      </div>
      <div className="ia-entry-bg__spark" style={{ top: "70%", left: "24%" }}>
        ✱
      </div>
      <div className="ia-entry-bg__spark" style={{ top: "26%", right: "34%" }}>
        ✱
      </div>
      <div className="ia-entry-bg__grain" />
    </div>
  );
}
