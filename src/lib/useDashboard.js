import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { mockData } from './mockData'

const USE_MOCK = !process.env.REACT_APP_SUPABASE_URL

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

      const [
        { data: custodia },
        { data: novosClientes },
        { data: pipeline },
        { data: onboardingConsolidado },
        { data: onboardingClientes },
        { data: kyc },
        { data: cobrancas },
      ] = await Promise.all([
        supabase.from('v_custodia_total').select('*').single(),
        supabase
          .from('clientes')
          .select('id, nome, tipo, perfil, custodia, data_entrada, consultores(nome)')
          .eq('ativo', true)
          .gte('data_entrada', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .order('custodia', { ascending: false }),
        supabase.from('v_pipeline_etapas').select('*'),
        supabase.from('v_onboarding_consolidado').select('*').single(),
        supabase
          .from('onboarding')
          .select('*, clientes(nome)')
          .order('updated_at', { ascending: false }),
        supabase.rpc('get_kyc_summary'),
        supabase.from('v_cobrancas_mes').select('*').single(),
      ])

      const novosFormatted = (novosClientes || []).map(c => ({
        ...c,
        consultor: c.consultores?.nome || '—',
      }))

      const onbClientesFormatted = (onboardingClientes || []).map(o => ({
        ...o,
        cliente_nome: o.clientes?.nome || '—',
      }))

      setData({
        custodia: custodia || mockData.custodia,
        novosClientes: novosFormatted.length ? novosFormatted : mockData.novosClientes,
        pipeline: pipeline?.length ? pipeline : mockData.pipeline,
        onboardingConsolidado: onboardingConsolidado || mockData.onboardingConsolidado,
        onboardingClientes: onbClientesFormatted.length ? onbClientesFormatted : mockData.onboardingClientes,
        kyc: kyc || mockData.kyc,
        cobrancas: cobrancas || mockData.cobrancas,
      })
    } catch (err) {
      console.error(err)
      setError(err)
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch: fetchAll }
}
