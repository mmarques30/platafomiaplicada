-- Criar tabela documentos_legais
CREATE TABLE public.documentos_legais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  conteudo_mentorados TEXT NOT NULL,
  conteudo_visitantes TEXT,
  apenas_mentorados BOOLEAN DEFAULT false,
  ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentos_legais ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar
CREATE POLICY "Admins can manage documentos_legais"
ON public.documentos_legais FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Usuários autenticados podem ler
CREATE POLICY "Authenticated users can view documentos_legais"
ON public.documentos_legais FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER update_documentos_legais_updated_at
BEFORE UPDATE ON public.documentos_legais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir Política de Vendas (apenas mentorados)
INSERT INTO public.documentos_legais (slug, titulo, conteudo_mentorados, conteudo_visitantes, apenas_mentorados)
VALUES (
  'politica-vendas',
  'Política de Vendas – IAPLICADA',
  '# Política de Vendas – IAPLICADA

**Última atualização: 04 de dezembro de 2025**

Esta Política de Vendas estabelece as regras, condições comerciais e direitos aplicáveis às transações realizadas junto à **IAPLICADA EDUCAÇÃO LTDA**, inscrita no CNPJ 61.687.484/0001-83. Ao adquirir qualquer produto ou serviço da IAPLICADA, o cliente declara estar ciente e de acordo com todos os termos aqui descritos.

---

## 1. DEFINIÇÕES

Para os fins desta Política de Vendas, consideram-se:

- **IAPLICADA**: IAPLICADA EDUCAÇÃO LTDA, CNPJ 61.687.484/0001-83
- **CLIENTE**: Pessoa física ou jurídica que adquire qualquer produto ou serviço da IAPLICADA
- **MENTORADO**: Cliente que adquire produtos que incluem acesso à plataforma educacional
- **PLATAFORMA**: Ambiente digital onde os conteúdos e serviços são disponibilizados

---

## 2. PRODUTOS E SERVIÇOS COMERCIALIZADOS

### 2.1. Academy (B2C Individual)
- **Valor**: R$ 1.397,00 (pagamento único)
- **Duração do acesso**: Vitalício
- **Conteúdo**: Acesso completo às trilhas de aprendizado da plataforma
- **Formato**: 100% online, autoguiado

### 2.2. Lab (B2C Mentoria em Grupo)
- **Valor standalone**: R$ 3.497,00
- **Valor upgrade** (para quem já tem Academy ou Skills): + R$ 1.100,00
- **Duração**: 6 semanas de aulas ao vivo
- **Formato**: Encontros semanais em grupo + acesso à plataforma

### 2.3. Skills (B2B Licença Corporativa)
- **Valor**: R$ 297,00 por pessoa/mês
- **Mínimo**: 3 licenças
- **Conteúdo**: Trilhas personalizadas + métricas de equipe
- **Formato**: Acesso corporativo com gestão centralizada

### 2.4. Club (B2C/B2B Premium 1:1)
- **Valor standalone**: R$ 7.997,00
- **Valor para alumni Lab**: R$ 6.497,00
- **Conteúdo**: 6 a 12 sessões individuais de mentoria
- **Formato**: Acompanhamento personalizado 1:1

### 2.5. Consult (B2B Consultoria)
- **Valor**: R$ 15.000,00 a R$ 50.000,00 (sob consulta)
- **Duração**: 3 a 6 meses
- **Inclui**: 1 licença vitalícia Academy para gestor do projeto
- **Formato**: Done For You + capacitação de equipe

---

## 3. FORMAS DE PAGAMENTO

### 3.1. Meios de Pagamento Aceitos
- Cartão de crédito (parcelamento em até 12x)
- PIX (pagamento à vista)
- Boleto bancário (pagamento à vista)
- Transferência bancária (para B2B)

### 3.2. Parcelamento
- O parcelamento está sujeito a juros da operadora de cartão
- A IAPLICADA não se responsabiliza por taxas adicionais cobradas pela instituição financeira
- Em caso de estorno parcial, os valores serão recalculados proporcionalmente

### 3.3. Confirmação de Pagamento
- Pagamentos via cartão: liberação imediata
- Pagamentos via PIX: liberação em até 30 minutos
- Pagamentos via boleto: liberação em até 3 dias úteis após compensação

---

## 4. POLÍTICA DE REEMBOLSO E CANCELAMENTO

### 4.1. Direito de Arrependimento (CDC)
Conforme o artigo 49 do Código de Defesa do Consumidor, o cliente pessoa física tem direito ao arrependimento em até **7 (sete) dias corridos** a partir da data da compra ou do primeiro acesso ao conteúdo, o que ocorrer por último.

### 4.2. Condições para Reembolso Integral
O reembolso integral será concedido quando:
- Solicitado dentro do prazo de 7 dias
- O cliente não tenha acessado mais de 20% do conteúdo disponível
- Não tenha participado de sessões de mentoria (Lab/Club)

### 4.3. Reembolso Parcial ou Não Aplicável
- Após o prazo de 7 dias: não há direito a reembolso
- Acesso superior a 20% do conteúdo: reembolso proporcional ao não consumido
- Participação em sessão de mentoria: desconto do valor proporcional da sessão
- Licenças corporativas (Skills): conforme contrato específico

### 4.4. Procedimento para Solicitação
1. Enviar e-mail para contato@iaplicada.com com assunto "Solicitação de Reembolso"
2. Informar: nome completo, e-mail cadastrado, produto adquirido, data da compra
3. Descrever o motivo da solicitação
4. Prazo de análise: até 5 dias úteis
5. Prazo de estorno: até 30 dias após aprovação (conforme operadora)

### 4.5. Situações Especiais
- **Problemas técnicos**: Se o cliente não conseguir acessar a plataforma por falha técnica comprovada da IAPLICADA, o prazo de 7 dias será contado a partir da resolução do problema
- **Cancelamento por parte da IAPLICADA**: Em caso de descontinuação de produto, o cliente será reembolsado integralmente ou terá direito a migração para produto equivalente

---

## 5. ACESSO À PLATAFORMA E CONTEÚDO

### 5.1. Credenciais de Acesso
- O acesso é pessoal e intransferível
- O compartilhamento de credenciais pode resultar em suspensão ou cancelamento da conta
- A IAPLICADA não se responsabiliza por acessos não autorizados decorrentes de negligência do cliente

### 5.2. Disponibilidade do Conteúdo
- Conteúdo com acesso vitalício: disponível enquanto a plataforma existir
- Conteúdo com prazo determinado: disponível pelo período contratado
- A IAPLICADA reserva-se o direito de atualizar, substituir ou remover conteúdos obsoletos

### 5.3. Atualizações
- Atualizações de conteúdo estão incluídas para produtos com acesso vitalício
- Novos módulos ou funcionalidades podem ser disponibilizados mediante upgrade

---

## 6. UPGRADES E UPSELLS

### 6.1. Upgrade de Produto
Clientes com produtos ativos podem fazer upgrade para planos superiores:
- Academy → Lab: diferença de R$ 1.100,00
- Skills → Lab: diferença de R$ 1.100,00
- Lab → Club: diferença de R$ 2.500,00 (valor promocional)

### 6.2. Renovações
- Lab: renovação anual por R$ 2.497,00 (economia de R$ 1.000,00)
- Skills: renovação automática mensal (pode ser cancelada com 30 dias de antecedência)

### 6.3. Ofertas Especiais
A IAPLICADA pode oferecer descontos promocionais que não se aplicam retroativamente a compras anteriores.

---

## 7. OBRIGAÇÕES DO CLIENTE

### 7.1. O cliente compromete-se a:
- Fornecer informações verdadeiras e atualizadas
- Manter suas credenciais de acesso em sigilo
- Não reproduzir, distribuir ou comercializar o conteúdo
- Respeitar os direitos de propriedade intelectual da IAPLICADA
- Utilizar a plataforma de forma ética e respeitosa

### 7.2. Proibições
É expressamente proibido:
- Compartilhar acesso com terceiros
- Gravar ou baixar conteúdos para redistribuição
- Utilizar o conteúdo para fins comerciais sem autorização
- Praticar qualquer forma de engenharia reversa na plataforma

---

## 8. PROPRIEDADE INTELECTUAL

### 8.1. Titularidade
Todo o conteúdo disponibilizado (textos, vídeos, materiais, metodologias, templates) é de propriedade exclusiva da IAPLICADA ou licenciado por terceiros com autorização.

### 8.2. Licença de Uso
A aquisição de produtos confere ao cliente uma licença limitada, não exclusiva e intransferível para uso pessoal ou empresarial (conforme o produto adquirido), vedada qualquer forma de reprodução ou distribuição.

### 8.3. Materiais Criados pelo Cliente
Materiais criados pelo cliente utilizando templates ou metodologias da IAPLICADA são de propriedade do cliente, respeitadas as diretrizes de uso dos templates.

---

## 9. LIMITAÇÃO DE RESPONSABILIDADE

### 9.1. A IAPLICADA não se responsabiliza por:
- Resultados específicos não garantidos (o sucesso depende da aplicação individual)
- Problemas de conexão ou acesso decorrentes de terceiros
- Uso indevido do conteúdo pelo cliente
- Perdas indiretas, lucros cessantes ou danos consequenciais

### 9.2. Responsabilidade Máxima
Em qualquer hipótese, a responsabilidade da IAPLICADA limita-se ao valor pago pelo cliente pelo produto específico.

---

## 10. PROTEÇÃO DE DADOS

### 10.1. Tratamento de Dados
Os dados pessoais coletados são tratados conforme a Lei Geral de Proteção de Dados (LGPD) e nossa Política de Privacidade.

### 10.2. Finalidades
Os dados são utilizados para:
- Processamento de pagamentos
- Liberação de acesso à plataforma
- Comunicações sobre o produto adquirido
- Melhorias na experiência do usuário

### 10.3. Compartilhamento
Dados podem ser compartilhados com:
- Processadores de pagamento (para transações financeiras)
- Plataformas de hospedagem (para entrega do serviço)
- Autoridades (quando exigido por lei)

---

## 11. COMUNICAÇÕES

### 11.1. Canais Oficiais
- E-mail: contato@iaplicada.com
- WhatsApp: disponível na plataforma
- Plataforma: área de suporte

### 11.2. Comunicações da IAPLICADA
O cliente autoriza o recebimento de comunicações sobre:
- Informações essenciais do produto adquirido
- Atualizações de conteúdo
- Novidades e lançamentos (com opção de descadastro)

---

## 12. DISPOSIÇÕES GERAIS

### 12.1. Alterações
Esta Política de Vendas pode ser alterada a qualquer momento. Alterações significativas serão comunicadas com antecedência de 30 dias. A continuidade do uso após alterações implica aceitação dos novos termos.

### 12.2. Cessão
O cliente não pode ceder ou transferir os direitos desta relação contratual sem autorização prévia da IAPLICADA.

### 12.3. Integralidade
Esta Política de Vendas, juntamente com os Termos de Uso e Política de Privacidade, constitui o acordo integral entre as partes.

### 12.4. Foro
Fica eleito o foro da Comarca de Belo Horizonte/MG para dirimir quaisquer questões decorrentes desta Política, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

---

## 13. CONTATO

**IAPLICADA EDUCAÇÃO LTDA**  
CNPJ: 61.687.484/0001-83  
E-mail: contato@iaplicada.com  
Site: www.iaplicada.com

---

*Ao realizar uma compra, você declara ter lido, compreendido e concordado integralmente com esta Política de Vendas.*',
  NULL,
  true
);

