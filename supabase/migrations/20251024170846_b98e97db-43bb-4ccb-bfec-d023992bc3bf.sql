-- Inserção em massa de 51 novas ferramentas de IA (excluindo duplicatas)
-- ChatGPT, Claude e Perplexity aparecem apenas 1x cada

-- CATEGORIA: COMUNICAÇÃO & ESCRITA
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('ChatGPT', 'Comunicação & Escrita', 'Escrever emails, relatórios e conteúdo profissional', 'Textos prontos em segundos, emails personalizados, resumos de reuniões', 'https://chat.openai.com', 5, true, true, true),
  ('Claude', 'Comunicação & Escrita', 'Análise de documentos longos e escrita estruturada', 'Lê 50+ páginas em minutos, escreve relatórios executivos, analisa contratos', 'https://claude.ai', 5, true, true, true),
  ('Gemini (Google)', 'Comunicação & Escrita', 'Integração com Google Workspace para produtividade', 'Resume Docs, analisa Sheets, integra com Gmail/Drive', 'https://gemini.google.com', 4, true, true, true),
  ('Notion AI', 'Comunicação & Escrita', 'Escrever e organizar dentro do Notion', 'Resumos automáticos, textos formatados, organização de notas', 'https://notion.so/product/ai', 4, false, null, true),
  ('Grammarly', 'Comunicação & Escrita', 'Revisar textos em inglês profissionalmente', 'Correção gramatical, sugestões de tom, clareza em tempo real', 'https://grammarly.com', 4, true, true, true),
  ('Jasper AI', 'Comunicação & Escrita', 'Criar conteúdo de marketing e copywriting', 'Textos para ads, landing pages, emails de vendas', 'https://jasper.ai', 3, false, null, true),
  ('Copy.ai', 'Comunicação & Escrita', 'Gerar copy rápido para redes sociais e marketing', 'Posts, legendas, descrições de produtos', 'https://copy.ai', 3, true, null, true);

-- CATEGORIA: ANÁLISE DE DADOS
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('Julius AI', 'Análise de Dados', 'Análise de dados com chat', 'Sobe planilha, faz perguntas, gera visualizações', 'https://julius.ai', 4, true, true, true),
  ('Polymer', 'Análise de Dados', 'Criar dashboards sem código', 'Dashboards automáticos de planilhas, visualizações prontas', 'https://polymersearch.com', 3, false, null, true),
  ('Tableau Pulse (com IA)', 'Análise de Dados', 'Business Intelligence com insights automáticos', 'Dashboards profissionais, insights gerados por IA', 'https://tableau.com', 4, false, null, true),
  ('Looker Studio (Google)', 'Análise de Dados', 'Criar dashboards profissionais gratuitos', 'Dashboards conectados ao Sheets/BigQuery/Analytics', 'https://lookerstudio.google.com', 5, true, true, true);

-- CATEGORIA: AUTOMAÇÃO
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('Zapier', 'Automação', 'Conectar apps e automatizar fluxos sem código', 'Email→Planilha, Form→CRM, notificações automáticas', 'https://zapier.com', 5, true, true, true),
  ('Make (Integromat)', 'Automação', 'Automação visual complexa', 'Workflows avançados, lógica condicional, processar dados em lote', 'https://make.com', 5, true, true, true),
  ('n8n', 'Automação', 'Automação open-source avançada', 'Workflows customizáveis, self-hosted, integrações ilimitadas', 'https://n8n.io', 4, true, null, true),
  ('Tray.io', 'Automação', 'Automação corporativa robusta', 'Integrações enterprise, APIs complexas, workflows seguros', 'https://tray.io', 3, false, false, true),
  ('Relay.app', 'Automação', 'Automação com IA integrada', 'Workflows que usam GPT-4 nativamente, aprovações humanas', 'https://relay.app', 4, true, true, true);

