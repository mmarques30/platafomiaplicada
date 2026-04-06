

# Resetar onboarding para todos os usuários existentes

## Como funciona o fluxo atual

O onboarding é controlado por 3 mecanismos:
1. **`primeiro_acesso = true`** (banco de dados) → exibe o vídeo de boas-vindas
2. **`sessionStorage: onboarding_video_visto`** (navegador, temporário) → após vídeo, inicia o tour guiado
3. **`localStorage: proximos_passos_{userId}`** (navegador, persistente) → controla se o card de Próximos Passos já foi visto

## O que precisa ser feito

### 1. Migration SQL (banco de dados)
Executar um UPDATE para setar `primeiro_acesso = true` em todos os perfis ativos que não são visitantes e que já completaram o onboarding (`primeiro_acesso = false`):

```sql
UPDATE profiles
SET primeiro_acesso = true
WHERE conta_ativa = true
  AND is_visitante = false
  AND primeiro_acesso = false;
```

Isso faz com que, no próximo login, cada usuário veja: vídeo → tour → próximos passos.

### 2. Versionar a chave do localStorage (ProximosPassosCard)
O card de Próximos Passos usa `localStorage` com a chave `proximos_passos_{userId}`. Usuários que já viram o card terão essa chave salva no navegador, então o card não apareceria novamente mesmo após o reset.

**Solução**: mudar a chave para incluir uma versão, ex: `proximos_passos_v2_{userId}`. Assim, todos os usuários verão o card novamente após o tour.

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar — resetar `primeiro_acesso` |
| `src/components/onboarding/ProximosPassosCard.tsx` | Editar — versionar chave localStorage |

### Resultado
Na próxima vez que cada usuário acessar a plataforma, passará pelo fluxo completo: vídeo de boas-vindas → tour guiado → card de próximos passos — como se fosse a primeira vez.

### Observações
- Visitantes não são afetados (já têm fluxo próprio)
- Usuários Business serão redirecionados para a tela de welcome-business (comportamento existente)
- O `sessionStorage` é limpo automaticamente ao fechar o navegador, então não precisa de ação