-- Inserir Termos de Uso (mentorados) e Política de Uso Gratuito (visitantes)
INSERT INTO public.documentos_legais (slug, titulo, conteudo_mentorados, conteudo_visitantes, apenas_mentorados)
VALUES (
  'termos-uso',
  'Termos de Uso – IAPLICADA',
  '# Termos de Uso – IAPLICADA

**Última atualização: 04 de dezembro de 2025**

Estes Termos de Uso estabelecem as regras e condições para acesso e utilização da plataforma educacional da **IAPLICADA EDUCAÇÃO LTDA**, inscrita no CNPJ 61.687.484/0001-83. Ao acessar ou utilizar nossa plataforma, você concorda integralmente com estes termos.

---

## 1. DEFINIÇÕES

Para os fins destes Termos de Uso, consideram-se:

- **IAPLICADA**: IAPLICADA EDUCAÇÃO LTDA, CNPJ 61.687.484/0001-83
- **PLATAFORMA**: Ambiente digital onde os conteúdos e serviços são disponibilizados
- **USUÁRIO/MENTORADO**: Pessoa física ou jurídica que acessa a plataforma mediante aquisição de produto
- **CONTEÚDO**: Materiais educacionais, vídeos, textos, templates, metodologias e quaisquer outros materiais disponibilizados
- **CONTA**: Cadastro pessoal do usuário na plataforma

---

## 2. ACEITAÇÃO DOS TERMOS

### 2.1.
Ao criar uma conta ou acessar a plataforma, você declara ter lido, compreendido e concordado com estes Termos de Uso, com a Política de Privacidade e com a Política de Vendas.

### 2.2.
Se você não concordar com qualquer disposição destes termos, não deve utilizar a plataforma.

### 2.3.
A IAPLICADA reserva-se o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma com antecedência mínima de 30 dias.

---

## 3. CADASTRO E CONTA

### 3.1. Criação de Conta
O acesso à plataforma requer a criação de uma conta com informações precisas, completas e atualizadas.

### 3.2. Responsabilidade pelas Informações
O usuário é responsável pela veracidade das informações fornecidas e deve mantê-las atualizadas.

### 3.3. Credenciais de Acesso
- O acesso é pessoal e intransferível
- O usuário é responsável pela confidencialidade de suas credenciais
- Qualquer atividade realizada com suas credenciais será de sua responsabilidade
- Em caso de suspeita de uso não autorizado, comunique imediatamente à IAPLICADA

### 3.4. Idade Mínima
O usuário declara ter no mínimo 18 anos ou, se menor, possuir autorização expressa de seus responsáveis legais.

---

## 4. LICENÇA DE USO

### 4.1. Concessão
A IAPLICADA concede ao usuário uma licença limitada, não exclusiva, intransferível e revogável para acessar e utilizar o conteúdo da plataforma conforme o produto adquirido.

### 4.2. Restrições
O usuário NÃO está autorizado a:
- Copiar, reproduzir ou duplicar o conteúdo
- Distribuir, transmitir ou compartilhar o conteúdo
- Modificar, adaptar ou criar obras derivadas
- Vender, sublicenciar ou comercializar o conteúdo
- Utilizar o conteúdo para fins não previstos nestes termos
- Compartilhar credenciais de acesso com terceiros

### 4.3. Violação
A violação destas restrições pode resultar em:
- Suspensão imediata do acesso
- Cancelamento da conta sem reembolso
- Medidas legais cabíveis

---

## 5. CONTEÚDO DA PLATAFORMA

### 5.1. Propriedade Intelectual
Todo o conteúdo disponibilizado na plataforma é de propriedade exclusiva da IAPLICADA ou de terceiros licenciadores, protegido por leis de propriedade intelectual.

### 5.2. Atualizações
A IAPLICADA pode, a seu exclusivo critério:
- Atualizar, modificar ou substituir conteúdos
- Adicionar novos módulos ou funcionalidades
- Remover conteúdos obsoletos ou desatualizados
- Alterar a estrutura ou organização dos materiais

### 5.3. Disponibilidade
- A IAPLICADA envidará esforços para manter a plataforma disponível 24/7
- Manutenções programadas serão comunicadas com antecedência
- Não há garantia de disponibilidade ininterrupta

---

## 6. CONDUTA DO USUÁRIO

### 6.1. Compromissos
O usuário compromete-se a:
- Utilizar a plataforma de forma ética e respeitosa
- Respeitar outros usuários em interações na comunidade
- Não praticar qualquer forma de assédio, discriminação ou ofensa
- Não disseminar informações falsas ou prejudiciais
- Reportar violações de outros usuários

### 6.2. Proibições
É expressamente proibido:
- Tentar acessar áreas restritas da plataforma
- Utilizar bots, scrapers ou sistemas automatizados
- Interferir no funcionamento da plataforma
- Praticar engenharia reversa
- Violar a privacidade de outros usuários

---

## 7. COMUNIDADE E INTERAÇÕES

### 7.1. Participação
A participação na comunidade está sujeita às regras de conduta estabelecidas nestes termos e nas diretrizes específicas da comunidade.

### 7.2. Conteúdo Gerado pelo Usuário
- O usuário é responsável pelo conteúdo que publica
- Ao publicar, concede à IAPLICADA licença para utilizar o conteúdo na plataforma
- A IAPLICADA pode remover conteúdo que viole estes termos

### 7.3. Moderação
A IAPLICADA reserva-se o direito de moderar, editar ou remover conteúdos e de restringir ou banir usuários que violem as regras.

---

## 8. MENTORIA E SESSÕES AO VIVO

### 8.1. Agendamento
- Sessões devem ser agendadas conforme disponibilidade
- Remarcações seguem as regras específicas de cada produto

### 8.2. Participação
- A pontualidade é responsabilidade do usuário
- Ausências não geram direito a reposição automática
- Gravações (quando disponíveis) são para uso pessoal do participante

### 8.3. Confidencialidade
Informações compartilhadas por outros participantes em sessões de grupo são confidenciais e não devem ser divulgadas.

---

## 9. PROTEÇÃO DE DADOS

### 9.1. Tratamento
Os dados pessoais são tratados conforme nossa Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD).

