-- ============================================================
-- Adicionar ao supabase_schema.sql — Tabela de Aportes
-- ============================================================

CREATE TABLE aportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('novo_cliente', 'cliente_ativo')) NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  data_aporte DATE NOT NULL DEFAULT CURRENT_DATE,
  consultor_id UUID REFERENCES consultores(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE aportes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON aportes FOR ALL TO authenticated USING (true);

-- View: aportes por semana com comparativo
CREATE OR REPLACE VIEW v_aportes_semana AS
WITH semana_atual AS (
  SELECT
    COALESCE(SUM(valor), 0) AS total,
    COALESCE(SUM(CASE WHEN tipo = 'cliente_ativo' THEN valor ELSE 0 END), 0) AS ativos,
    COALESCE(SUM(CASE WHEN tipo = 'novo_cliente' THEN valor ELSE 0 END), 0) AS novos
  FROM aportes
  WHERE data_aporte >= DATE_TRUNC('week', CURRENT_DATE)
    AND data_aporte <  DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
),
semana_anterior AS (
  SELECT
    COALESCE(SUM(valor), 0) AS total,
    COALESCE(SUM(CASE WHEN tipo = 'cliente_ativo' THEN valor ELSE 0 END), 0) AS ativos,
    COALESCE(SUM(CASE WHEN tipo = 'novo_cliente' THEN valor ELSE 0 END), 0) AS novos
  FROM aportes
  WHERE data_aporte >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
    AND data_aporte <  DATE_TRUNC('week', CURRENT_DATE)
)
SELECT
  sa.total          AS semana_total,
  sa.ativos         AS semana_ativos,
  sa.novos          AS semana_novos,
  sp.total          AS anterior_total,
  sp.ativos         AS anterior_ativos,
  sp.novos          AS anterior_novos,
  CASE WHEN sp.total > 0
    THEN ROUND(((sa.total - sp.total) / sp.total) * 100, 1)
    ELSE NULL
  END AS variacao_pct
FROM semana_atual sa, semana_anterior sp;

-- View: detalhamento de aportes da semana atual
CREATE OR REPLACE VIEW v_aportes_semana_detalhe AS
SELECT
  a.id,
  a.tipo,
  a.valor,
  a.data_aporte,
  a.observacoes,
  c.nome AS cliente_nome,
  c.tipo AS cliente_tipo,
  co.nome AS consultor_nome
FROM aportes a
JOIN clientes c ON c.id = a.cliente_id
LEFT JOIN consultores co ON co.id = a.consultor_id
WHERE a.data_aporte >= DATE_TRUNC('week', CURRENT_DATE)
  AND a.data_aporte <  DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY a.data_aporte DESC, a.valor DESC;
