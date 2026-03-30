
Objetivo: corrigir a simulação da Paula para que “Minha Trajetória” mostre todas as abas corretas (Visão Geral, Roadmap, Evolução Aprendizado) no preview admin.

1) Corrigir compatibilidade de planos no filtro de menus  
Arquivo: `src/hooks/useMenuConfig.tsx`  
- Problema raiz identificado: `menu_config.planos_permitidos` está com chaves legadas (`business`, `business_iaplicada`), enquanto o frontend usa (`business_parceria`, `business_sistemas`).  
- Ajuste: criar um mapeamento de equivalência no hook e validar permissões por “aliases” de plano/ambiente.  
  - `business_parceria` aceita também `business`  
  - `business_sistemas` aceita também `business_iaplicada`  
  - manter compatibilidade inversa também para evitar regressão  
- Substituir a checagem exata (`includes`) por checagem com aliases tanto para `currentEnvironment` quanto para `userPlan`.

2) Evitar navegação errada quando submenu não vier do banco  
Arquivo: `src/components/layout/AppSidebar.tsx`  
- Hoje, se “Meu Progresso” ficar sem filhos, ele cai no branch sem submenu e usa `menu.url` (`/evolucao`), levando para tela errada para Business.  
- Ajuste: no item sem submenu, usar `getMenuUrl(menu)` (não `menu.url` direto), preservando redirecionamento correto para `/mentoria` em Business.

3) Validação funcional (sem alterar desktop)  
- Simular admin: “Ver como → Business Parceria → Paula”.  
- Confirmar no menu lateral “Minha Trajetória” com subitens visíveis:  
  - Visão Geral → `/mentoria`  
  - Roadmap → `/mentoria?tab=roadmap`  
  - Evolução Aprendizado → `/mentoria?tab=evolucao-aprendizado`  
- Confirmar que em “Business Sistemas” aparecem apenas as abas esperadas (sem Evolução Aprendizado).  
- Confirmar Academy/Skills sem regressão visual e comportamento igual no desktop.

Detalhes técnicos  
- Sem migração obrigatória no banco para resolver agora (correção robusta via frontend).  
- A causa não é o componente de abas da Mentoria, e sim o filtro de permissões do `menu_config` + fallback de rota no sidebar.  
- Essa abordagem mantém compatibilidade com dados legados já existentes.