### 9.2. Direitos do Titular
O usuário pode exercer seus direitos previstos na LGPD através do e-mail contato@iaplicada.com.

---

## 10. LIMITAÇÃO DE RESPONSABILIDADE

### 10.1. Isenções
A IAPLICADA não se responsabiliza por:
- Resultados específicos (o sucesso depende da aplicação individual)
- Problemas de conexão do usuário
- Uso indevido da plataforma ou do conteúdo
- Interações entre usuários na comunidade
- Perdas indiretas ou danos consequenciais

### 10.2. Responsabilidade Máxima
A responsabilidade total da IAPLICADA limita-se ao valor pago pelo usuário pelo produto específico.

---

## 11. SUSPENSÃO E CANCELAMENTO

### 11.1. Pela IAPLICADA
A IAPLICADA pode suspender ou cancelar o acesso do usuário em caso de:
- Violação destes Termos de Uso
- Violação de direitos de propriedade intelectual
- Conduta inadequada na comunidade
- Inadimplência (quando aplicável)
- Determinação judicial ou legal

### 11.2. Pelo Usuário
O usuário pode solicitar o cancelamento de sua conta a qualquer momento, observadas as condições da Política de Vendas quanto a reembolsos.

---

## 12. COMUNICAÇÕES

### 12.1. Canais Oficiais
- E-mail: contato@iaplicada.com
- WhatsApp: disponível na plataforma
- Suporte: área dedicada na plataforma

