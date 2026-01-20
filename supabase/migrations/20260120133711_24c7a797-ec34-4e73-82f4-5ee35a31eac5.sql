-- Adicionar novos campos à tabela contratos_business para suportar contrato completo

-- Dados da Contratante
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS representante_nome TEXT;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS representante_cpf TEXT;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS representante_rg TEXT;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS representante_email TEXT;

-- Dados Financeiros
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 6;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS valor_parcela NUMERIC;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS creditos_iniciais INTEGER DEFAULT 300;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS valor_credito_adicional NUMERIC DEFAULT 1;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS duracao_academy_meses INTEGER DEFAULT 12;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS multa_rescisao_percentual INTEGER DEFAULT 30;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS valor_hora_tecnica NUMERIC DEFAULT 250;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS modulos_selecionados JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS tabela_manutencao JSONB;
ALTER TABLE contratos_business ADD COLUMN IF NOT EXISTS data_assinatura DATE;