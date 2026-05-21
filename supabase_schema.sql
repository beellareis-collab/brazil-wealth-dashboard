-- ============================================================
-- BRAZIL WEALTH DASHBOARD — Schema Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================

-- Consultores
CREATE TABLE consultores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes ativos
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('PF', 'PJ')) DEFAULT 'PF',
  perfil TEXT CHECK (perfil IN ('conservador', 'moderado', 'arrojado', 'renda_variavel')) DEFAULT 'moderado',
  consultor_id UUID REFERENCES consultores(id),
  custodia NUMERIC(15,2) DEFAULT 0,
  fee_percentual NUMERIC(5,4),         -- ex: 0.0100 = 1% ao ano
  fee_mensal_minimo NUMERIC(10,2) DEFAULT 600,
  data_entrada DATE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding por cliente
CREATE TABLE onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  grupos_whatsapp BOOLEAN DEFAULT FALSE,
  adicionar_comunidade BOOLEAN DEFAULT FALSE,
  email_boas_vindas BOOLEAN DEFAULT FALSE,
  msg_ativacao_grupo BOOLEAN DEFAULT FALSE,
  msg_inicio_processo BOOLEAN DEFAULT FALSE,
  abertura_conta_transferencia BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cliente_id)
);

-- Funil de prospecção
CREATE TABLE pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('PF', 'PJ')) DEFAULT 'PF',
  consultor_id UUID REFERENCES consultores(id),
  etapa TEXT CHECK (etapa IN (
    'novos_contatos',
    'primeiro_contato',
    'carteira_enviada',
    'consolidacao',
    'r1',
    'negociacao',
    'documentacao',
    'contrato_assinado'
  )) NOT NULL DEFAULT 'novos_contatos',
  volume_estimado NUMERIC(15,2),
  telefone TEXT,
  email TEXT,
  observacoes TEXT,
  data_entrada DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC / Suitability
CREATE TABLE kyc_suitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('KYC', 'suitability')) NOT NULL,
  status TEXT CHECK (status IN ('ok', 'em_revisao', 'vencido', 'pendente')) DEFAULT 'pendente',
  data_realizacao DATE,
  data_vencimento DATE,
  observacoes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cliente_id, tipo)
);

-- Cobranças
CREATE TABLE cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  competencia DATE NOT NULL,           -- mês de referência (primeiro dia do mês)
  valor NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'pago', 'atrasado', 'isento')) DEFAULT 'pendente',
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Views úteis para o dashboard
-- ============================================================

-- Custódia total
CREATE OR REPLACE VIEW v_custodia_total AS
SELECT
  SUM(custodia) AS total,
  COUNT(*) AS total_clientes
FROM clientes WHERE ativo = TRUE;

-- Onboarding: progresso consolidado
CREATE OR REPLACE VIEW v_onboarding_consolidado AS
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN grupos_whatsapp THEN 1 ELSE 0 END) AS grupos_whatsapp,
  SUM(CASE WHEN adicionar_comunidade THEN 1 ELSE 0 END) AS adicionar_comunidade,
  SUM(CASE WHEN email_boas_vindas THEN 1 ELSE 0 END) AS email_boas_vindas,
  SUM(CASE WHEN msg_ativacao_grupo THEN 1 ELSE 0 END) AS msg_ativacao_grupo,
  SUM(CASE WHEN msg_inicio_processo THEN 1 ELSE 0 END) AS msg_inicio_processo,
  SUM(CASE WHEN abertura_conta_transferencia THEN 1 ELSE 0 END) AS abertura_conta_transferencia
FROM onboarding;

-- Pipeline por etapa
CREATE OR REPLACE VIEW v_pipeline_etapas AS
SELECT
  etapa,
  COUNT(*) AS quantidade,
  SUM(volume_estimado) AS volume_estimado
FROM pipeline
WHERE ativo = TRUE
GROUP BY etapa;

-- Cobranças do mês atual
CREATE OR REPLACE VIEW v_cobrancas_mes AS
SELECT
  SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) AS recebido,
  SUM(CASE WHEN status = 'atrasado' THEN valor ELSE 0 END) AS em_atraso,
  COUNT(CASE WHEN status = 'atrasado' THEN 1 END) AS clientes_inadimplentes,
  SUM(CASE WHEN status = 'pendente' AND data_vencimento <= CURRENT_DATE + 7 THEN valor ELSE 0 END) AS vencendo_7_dias,
  COUNT(CASE WHEN status = 'pendente' AND data_vencimento <= CURRENT_DATE + 7 THEN 1 END) AS qtd_vencendo_7_dias
FROM cobrancas
WHERE competencia = DATE_TRUNC('month', CURRENT_DATE);

-- ============================================================
-- Row Level Security (básico — ajuste conforme seu auth)
-- ============================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_suitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;

-- Policy permissiva para authenticated (ajuste para roles específicos em prod)
CREATE POLICY "authenticated full access" ON clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated full access" ON pipeline FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated full access" ON onboarding FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated full access" ON kyc_suitability FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated full access" ON cobrancas FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated full access" ON consultores FOR ALL TO authenticated USING (true);

-- ============================================================
-- Dados de exemplo para testar
-- ============================================================
INSERT INTO consultores (nome, email) VALUES
  ('Lucas Ferreira', 'lucas@brazilwealth.com.br'),
  ('Fernanda Souza', 'fernanda@brazilwealth.com.br'),
  ('Rafael Mendes', 'rafael@brazilwealth.com.br');