### 12.2. Notificações
O usuário concorda em receber comunicações da IAPLICADA por e-mail e notificações na plataforma sobre assuntos essenciais ao serviço.

---

## 13. DISPOSIÇÕES GERAIS

### 13.1. Integralidade
Estes Termos de Uso, juntamente com a Política de Vendas e a Política de Privacidade, constituem o acordo integral entre as partes.

### 13.2. Independência das Cláusulas
Se qualquer disposição for considerada inválida, as demais permanecerão em pleno vigor.

### 13.3. Tolerância
A não exigência de qualquer disposição não constitui renúncia ao direito de exigi-la posteriormente.

### 13.4. Cessão
O usuário não pode ceder ou transferir direitos ou obrigações destes termos sem autorização prévia da IAPLICADA.

### 13.5. Foro
Fica eleito o foro da Comarca de Belo Horizonte/MG para dirimir quaisquer questões, com renúncia a qualquer outro.

---

## 14. CONTATO

**IAPLICADA EDUCAÇÃO LTDA**  
CNPJ: 61.687.484/0001-83  
E-mail: contato@iaplicada.com  
Site: www.iaplicada.com

---

*Ao utilizar nossa plataforma, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso.*',
  '# Política de Uso – Acesso Gratuito – IAPLICADA

**Última atualização: 04 de dezembro de 2025**

