## Situação

- Os PRs #85, #86 e #87 estão mergeados na `main` do GitHub.
- O editor da Lovable ainda não refletiu esses commits (sync GitHub → Lovable atrasada).
- O preview e o site publicado estão rodando código antigo.

## Importante (limitação)

Eu não controlo diretamente o webhook GitHub → Lovable. O que posso fazer daqui é disparar um novo **publish**, que executa um build pegando o último commit conhecido pelo projeto. Se a sync do GitHub ainda não tiver entregue os commits, republicar **não vai resolver** — vai apenas rebuildar o código antigo.

## Plano

1. Verificar via `project_urls--get_urls` e `publish_settings--get_publish_settings` o estado atual de publish.
2. Disparar `preview_ui--publish` com `website_info_status=already_relevant` (título, meta, OG, favicon já foram revisados no último deploy).
3. Após o deploy, pedir pra você abrir `https://plataforma.iaplicada.com` em aba anônima (PWA tem cache agressivo) e validar se as 3 features apareceram:
   - #85: 5 ferramentas em uma linha
   - #86: cache de progresso
   - #87: regenerar insight da Ariane
4. **Se não aparecerem**, é confirmado que a sync GitHub → Lovable está travada. Nesse caso o caminho é:
   - Você ir em **Plus (+) → GitHub** no editor e usar a opção de reconectar/forçar pull, **ou**
   - Abrir um arquivo qualquer no editor da Lovable e salvar (qualquer write da Lovable força reconciliação com o GitHub), **ou**
   - Contatar suporte Lovable se persistir.

## O que NÃO vou fazer

- Não vou reimplementar as 3 PRs por cima (risco de conflito quando a sync vier).
- Não vou tocar em código, migrations ou edge functions.
- Não vou mudar visibilidade do publish.
