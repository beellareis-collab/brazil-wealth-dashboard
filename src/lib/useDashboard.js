import { useState, useEffect } from 'react'
import { supabase, supabaseRD } from './supabase'
import { mockData } from './mockData'

const USE_MOCK = !process.env.REACT_APP_SUPABASE_URL && !process.env.REACT_APP_SUPABASE_URL_RD

const EMPTY = {
  custodia:              { total: null, total_clientes: null },
  novosClientes:         [],
  pipeline:              [],
  onboardingConsolidado: null,
  onboardingClientes:    [],
  kyc:      { suitability_vencido: null, vence_30_dias: null, kyc_em_revisao: null, regularizados_mes: null },
  cobrancas: { recebido: null, em_atraso: null, clientes_inadimplentes: null, vencendo_7_dias: null, qtd_vencendo_7_dias: null },
  aportesSemana:        null,
  aportesSemanaDetalhe: [],
}

export function useDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => { setData(mockData); setLoading(false) }, 400)
      return
    }
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      setLoading(true)

      const safe = (promise, label) => promise.then(res => {
        if (res.error) console.warn(`[dash:${label}]`, res.error.message)
        return { data: res.data }
      }).catch(err => {
        console.error(`[dash:${label}] threw:`, err)
        return { data: null }
      })

      const [
        { data: custodia },
        { data: novosClientes },
        { data: dealsRaw },
        { data: onboardingConsolidado },
        { data: onboardingClientes },
        { data: kyc },
        { data: cobrancas },
        { data: aportesSemana },
        { data: aportesSemanaDetalhe },
      ] = await Promise.all([
        safe(supabase.from('v_custodia_total').select('*').single(), 'custodia'),
        safe(supabase.schema('crm')
          .from('clients')
          .select('id, nome, tipo, perfil, custodia, data_entrada, consultores(nome)')
          .eq('ativo', true)
          .gte('data_entrada', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .order('custodia', { ascending: false }), 'clientes'),
        safe(supabaseRD.from('bw_deals').select('stage, value, won, lost'), 'bw_deals'),
        safe(supabase.from('v_onboarding_consolidado').select('*').single(), 'onboarding_consolidado'),
        safe(supabase
          .from('onboarding')
          .select('*, clientes(nome)')
          .order('updated_at', { ascending: false }), 'onboarding'),
        safe(supabase.rpc('get_kyc_summary'), 'kyc'),
        safe(supabase.from('v_cobrancas_mes').select('*').single(), 'cobrancas'),
        safe(supabase.from('v_aportes_semana').select('*').single(), 'aportes_semana'),
        safe(supabase.from('v_aportes_semana_detalhe').select('*').order('data_aporte', { ascending: false }), 'aportes_detalhe'),
      ])

      // Agrega bw_deals por etapa — exclui negociações ganhas/perdidas
      const pipelineMap = (dealsRaw || [])
        .filter(d => d.won !== true && d.lost !== true)
        .reduce((acc, deal) => {
          const key = deal.stage || 'Sem etapa'
          if (!acc[key]) acc[key] = { etapa: key, quantidade: 0, volume_estimado: 0 }
          acc[key].quantidade++
          acc[key].volume_estimado += Number(deal.value) || 0
          return acc
        }, {})
      const STAGE_ORDER = [
        'novos_contatos', 'novos contatos',
        'primeiro_contato', '1 contato',
        'carteira_enviada', 'carteira enviada',
        'consolidacao', 'consolidação',
        'r1',
        'negociacao', 'negociação',
        'documentacao', 'documentação',
        'contrato_assinado', 'contrato assinado',
      ]
      const stageIdx = (etapa) => {
        const i = STAGE_ORDER.findIndex(s => s.toLowerCase() === etapa.toLowerCase())
        return i === -1 ? 999 : i
      }
      const pipeline = Object.keys(pipelineMap).length > 0
        ? Object.values(pipelineMap).sort((a, b) => stageIdx(a.etapa) - stageIdx(b.etapa))
        : EMPTY.pipeline

      const novosFormatted = (novosClientes || []).map(c => ({
        ...c,
        consultor: c.consultores?.nome || '—',
      }))

      const onbClientesFormatted = (onboardingClientes || []).map(o => ({
        ...o,
        cliente_nome: o.clientes?.nome || '—',
      }))

      setData({
        custodia:              custodia || EMPTY.custodia,
        novosClientes:         novosFormatted.length ? novosFormatted : EMPTY.novosClientes,
        pipeline:              pipeline?.length ? pipeline : EMPTY.pipeline,
        onboardingConsolidado: onboardingConsolidado || EMPTY.onboardingConsolidado,
        onboardingClientes:    onbClientesFormatted.length ? onbClientesFormatted : EMPTY.onboardingClientes,
        kyc:                   kyc || EMPTY.kyc,
        cobrancas:             cobrancas || EMPTY.cobrancas,
        aportesSemana:         aportesSemana || EMPTY.aportesSemana,
        aportesSemanaDetalhe:  aportesSemanaDetalhe?.length ? aportesSemanaDetalhe : EMPTY.aportesSemanaDetalhe,
      })
    } catch (err) {
      console.error('fetchAll fatal:', err)
      setError(err)
      setData(prev => prev || EMPTY)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch: fetchAll }
}