Esta Política de Uso estabelece as regras e condições para o acesso e utilização dos recursos gratuitos oferecidos pela **IAPLICADA EDUCAÇÃO LTDA**, incluindo materiais educacionais gratuitos e participação na comunidade integrada. Ao criar uma conta gratuita ou acessar nossos recursos sem custo, você concorda integralmente com estes termos.

---

## 1. DEFINIÇÕES

Para os fins desta Política de Uso, consideram-se:

- **IAPLICADA**: IAPLICADA EDUCAÇÃO LTDA, CNPJ 61.687.484/0001-83
- **USUÁRIO GRATUITO**: Pessoa física que cria uma conta e acessa os recursos gratuitos da IAPLICADA sem realizar pagamento
- **RECURSOS GRATUITOS**: Materiais educacionais, conteúdos, ferramentas e funcionalidades disponibilizados gratuitamente pela IAPLICADA
- **COMUNIDADE**: Espaço integrado (fórum, grupo, chat ou plataforma) onde usuários podem interagir, trocar experiências e participar de discussões
- **PLATAFORMA**: Ambiente online (site, aplicativo ou sistema) onde os recursos gratuitos são disponibilizados

---

## 2. ACEITAÇÃO DOS TERMOS

### 2.1.
A aceitação desta Política de Uso ocorre no momento do cadastro ou do primeiro acesso aos recursos gratuitos da IAPLICADA.