-- CATEGORIA: APRESENTAÇÕES & VISUAL
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('Gamma', 'Apresentações & Visual', 'Criar apresentações executivas com IA', 'Slides prontos em minutos, design profissional, interativo', 'https://gamma.app', 5, true, true, true),
  ('Canva AI', 'Apresentações & Visual', 'Design gráfico com IA', 'Posts, apresentações, infográficos com Magic Design', 'https://canva.com', 5, true, true, true),
  ('Beautiful.ai', 'Apresentações & Visual', 'Slides que se auto-ajustam', 'Apresentações com design automático, templates inteligentes', 'https://beautiful.ai', 3, false, null, true),
  ('Tome', 'Apresentações & Visual', 'Criar apresentações narrativas com IA', 'Slides gerados por prompt, storytelling visual', 'https://tome.app', 4, true, null, true),
  ('Midjourney', 'Apresentações & Visual', 'Gerar imagens profissionais com IA', 'Imagens para apresentações, marketing, conceitos visuais', 'https://midjourney.com', 4, false, null, true),
  ('DALL-E 3', 'Apresentações & Visual', 'Criar imagens via ChatGPT', 'Imagens geradas por texto, integrado ao ChatGPT', 'https://openai.com/dall-e-3', 4, false, true, true),
  ('Ideogram', 'Apresentações & Visual', 'Gerar imagens com texto legível', 'Logos, posters, imagens com tipografia correta', 'https://ideogram.ai', 4, true, true, true);

-- CATEGORIA: DESENVOLVIMENTO
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('Lovable (GPT Engineer)', 'Desenvolvimento', 'Criar apps web com IA', 'Landing pages, dashboards, ferramentas customizadas sem código', 'https://lovable.dev', 5, false, true, true),
  ('Cursor', 'Desenvolvimento', 'Editor de código com IA integrada', 'Autocompletar código, debugar, explicar funções', 'https://cursor.sh', 5, true, true, true),
  ('Replit AI', 'Desenvolvimento', 'Programar no navegador com IA', 'Apps funcionais, APIs, automações com código gerado por IA', 'https://replit.com', 4, true, true, true),
  ('Bubble', 'Desenvolvimento', 'Criar apps complexos sem código', 'Sistemas completos, CRMs customizados, marketplaces', 'https://bubble.io', 4, true, true, true),
  ('Webflow AI', 'Desenvolvimento', 'Criar sites profissionais sem código', 'Sites responsivos, landing pages, portfolios', 'https://webflow.com', 4, true, null, true),
  ('Bolt.new', 'Desenvolvimento', 'Criar apps web full-stack instantaneamente', 'Apps funcionais em segundos, deploy imediato', 'https://bolt.new', 4, true, true, true);

-- CATEGORIA: PRODUTIVIDADE
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('Otter.ai', 'Produtividade', 'Transcrever reuniões automaticamente', 'Atas de reunião, transcrições, resumos de calls', 'https://otter.ai', 4, true, true, true),
  ('Fireflies.ai', 'Produtividade', 'Gravar e transcrever calls', 'Transcrições, resumos, action items extraídos', 'https://fireflies.ai', 4, true, true, true),
  ('Superhuman (com IA)', 'Produtividade', 'Email profissional otimizado', 'Inbox zero, respostas automáticas, follow-ups inteligentes', 'https://superhuman.com', 3, false, false, true),
  ('Motion', 'Produtividade', 'Calendário inteligente com IA', 'Agenda otimizada automaticamente, gestão de tarefas', 'https://usemotion.com', 4, false, null, true),
  ('Reclaim AI', 'Produtividade', 'Proteger tempo de foco no calendário', 'Bloqueios automáticos de tempo, otimização de reuniões', 'https://reclaim.ai', 4, true, true, true),
  ('Tango', 'Produtividade', 'Criar tutoriais automaticamente', 'Guias passo a passo com screenshots automáticos', 'https://tango.us', 4, true, true, true),
  ('Clickup AI', 'Produtividade', 'Gestão de projetos com IA', 'Criação de tarefas, resumos de projetos, automações', 'https://clickup.com', 3, true, null, true),
  ('Microsoft Copilot', 'Produtividade', 'IA integrada ao Office 365', 'Resumos de emails, criação de documentos, análise de Excel', 'https://microsoft.com/copilot', 4, false, null, true);

