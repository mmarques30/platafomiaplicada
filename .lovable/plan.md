

# Corrigir tela "congelada" para novos usuários Business

## Diagnóstico

Encontrei a causa raiz. Veja o estado da Uiara no banco:
- `primeiro_acesso: false` (já passou pelo BusinessWelcome)
- `senha_temporaria: true` (nunca conseguiu trocar a senha)

Quando ela faz login, **dois modais aparecem ao mesmo tempo**:

1. **TrocarSenhaModal** — Dialog Radix com `modal={true}`, que **trava o foco** (focus trap) e impede interação com qualquer elemento fora dele
2. **ProximosPassosCard** — Portal com `z-index: 9998`, que fica **visualmente por cima** do TrocarSenhaModal

Resultado: ela **vê** o ProximosPassosCard mas **não consegue clicar** em nada (X, CTAs) porque o focus trap do Dialog Radix bloqueia a interação. O sistema parece "congelado".

Outros usuários afetados (mesmo padrão `primeiro_acesso=false` + `senha_temporaria=true`): nenhum além da Uiara no momento. Porém, vários têm `primeiro_acesso=true` + `senha_temporaria=true` (Nathalia, Raquel, Alcir, B&Z, Moises, Quadra, Gilberto) — esses passariam pelo mesmo bug ao concluírem o BusinessWelcome.

## Correção

**Arquivo**: `src/components/onboarding/ProximosPassosCard.tsx`

Na condição do `useEffect` (linha 108), adicionar verificação de `senha_temporaria`:

```tsx
// De:
if (profile?.primeiro_acesso === false && !localStorage.getItem(chave)) {

// Para:
if (profile?.primeiro_acesso === false && profile?.senha_temporaria !== true && !localStorage.getItem(chave)) {
```

Isso garante que o ProximosPassosCard só aparece **após** a troca de senha obrigatória, eliminando o conflito entre os dois modais. A sequência correta para novos usuários Business passa a ser:

1. Login → BusinessWelcome (primeiro_acesso=true)
2. Clica "Entrar" → volta ao MainLayout (primeiro_acesso=false)
3. TrocarSenhaModal aparece sozinho → troca a senha (senha_temporaria=false)
4. ProximosPassosCard aparece sozinho → fecha normalmente
5. Acessa o sistema sem bloqueios