### 2.2.
Caso não concorde com qualquer disposição destes termos, você não deve criar uma conta ou utilizar os recursos gratuitos.

### 2.3.
A IAPLICADA reserva-se o direito de alterar esta Política de Uso a qualquer momento. As alterações entrarão em vigor na data de sua publicação. O uso continuado dos recursos após a publicação de alterações constitui aceitação dos novos termos.

---

## 3. CADASTRO E CONTA GRATUITA

### 3.1. Criação de Conta
Para acessar os recursos gratuitos, o Usuário deve criar uma conta fornecendo informações precisas, completas e atualizadas, incluindo nome, e-mail e senha.

### 3.2. Responsabilidade pelas Informações
O Usuário é responsável pela veracidade das informações fornecidas. A IAPLICADA não se responsabiliza por prejuízos decorrentes de informações incorretas ou desatualizadas.

### 3.3. Credenciais de Acesso
O acesso à conta é pessoal e intransferível. O Usuário é responsável por manter a confidencialidade de suas credenciais (login e senha) e por todas as atividades que ocorrerem em sua conta.

### 3.4. Idade Mínima
O Usuário declara ter no mínimo 18 (dezoito) anos de idade ou, se menor, possuir autorização expressa de seus responsáveis legais para criar uma conta e utilizar os recursos.

### 3.5. Encerramento de Conta
A IAPLICADA reserva-se o direito de suspender ou encerrar contas que violem esta Política de Uso, sem aviso prévio.

---

## 4. RECURSOS GRATUITOS DISPONIBILIZADOS

### 4.1. Materiais Educacionais Gratuitos
A IAPLICADA disponibiliza, a seu critério, materiais educacionais gratuitos, que podem incluir:
- Artigos e conteúdos em blog
- E-books e guias introdutórios
- Vídeos e webinars gratuitos
- Templates e ferramentas básicas
- Acesso a trilhas ou módulos introdutórios

### 4.2. Comunidade Integrada
O Usuário Gratuito pode participar da comunidade integrada da IAPLICADA, onde poderá:
- Interagir com outros membros
- Participar de discussões e fóruns
- Compartilhar experiências e aprendizados
- Fazer perguntas e trocar conhecimentos

### 4.3. Limitações do Acesso Gratuito
O acesso gratuito possui limitações em relação aos planos pagos, podendo incluir:
- Acesso restrito a determinados conteúdos premium
- Funcionalidades limitadas da plataforma
- Ausência de suporte prioritário ou personalizado
- Restrições de participação em eventos ao vivo pagos

### 4.4. Alterações nos Recursos Gratuitos
A IAPLICADA reserva-se o direito de, a qualquer momento e a seu exclusivo critério:
- Modificar, suspender ou descontinuar qualquer recurso gratuito
- Alterar as condições de acesso aos recursos gratuitos
- Limitar a quantidade ou frequência de uso de determinados recursos
- Converter recursos gratuitos em recursos pagos

---

## 5. CONDUTA DO USUÁRIO

### 5.1. Uso Apropriado
O Usuário compromete-se a utilizar os recursos gratuitos de forma ética, respeitosa e em conformidade com a legislação aplicável.