-- CATEGORIA: ÁUDIO & VÍDEO
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('ElevenLabs', 'Áudio & Vídeo', 'Gerar vozes realistas com IA', 'Narração profissional, voiceover, dubbing', 'https://elevenlabs.io', 5, true, true, true),
  ('Descript', 'Áudio & Vídeo', 'Editar vídeo editando texto', 'Edição de podcast/vídeo, transcrição, remoção de "ãh"', 'https://descript.com', 5, true, true, true),
  ('Riverside.fm (com IA)', 'Áudio & Vídeo', 'Gravar podcasts com qualidade de estúdio', 'Gravação remota, transcrição, edição automática', 'https://riverside.fm', 4, true, true, true),
  ('Opus Clip', 'Áudio & Vídeo', 'Cortar vídeos longos em shorts', 'Clips curtos automáticos de vídeos longos (YouTube → TikTok)', 'https://opus.pro', 4, true, true, true),
  ('Runway ML', 'Áudio & Vídeo', 'Edição de vídeo com IA generativa', 'Efeitos visuais, geração de vídeo, remoção de fundo', 'https://runwayml.com', 4, true, null, true),
  ('HeyGen', 'Áudio & Vídeo', 'Criar avatares falando com IA', 'Vídeos com avatar digital, tradução automática', 'https://heygen.com', 3, false, null, true),
  ('Loom (com IA)', 'Áudio & Vídeo', 'Gravar tela com transcrição automática', 'Vídeos de tutorial, resumos automáticos, capítulos', 'https://loom.com', 4, true, true, true);

-- CATEGORIA: PESQUISA & CONHECIMENTO
INSERT INTO ferramentas_ia (nome, categoria, objetivo, o_que_entrega, link_ferramenta, avaliacao, gratuito, vale_a_pena, ativo)
VALUES
  ('Perplexity AI', 'Pesquisa & Conhecimento', 'Buscar informações com fontes verificadas', 'Respostas citadas, pesquisa acadêmica, fact-checking', 'https://perplexity.ai', 5, true, true, true),
  ('Consensus', 'Pesquisa & Conhecimento', 'Pesquisar papers científicos com IA', 'Resumos de estudos, evidências científicas, citações', 'https://consensus.app', 4, true, true, true),
  ('Elicit', 'Pesquisa & Conhecimento', 'Analisar artigos acadêmicos', 'Resumos de papers, extração de dados de estudos', 'https://elicit.org', 4, true, true, true),
  ('SciSpace (Typeset)', 'Pesquisa & Conhecimento', 'Ler e entender papers científicos', 'Explicações simplificadas de papers, resumos, perguntas ao paper', 'https://scispace.com', 4, true, true, true),
  ('ChatPDF', 'Pesquisa & Conhecimento', 'Conversar com PDFs', 'Sobe PDF, faz perguntas, extrai informações específicas', 'https://chatpdf.com', 3, true, null, true),
  ('Humata', 'Pesquisa & Conhecimento', 'Analisar documentos longos', 'Resumos de contratos, análise de relatórios, extração de dados', 'https://humata.ai', 3, true, null, true),
  ('You.com', 'Pesquisa & Conhecimento', 'Buscar na web com IA', 'Resultados de busca contextualizados, resumos, apps integrados', 'https://you.com', 3, true, null, true);

-- Atualizar Manus AI existente para a nova categoria e informações
UPDATE ferramentas_ia 
SET 
  categoria = 'Produtividade',
  objetivo = 'Assistente visual para automação',
  o_que_entrega = 'Dashboards automatizados, integração visual de dados',
  link_ferramenta = 'https://manus.ai',
  avaliacao = 5,
  gratuito = false,
  vale_a_pena = true
WHERE nome = 'Manus' OR nome = 'Manus AI';