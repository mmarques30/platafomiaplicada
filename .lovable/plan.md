
# Plano: Corrigir Formulário Academy que Desaparece Após Admin Preencher

## Contexto do Problema

Quando você (admin) preenche o diagnóstico de um mentorado Academy, o sistema marca como `completado: true` e `preenchido_por: 'admin'`. Isso faz com que o formulário "desapareça" para o mentorado, pois a lógica atual assume que se está `completado`, o usuário já preencheu.

O mentorado Academy deveria ainda ter acesso ao formulário para preenchê-lo por conta própria, gerando seu plano de desenvolvimento com IA.

---

## Solução Proposta

Ajustar a lógica do painel para considerar o cenário onde o admin preencheu:

### Arquivo: `src/pages/DiagnosticoPainelAcademy.tsx`

**Mudança:** Na condição que decide o que mostrar (linhas 85-113), adicionar uma verificação extra:
- Se `formulario.preenchido_por === 'admin'` **E** não tem insight IA gerado, mostrar uma mensagem explicativa e o botão para o próprio mentorado preencher o diagnóstico
- Isso permite que o mentorado veja que o diagnóstico foi iniciado pelo admin, mas ainda pode completar seu próprio diagnóstico para gerar o plano IA personalizado

### Arquivo: `src/components/mentoria/DiagnosticoAcademyPanel.tsx`

**Mudança:** Quando o diagnóstico foi `preenchido_por === 'admin'` e não tem insight IA:
- Mostrar um card informativo explicando que o diagnóstico foi preenchido pelo mentor
- Adicionar botão "Preencher Meu Diagnóstico Completo" para o usuário ir ao formulário wizard

---

## Fluxo Corrigido

```text
Antes:
  Admin preenche --> completado=true --> Usuário não vê opção de preencher

Depois:
  Admin preenche --> completado=true, preenchido_por='admin'
       |
       v
  Usuário acessa painel --> Vê mensagem "Diagnóstico iniciado pelo mentor"
       |
       v
  Opção: "Preencher Meu Diagnóstico Completo"
       |
       v
  Após preencher --> Gera insight IA personalizado
```

---

## Detalhes Técnicos

1. **Condição atual** (linha 85):
   ```tsx
   formulario ? <DiagnosticoAcademyPanel /> : <Card vazio com botão>
   ```

2. **Condição corrigida**:
   ```tsx
   // Se tem formulário E foi preenchido pelo mentorado OU tem insight IA
   const diagnosticoCompleto = formulario && 
     (formulario.preenchido_por !== 'admin' || formulario.insight_ia);
   
   diagnosticoCompleto ? <DiagnosticoAcademyPanel /> : <Card com opções>
   ```

3. **Novo card para cenário admin-preencheu**:
   - Ícone informativo (UserCog ou Info)
   - Mensagem: "Seu mentor iniciou seu diagnóstico. Complete o formulário para gerar seu plano de desenvolvimento personalizado com IA."
   - Botão: "Preencher Meu Diagnóstico"
   - Se já tiver arquivo do admin, mostrar link para baixar

---

## Resultado Esperado

- Quando admin preenche diagnóstico básico, o mentorado Academy ainda vê o botão para preencher o formulário completo
- Após o mentorado preencher, o sistema gera o insight IA normalmente
- Mantém a funcionalidade existente quando o próprio mentorado preenche desde o início