### 5.2. Proibições
É expressamente proibido ao Usuário:
- Reproduzir, copiar, distribuir ou compartilhar os materiais disponibilizados
- Utilizar os conteúdos para fins comerciais sem autorização prévia da IAPLICADA
- Publicar, transmitir ou compartilhar conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de terceiros
- Praticar assédio, bullying, intimidação ou qualquer forma de conduta inadequada
- Disseminar spam, vírus, malware ou qualquer código malicioso
- Tentar acessar áreas restritas ou sistemas não autorizados da plataforma
- Criar múltiplas contas para burlar limitações ou obter vantagens indevidas
- Utilizar bots, scripts ou sistemas automatizados para acessar os recursos

### 5.3. Consequências de Violações
Em caso de violação desta Política de Uso, a IAPLICADA poderá:
- Emitir advertências
- Suspender temporariamente o acesso
- Banir permanentemente o Usuário da plataforma e comunidade
- Tomar medidas legais cabíveis

---

## 6. PARTICIPAÇÃO NA COMUNIDADE

### 6.1. Regras de Convivência
A participação na comunidade está condicionada ao respeito às seguintes regras:
- Tratar todos os membros com respeito e cordialidade
- Contribuir de forma construtiva nas discussões
- Não divulgar informações pessoais de outros membros sem autorização
- Não utilizar a comunidade para autopromoção excessiva ou spam
- Respeitar as orientações dos moderadores e administradores

### 6.2. Conteúdo Gerado pelo Usuário
- O Usuário é o único responsável pelo conteúdo que publica na comunidade
- Ao publicar conteúdo, o Usuário concede à IAPLICADA uma licença não exclusiva para utilizar, reproduzir e exibir tal conteúdo no âmbito da plataforma
- A IAPLICADA pode remover qualquer conteúdo que viole esta Política de Uso ou que considere inadequado

### 6.3. Moderação
A IAPLICADA reserva-se o direito de moderar, editar ou remover conteúdos publicados pelos Usuários, bem como de restringir ou banir Usuários que descumpram as regras de convivência.

---

## 7. PROPRIEDADE INTELECTUAL

### 7.1. Titularidade
Todo o conteúdo disponibilizado pela IAPLICADA (textos, vídeos, imagens, materiais, templates, metodologias, marcas e logotipos) é de propriedade exclusiva da IAPLICADA ou de terceiros licenciadores, protegido por leis de propriedade intelectual.

### 7.2. Licença Limitada
O acesso gratuito confere ao Usuário uma licença limitada, não exclusiva, intransferível e revogável apenas para visualização e uso pessoal dos materiais, sendo vedada qualquer forma de reprodução, distribuição ou comercialização.

### 7.3. Restrições
O Usuário NÃO está autorizado a:
- Copiar, reproduzir ou duplicar os materiais
- Distribuir, transmitir ou disponibilizar os materiais a terceiros
- Modificar, adaptar ou criar obras derivadas
- Remover marcas d''água, logotipos ou avisos de direitos autorais
- Utilizar os materiais para fins comerciais

---

## 8. ISENÇÃO DE GARANTIAS

### 8.1. "No Estado em que Se Encontra"
Os recursos gratuitos são disponibilizados "no estado em que se encontram" (as is), sem garantias de qualquer natureza, expressas ou implícitas.

### 8.2. Isenções Específicas
A IAPLICADA não garante:
- Que os recursos estarão sempre disponíveis ou funcionarão sem interrupções
- Que os materiais atenderão às expectativas ou necessidades específicas do Usuário
- A precisão, completude ou atualidade de todas as informações
- Resultados específicos decorrentes do uso dos recursos

---

## 9. LIMITAÇÃO DE RESPONSABILIDADE

### 9.1. Isenções
A IAPLICADA não se responsabiliza por:
- Danos diretos, indiretos, incidentais, consequenciais ou punitivos
- Perda de dados, lucros ou oportunidades
- Problemas técnicos, falhas de conexão ou indisponibilidade da plataforma
- Interações entre Usuários na comunidade
- Uso inadequado dos recursos pelo Usuário
- Decisões tomadas com base nos conteúdos disponibilizados

