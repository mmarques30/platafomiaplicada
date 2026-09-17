/**
 * Os planos que existem, com o texto que o admin lê ao cadastrar. Fica fora
 * dos componentes para os dois modais (novo e editar) lerem a mesma lista.
 */
export type Plano = "academy" | "insider_business" | "insider_convidado";

export const PLANOS: { value: Plano; label: string; description: string }[] = [
  { value: "academy", label: "Academy", description: "Aluno. Trilhas, materiais e evolução." },
  {
    value: "insider_business",
    label: "Insider Business",
    description: "Cliente. Tudo do Academy, mais encontros, documentos e o programa Indica.",
  },
  {
    value: "insider_convidado",
    label: "Insider Convidado",
    description: "Convidado pelo programa Indica. Espaço Insider, sem o Academy.",
  },
];
