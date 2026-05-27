import { useState, useEffect } from 'react'
import { supabase, supabaseRD } from './supabase'
import { mockData } from './mockData'
import { ONBOARDING_TEMPLATE_KEY_MAP, ONBOARDING_STEPS } from './utils'

const USE_MOCK = !process.env.REACT_APP_SUPABASE_URL && !process.env.REACT_APP_SUPABASE_URL_RD

const EMPTY = {
  custodia:              { total: null, total_clientes: null },
  totalAtivos:           null,
  novosEstaSemana:       null,
  novosClientes:         [],
  pipeline:              [],
  onboardingConsolidado: null,
  onboardingClientes:    [],
  kyc:      { suitability_vencido: null, vence_30_dias: null, kyc_em_revisao: null, regularizados_mes: null },
  cobrancas: { recebido: null, qtd_fechado: null, faturado: null, qtd_faturado: null, rascunho: null, qtd_rascunho: null },
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

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [
        { data: custodia },
        { data: novosClientes },
        { data: dealsRaw },
        { data: onboardingItemsRaw },
        { data: kycClientsRaw },
        { data: feesRaw },
        { data: aportesSemana },
        { data: aportesSemanaDetalhe },
        { data: novosClientesSemana },
      ] = await Promise.all([
        safe(supabase.from('v_custodia_total').select('*').single(), 'custodia'),
        safe(supabase.schema('crm')
          .from('clients')
          .select('id, name, person_type, investor_profile_code, net_worth, contract_signed_at, collaborators(name)')
          .eq('is_active', true)
          .gte('contract_signed_at', startOfMonth)
          .order('contract_signed_at', { ascending: false }), 'clientes'),
        safe(supabaseRD.from('bw_deals').select('stage, value, won, lost, created_at'), 'bw_deals'),
        safe(supabase.schema('crm')
          .from('client_onboarding_items')
          .select('client_id, template_key, completed_at, clients(name)')
          .in('template_key', Object.keys(ONBOARDING_TEMPLATE_KEY_MAP)), 'onboarding'),
        safe(supabase.schema('crm')
          .from('clients')
          .select('suitability_expires_at, suitability_last_completed_at, suitability_status')
          .eq('is_active', true), 'kyc_clients'),
        safe(supabase.schema('financeiro').from('monthly_fee_history').select('status, billed_amount, month_reference'), 'cobrancas'),
        safe(supabase.from('v_aportes_semana').select('*').single(), 'aportes_semana'),
        safe(supabase.from('v_aportes_semana_detalhe').select('*').order('data_aporte', { ascending: false }), 'aportes_detalhe'),
        safe(supabase.schema('crm').from('clients').select('id').eq('is_active', true).gte('contract_signed_at', sevenDaysAgo), 'novos_semana'),
      ])

      // Pipeline a partir de bw_deals (RD Station)

      // Início da semana corrente (segunda-feira 00:00)
      const weekStart = new Date(now)
      const dow = now.getDay() // 0=Dom...6=Sáb
      const daysFromMon = dow === 0 ? 6 : dow - 1
      weekStart.setDate(now.getDate() - daysFromMon)
      weekStart.setHours(0, 0, 0, 0)

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
      const pipelineMap = (dealsRaw || [])
        .filter(d => d.won !== true && d.lost !== true)
        .reduce((acc, deal) => {
          const key = deal.stage || 'Sem etapa'
          if (!acc[key]) acc[key] = { etapa: key, quantidade: 0, volume_estimado: 0, novos: 0, novos_semana: [0,0,0,0,0,0,0] }
          acc[key].quantidade++
          acc[key].volume_estimado += Number(deal.value) || 0
          if (deal.created_at) {
            const d = new Date(deal.created_at)
            if (d >= weekStart) {
              // índice 0=Seg … 6=Dom
              const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
              acc[key].novos_semana[dayIdx]++
              acc[key].novos++
            }
          }
          return acc
        }, {})
      const pipeline = Object.keys(pipelineMap).length > 0
        ? Object.values(pipelineMap).sort((a, b) => stageIdx(a.etapa) - stageIdx(b.etapa))
        : EMPTY.pipeline

      // KYC a partir dos campos de suitability em crm.clients
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
const kyc = kycClientsRaw?.length ? {
        suitability_vencido: kycClientsRaw.filter(c =>
          c.suitability_expires_at && new Date(c.suitability_expires_at) < now
        ).length,
        vence_30_dias: kycClientsRaw.filter(c => {
          if (!c.suitability_expires_at) return false
          const exp = new Date(c.suitability_expires_at)
          return exp >= now && exp <= in30
        }).length,
        kyc_em_revisao: kycClientsRaw.filter(c =>
          c.suitability_status && ['pending', 'in_review', 'em_revisao'].includes(c.suitability_status)
        ).length,
        regularizados_mes: kycClientsRaw.filter(c =>
          c.suitability_last_completed_at && new Date(c.suitability_last_completed_at) >= startMonth
        ).length,
      } : EMPTY.kyc

      // Cobranças a partir de financeiro.monthly_fee_history
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const availableMonths = [...new Set((feesRaw || []).map(f => f.month_reference).filter(Boolean))].sort().reverse()
      const targetMonth = availableMonths.includes(currentMonthStr) ? currentMonthStr : (availableMonths[0] || currentMonthStr)
      console.log(`[dash:cobrancas] ${feesRaw?.length ?? 'null'} registros, exibindo mês: ${targetMonth}`)
      const cobrancas = (feesRaw || [])
        .filter(f => f.month_reference === targetMonth)
        .reduce((acc, f) => {
          const v = Number(f.billed_amount) || 0
          if (f.status === 'fechado')  { acc.recebido += v; acc.qtd_fechado++ }
          if (f.status === 'faturado') { acc.faturado += v; acc.qtd_faturado++ }
          if (f.status === 'rascunho') { acc.rascunho += v; acc.qtd_rascunho++ }
          return acc
        }, { recebido: 0, qtd_fechado: 0, faturado: 0, qtd_faturado: 0, rascunho: 0, qtd_rascunho: 0 })

      const novosFormatted = (novosClientes || []).map(c => ({
        id:           c.id,
        nome:         c.name,
        tipo:         c.person_type === 'legal' ? 'PJ' : 'PF',
        perfil:       c.investor_profile_code || '—',
        custodia:     c.net_worth || null,
        data_entrada: c.contract_signed_at,
        consultor:    c.collaborators?.name || '—',
      }))

      // Agrega client_onboarding_items por cliente
      const stepKeys = ONBOARDING_STEPS.map(s => s.key)
      const emptySteps = Object.fromEntries(stepKeys.map(k => [k, false]))
      const clientMap = (onboardingItemsRaw || []).reduce((acc, item) => {
        const stepKey = ONBOARDING_TEMPLATE_KEY_MAP[item.template_key]
        if (!stepKey) return acc
        if (!acc[item.client_id]) {
          acc[item.client_id] = { cliente_id: item.client_id, cliente_nome: item.clients?.name || '—', ...emptySteps }
        }
        acc[item.client_id][stepKey] = item.completed_at != null
        return acc
      }, {})
      const onbClientesFormatted = Object.values(clientMap)
      console.log(`[dash:onboarding] ${onbClientesFormatted.length} clientes encontrados`)
      const onboardingConsolidado = onbClientesFormatted.length ? {
        total: onbClientesFormatted.length,
        ...Object.fromEntries(stepKeys.map(k => [k, onbClientesFormatted.filter(c => c[k]).length])),
      } : null

      console.log(`[dash:ativos] kycRaw=${kycClientsRaw?.length ?? 'null'} semana=${novosClientesSemana?.length ?? 'null'}`)
      setData({
        custodia:              custodia || EMPTY.custodia,
        totalAtivos:           kycClientsRaw?.length ?? null,
        novosEstaSemana:       novosClientesSemana?.length ?? null,
        novosClientes:         novosFormatted.length ? novosFormatted : EMPTY.novosClientes,
        pipeline:              pipeline?.length ? pipeline : EMPTY.pipeline,
        onboardingConsolidado: onboardingConsolidado || mockData.onboardingConsolidado,
        onboardingClientes:    onbClientesFormatted.length ? onbClientesFormatted : mockData.onboardingClientes,
        kyc:                   kycClientsRaw ? kyc : EMPTY.kyc,
        cobrancas:             feesRaw ? cobrancas : EMPTY.cobrancas,
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