### 9.2. Responsabilidade Máxima
Considerando que os recursos são gratuitos, a responsabilidade da IAPLICADA, em qualquer hipótese, limita-se à disponibilização de novo acesso aos recursos, não cabendo qualquer indenização pecuniária.

---

## 10. PROTEÇÃO DE DADOS

### 10.1. Tratamento de Dados
Os dados pessoais coletados durante o cadastro e uso dos recursos gratuitos são tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD) e com a Política de Privacidade da IAPLICADA.

### 10.2. Finalidades
Os dados são utilizados para:
- Criação e gerenciamento da conta
- Disponibilização dos recursos gratuitos
- Comunicações sobre os serviços da IAPLICADA
- Melhorias na experiência do usuário
- Marketing (com consentimento)

### 10.3. Direitos do Titular
O Usuário pode exercer seus direitos previstos na LGPD (acesso, correção, exclusão, portabilidade, etc.) através do e-mail contato@iaplicada.com.

---

## 11. COMUNICAÇÕES E MARKETING

### 11.1. Comunicações Essenciais
Ao criar uma conta, o Usuário autoriza o recebimento de comunicações essenciais relacionadas aos recursos gratuitos, como:
- Confirmação de cadastro
- Avisos sobre alterações nos termos ou recursos
- Notificações importantes da plataforma

### 11.2. Comunicações de Marketing
O Usuário poderá receber comunicações de marketing sobre produtos e serviços da IAPLICADA, podendo descadastrar-se a qualquer momento através do link disponível em cada comunicação ou nas configurações da conta.

---

## 12. CONVERSÃO PARA PLANOS PAGOS

### 12.1. Oferta de Upgrade
A IAPLICADA poderá oferecer ao Usuário Gratuito a oportunidade de adquirir planos pagos com benefícios adicionais.

### 12.2. Condições Comerciais
Em caso de contratação de planos pagos, aplicar-se-ão os Termos de Uso completos e a Política de Vendas da IAPLICADA, que regerão integralmente a relação comercial.

---

## 13. VIGÊNCIA E ENCERRAMENTO

### 13.1. Vigência
Esta Política de Uso permanece em vigor enquanto o Usuário mantiver sua conta ativa ou utilizar os recursos gratuitos.

### 13.2. Encerramento pelo Usuário
O Usuário pode encerrar sua conta gratuita a qualquer momento através das configurações da plataforma ou mediante solicitação por e-mail.

### 13.3. Encerramento pela IAPLICADA
A IAPLICADA pode encerrar a conta do Usuário ou descontinuar os recursos gratuitos a qualquer momento, a seu exclusivo critério, mediante aviso prévio quando possível.

### 13.4. Efeitos do Encerramento
Após o encerramento:
- O acesso aos recursos gratuitos será imediatamente revogado
- O Usuário perderá acesso a qualquer conteúdo ou histórico de participação na comunidade
- Dados pessoais serão tratados conforme a Política de Privacidade

---

## 14. DISPOSIÇÕES GERAIS

### 14.1. Integralidade
Esta Política de Uso constitui o acordo integral entre o Usuário e a IAPLICADA quanto ao uso dos recursos gratuitos.

### 14.2. Independência das Cláusulas
Se qualquer disposição for considerada inválida ou inexequível, as demais permanecerão em pleno vigor e efeito.

### 14.3. Tolerância
A não exigência de qualquer disposição pelo não cumprimento do Usuário não constitui renúncia ao direito de exigi-la posteriormente.

### 14.4. Cessão
O Usuário não pode ceder ou transferir direitos ou obrigações desta Política de Uso sem autorização prévia e expressa da IAPLICADA.

### 14.5. Foro
Fica eleito o foro da Comarca de Belo Horizonte/MG para dirimir quaisquer questões decorrentes desta Política de Uso, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

---

## 15. CONTATO

Para dúvidas, sugestões ou solicitações relacionadas a esta Política de Uso ou aos recursos gratuitos, entre em contato:

**IAPLICADA EDUCAÇÃO LTDA**  
CNPJ: 61.687.484/0001-83  
E-mail: contato@iaplicada.com  
Site: www.iaplicada.com

---

*Ao criar uma conta gratuita ou utilizar nossos recursos sem custo, você declara ter lido, compreendido e concordado integralmente com esta Política de Uso.*',
  false
);