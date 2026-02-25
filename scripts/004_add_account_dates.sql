-- ============================================================
-- 004: Adicionar campos de data na tabela accounts
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Novas colunas de data na tabela accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS data_registro DATE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS data_proxima_visita DATE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS data_ultimo_contato DATE;

-- Preencher data_registro com a data de criação para registros existentes
UPDATE accounts SET data_registro = criado_em::date WHERE data_registro IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN accounts.data_registro IS 'Data de registro/entrada da conta na base';
COMMENT ON COLUMN accounts.data_proxima_visita IS 'Data da proxima visita agendada';
COMMENT ON COLUMN accounts.data_ultimo_contato IS 'Data do ultimo contato realizado com a conta';
