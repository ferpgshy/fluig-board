-- ============================================
-- Habilitar Supabase Realtime nas tabelas
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- Habilita a publicação de eventos realtime para as tabelas principais
-- É necessário que a publicação 'supabase_realtime' já exista (padrão no Supabase)

ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE visits;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- Obs: A tabela 'profiles' e 'access_requests' não são adicionadas
-- pois não precisam de sync realtime no client.
