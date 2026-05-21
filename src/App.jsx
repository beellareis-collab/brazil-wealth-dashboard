import React, { useState } from 'react'
import { useDashboard } from './lib/useDashboard'
import { formatCurrency, formatDate, initials, ETAPA_LABELS, ETAPA_COLORS, ONBOARDING_STEPS } from './lib/utils'
import AportesSemana from './components/AportesSemana'
import './App.css'

// ── Shared ──────────────────────────────────────────────────

function SectionLabel({ children }) {
  return <div className="section-label"><span>{children}</span></div>
}

function ViewTabs({ view, setView }) {
  return (
    <div className="view-tabs">
      <button className={`view-tab${view === 'tv' ? ' vt-active' : ''}`} onClick={() => setView('tv')}>TV</button>
      <button className={`view-tab${view === 'detail' ? ' vt-active' : ''}`} onClick={() => setView('detail')}>Detalhes</button>
    </div>
  )
}

// ── Detail components ────────────────────────────────────────

function MetricCard({ label, value, sub, delta, gold }) {
  return (
    <div className={`metric${gold ? ' gold-accent' : ''}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className="delta-up">↑ {delta}</div>}
      {sub && !delta && <div className="sub">{sub}</div>}
    </div>
  )
}

function NovosClientes({ clientes }) {
  return (
    <div className="card">
      <div className="card-title">Captações recentes</div>
      {clientes.map((c) => (
        <div key={c.id} className="client-row">
          <div className="avatar">{initials(c.nome)}</div>
          <div>
            <div className="client-name">{c.nome}</div>
            <div className="client-meta">{c.tipo} · {c.perfil} · Consultor: {c.consultor}</div>
          </div>
          <div className="client-value">
            <div className="amount">{formatCurrency(c.custodia, true)}</div>
            <div className="date">{formatDate(c.data_entrada)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Pipeline({ etapas }) {
  const maxQtd = Math.max(...etapas.map(e => e.quantidade), 1)
  const totalVolume = etapas.reduce((s, e) => s + (e.volume_estimado || 0), 0)
  return (
    <div className="card">
      <div className="card-title">
        Pipeline de leads
        <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--bw-muted)' }}>
          {etapas.reduce((s, e) => s + e.quantidade, 0)} ativos
        </span>
      </div>
      {etapas.map((e) => {
        const label = ETAPA_LABELS[e.etapa] || e.etapa
        const color = ETAPA_COLORS[e.etapa] || '#888'
        const pct = (e.quantidade / maxQtd) * 100
        return (
          <div key={e.etapa} className="pipe-stage">
            <div className="stage-info">
              <div className="stage-dot" style={{ background: color }} />
              <div className="stage-name">{label}</div>
            </div>
            <div className="stage-right">
              <div className="stage-bar-wrap">
                <div className="stage-bar" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="stage-count">{e.quantidade}</div>
              <div className="stage-vol">{e.volume_estimado ? formatCurrency(e.volume_estimado, true) + ' est.' : '—'}</div>
            </div>
          </div>
        )
      })}
      <div className="pipe-total">
        <span style={{ fontSize: 12, color: 'var(--bw-muted)' }}>Volume estimado no pipe</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--bw-gold-light)' }}>{formatCurrency(totalVolume, true)} est.</span>
      </div>
    </div>
  )
}

function OnboardingSection({ consolidado, clientes }) {
  const [tab, setTab] = useState('geral')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = clientes[selectedIdx] || {}
  const clientDone = ONBOARDING_STEPS.filter(s => selected[s.key]).length
  const clientPending = ONBOARDING_STEPS.length - clientDone
  return (
    <div className="card">
      <div className="tab-bar">
        <button className={`tab${tab === 'geral' ? ' active' : ''}`} onClick={() => setTab('geral')}>Visão geral</button>
        <button className={`tab${tab === 'cliente' ? ' active' : ''}`} onClick={() => setTab('cliente')}>Por cliente</button>
      </div>
      {tab === 'geral' && consolidado && (
        <>
          <div className="card-title" style={{ marginBottom: 10 }}>
            {consolidado.total} clientes em onboarding
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--bw-muted)' }}>
              {consolidado.total - consolidado.abertura_conta_transferencia} com pendências
            </span>
          </div>
          {ONBOARDING_STEPS.map((step) => {
            const done = consolidado[step.key]
            const total = consolidado.total
            const pct = total > 0 ? (done / total) * 100 : 0
            const barColor = pct === 100 ? 'var(--bw-ok)' : pct >= 60 ? 'var(--bw-gold)' : 'var(--bw-alert)'
            const fracColor = pct === 100 ? 'var(--bw-ok)' : pct < 40 ? 'var(--bw-alert)' : 'var(--bw-text)'
            return (
              <div key={step.key} className="onb-step-row">
                <div className="step-label">{step.label}</div>
                <div className="step-progress">
                  <div className="mini-bar-wrap">
                    <div className="mini-bar" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="step-fraction" style={{ color: fracColor }}>{done}/{total}</div>
                </div>
              </div>
            )
          })}
        </>
      )}
      {tab === 'cliente' && (
        <>
          <div className="client-selector">
            <select value={selectedIdx} onChange={e => setSelectedIdx(parseInt(e.target.value))}>
              {clientes.map((c, i) => (
                <option key={c.cliente_id} value={i}>{c.cliente_nome}</option>
              ))}
            </select>
          </div>
          {ONBOARDING_STEPS.map((step) => (
            <div key={step.key} className="check-item">
              <div className={`check-box ${selected[step.key] ? 'cb-done' : 'cb-pending'}`}>
                {selected[step.key] && '✓'}
              </div>
              <span className={`check-label${selected[step.key] ? ' done-txt' : ''}`}>{step.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--bw-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--bw-muted)' }}>{clientDone} de 6 etapas concluídas</span>
            <span className={`badge ${clientDone === 6 ? 'badge-ok' : clientPending > 3 ? 'badge-alert' : 'badge-warn'}`}>
              {clientDone === 6 ? 'Completo' : `${clientPending} pendentes`}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function CtrlRow({ icon, title, sub, badge, type }) {
  return (
    <div className="ctrl-row">
      <div className={`ctrl-icon ci-${type}`}>{icon}</div>
      <div className="ctrl-text">
        <div className="ctrl-title">{title}</div>
        {sub && <div className="ctrl-sub">{sub}</div>}
      </div>
      <span className={`badge badge-${type === 'ok' ? 'ok' : type === 'alert' ? 'alert' : type === 'info' ? 'info' : 'warn'}`}>{badge}</span>
    </div>
  )
}

function Controles({ kyc, cobrancas }) {
  return (
    <div className="cards-2col">
      <div className="card">
        <div className="card-title">KYC / Suitability</div>
        <CtrlRow icon="⚠" type="alert" title="Suitability vencido" sub={`${kyc.suitability_vencido} clientes`} badge={String(kyc.suitability_vencido)} />
        <CtrlRow icon="◷" type="warn" title="Vence em 30 dias" sub={`${kyc.vence_30_dias} clientes`} badge={String(kyc.vence_30_dias)} />
        <CtrlRow icon="☰" type="info" title="KYC em revisão" sub={`${kyc.kyc_em_revisao} clientes`} badge={String(kyc.kyc_em_revisao)} />
        <CtrlRow icon="✓" type="ok" title="Regularizados" sub="este mês" badge={String(kyc.regularizados_mes)} />
      </div>
      <div className="card">
        <div className="card-title">Cobranças — fee sobre PL</div>
        <CtrlRow icon="⚠" type="alert" title="Fee em atraso" sub={`${cobrancas.clientes_inadimplentes} clientes`} badge={formatCurrency(cobrancas.em_atraso)} />
        <CtrlRow icon="◷" type="warn" title="Vence em 7 dias" sub={`${cobrancas.qtd_vencendo_7_dias} cobranças`} badge={formatCurrency(cobrancas.vencendo_7_dias)} />
        <CtrlRow icon="↓" type="info" title="Abaixo do mínimo" sub="fee < R$ 600/mês" badge={`${cobrancas.abaixo_minimo} cliente`} />
        <CtrlRow icon="✓" type="ok" title="Recebido no mês" sub={new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })} badge={formatCurrency(cobrancas.recebido)} />
      </div>
    </div>
  )
}

// ── TV components ────────────────────────────────────────────

function TVKpi({ label, value, delta, sub, gold }) {
  return (
    <div className={`tv-kpi${gold ? ' tv-kpi-gold' : ''}`}>
      <div className="tv-kpi-label">{label}</div>
      <div className="tv-kpi-value">{value}</div>
      {delta && <div className="tv-kpi-delta">↑ {delta}</div>}
      {sub && !delta && <div className="tv-kpi-sub">{sub}</div>}
    </div>
  )
}

function TVAportes({ resumo }) {
  if (!resumo) return null
  const { semana_total, semana_ativos, semana_novos, anterior_total, variacao_pct } = resumo
  const max = Math.max(semana_total, anterior_total, 1)
  const up = variacao_pct >= 0
  return (
    <div className="tv-card">
      <div className="tv-card-label">Aportes da semana</div>
      <div className="tv-card-hero">{formatCurrency(semana_total, true)}</div>
      <div className={`tv-delta ${up ? 'tv-delta-up' : 'tv-delta-down'}`}>
        {up ? '↑' : '↓'} {Math.abs(variacao_pct).toFixed(1)}% vs semana anterior
      </div>
      <div className="tv-bars">
        <div className="tv-bar-row">
          <span className="tv-bar-lbl tv-gold-txt">Esta semana</span>
          <div className="tv-bar-track">
            <div className="tv-bar-fill" style={{ width: `${(semana_total / max) * 100}%`, background: 'var(--bw-gold)' }} />
          </div>
          <span className="tv-bar-val">{formatCurrency(semana_total, true)}</span>
        </div>
        <div className="tv-bar-row">
          <span className="tv-bar-lbl">Semana anterior</span>
          <div className="tv-bar-track">
            <div className="tv-bar-fill" style={{ width: `${(anterior_total / max) * 100}%`, background: '#444440' }} />
          </div>
          <span className="tv-bar-val tv-muted">{formatCurrency(anterior_total, true)}</span>
        </div>
      </div>
      <div className="tv-split">
        <div style={{ flex: 1 }}>
          <div className="tv-split-lbl">Clientes ativos</div>
          <div className="tv-split-val">{formatCurrency(semana_ativos, true)}</div>
        </div>
        <div className="tv-split-sep" />
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div className="tv-split-lbl">Novos clientes</div>
          <div className="tv-split-val">{formatCurrency(semana_novos, true)}</div>
        </div>
      </div>
    </div>
  )
}

function TVPipeline({ etapas }) {
  const maxQtd = Math.max(...etapas.map(e => e.quantidade), 1)
  const totalLeads = etapas.reduce((s, e) => s + e.quantidade, 0)
  const totalVol = etapas.reduce((s, e) => s + (e.volume_estimado || 0), 0)
  return (
    <div className="tv-card">
      <div className="tv-card-label">Pipeline de leads</div>
      <div className="tv-card-hero">{totalLeads} <span className="tv-hero-unit">leads</span></div>
      <div className="tv-card-sub">{formatCurrency(totalVol, true)} estimado</div>
      <div className="tv-list">
        {etapas.map(e => {
          const color = ETAPA_COLORS[e.etapa] || '#888'
          const label = ETAPA_LABELS[e.etapa] || e.etapa
          const pct = (e.quantidade / maxQtd) * 100
          return (
            <div key={e.etapa} className="tv-list-row">
              <div className="tv-dot" style={{ background: color }} />
              <div className="tv-list-name">{label}</div>
              <div className="tv-list-bar-wrap">
                <div className="tv-list-bar" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="tv-list-count">{e.quantidade}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TVOnboarding({ consolidado }) {
  if (!consolidado) return null
  const total = consolidado.total
  const overallDone = ONBOARDING_STEPS.reduce((s, step) => s + consolidado[step.key], 0)
  const overallTotal = ONBOARDING_STEPS.length * total
  const pctGeral = overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0
  return (
    <div className="tv-card">
      <div className="tv-card-label">Onboarding</div>
      <div className="tv-card-hero">{pctGeral}% <span className="tv-hero-unit">concluído</span></div>
      <div className="tv-card-sub">{total} clientes em processo</div>
      <div className="tv-list">
        {ONBOARDING_STEPS.map(step => {
          const done = consolidado[step.key]
          const pct = total > 0 ? (done / total) * 100 : 0
          const color = pct === 100 ? 'var(--bw-ok)' : pct >= 60 ? 'var(--bw-gold)' : 'var(--bw-alert)'
          return (
            <div key={step.key} className="tv-list-row">
              <div className="tv-list-name">{step.label}</div>
              <div className="tv-list-bar-wrap">
                <div className="tv-list-bar" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="tv-list-count" style={{ color }}>{done}/{total}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TVAlerts({ kyc, cobrancas }) {
  return (
    <div className="tv-alerts-row">
      <div className="tv-card">
        <div className="tv-card-label">KYC / Suitability</div>
        <div className="tv-alert-grid">
          <div className="tv-alert-item tv-ai-alert"><span>Suitability vencido</span><span className="tv-ai-num">{kyc.suitability_vencido}</span></div>
          <div className="tv-alert-item tv-ai-warn"><span>Vence em 30 dias</span><span className="tv-ai-num">{kyc.vence_30_dias}</span></div>
          <div className="tv-alert-item tv-ai-info"><span>KYC em revisão</span><span className="tv-ai-num">{kyc.kyc_em_revisao}</span></div>
          <div className="tv-alert-item tv-ai-ok"><span>Regularizados no mês</span><span className="tv-ai-num">{kyc.regularizados_mes}</span></div>
        </div>
      </div>
      <div className="tv-card">
        <div className="tv-card-label">Cobranças — fee sobre PL</div>
        <div className="tv-alert-grid">
          <div className="tv-alert-item tv-ai-alert"><span>Fee em atraso</span><span className="tv-ai-num">{formatCurrency(cobrancas.em_atraso)}</span></div>
          <div className="tv-alert-item tv-ai-warn"><span>Vence em 7 dias</span><span className="tv-ai-num">{formatCurrency(cobrancas.vencendo_7_dias)}</span></div>
          <div className="tv-alert-item tv-ai-info"><span>Abaixo do mínimo</span><span className="tv-ai-num">{cobrancas.abaixo_minimo}</span></div>
          <div className="tv-alert-item tv-ai-ok"><span>Recebido no mês</span><span className="tv-ai-num">{formatCurrency(cobrancas.recebido)}</span></div>
        </div>
      </div>
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────

export default function App() {
  const { data, loading } = useDashboard()
  const [view, setView] = useState('tv')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111110' }}>
        <div style={{ color: '#C9A84C', fontSize: 14, letterSpacing: '0.06em' }}>CARREGANDO...</div>
      </div>
    )
  }

  const { custodia, novosClientes, pipeline, onboardingConsolidado, onboardingClientes, kyc, cobrancas, aportesSemana, aportesSemanaDetalhe } = data
  const ticket = custodia.total / custodia.total_clientes
  const pipeTotal = pipeline.reduce((s, e) => s + e.quantidade, 0)
  const novosNaSemana = (aportesSemanaDetalhe || []).filter(a => a.tipo === 'novo_cliente').length
  const receitaNovaVar = aportesSemana?.anterior_novos > 0
    ? Math.abs((aportesSemana.semana_novos - aportesSemana.anterior_novos) / aportesSemana.anterior_novos * 100).toFixed(1) + '% vs ant.'
    : null
  const period = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  if (view === 'tv') {
    return (
      <div className="tv-root">
        <div className="tv-header">
          <div>
            <div className="logo-text">BRAZIL WEALTH</div>
            <div className="logo-sub">Consultoria de Investimentos</div>
          </div>
          <ViewTabs view={view} setView={setView} />
          <div className="period">{period}</div>
        </div>

        <div className="tv-kpis">
          <TVKpi label="Custódia total" value={formatCurrency(custodia.total, true)} delta="+8,2% na semana" gold />
          <TVKpi label="Clientes ativos" value={custodia.total_clientes} sub={`+${novosNaSemana} esta semana`} />
          <TVKpi label="Ticket médio" value={formatCurrency(ticket, true)} sub="por cliente" />
          <TVKpi label="Receita nova" value={formatCurrency(aportesSemana?.semana_novos, true)} delta={receitaNovaVar} sub={receitaNovaVar ? null : 'na semana'} />
        </div>

        <div className="tv-middle">
          <TVAportes resumo={aportesSemana} />
          <TVPipeline etapas={pipeline} />
          <TVOnboarding consolidado={onboardingConsolidado} />
        </div>

        <TVAlerts kyc={kyc} cobrancas={cobrancas} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <div className="logo-bar">
          <div>
            <div className="logo-text">BRAZIL WEALTH</div>
            <div className="logo-sub">Consultoria de Investimentos</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ViewTabs view={view} setView={setView} />
            <div className="period">{period}</div>
          </div>
        </div>

        <SectionLabel>Visão Geral</SectionLabel>
        <div className="metric-grid">
          <MetricCard label="Custódia total" value={formatCurrency(custodia.total, true)} delta="+8,2% no mês" gold />
          <MetricCard label="Clientes ativos" value={custodia.total_clientes} sub="+6 este mês" />
          <MetricCard label="Ticket médio" value={formatCurrency(ticket, true)} sub="por cliente" />
          <MetricCard label="No pipe" value={pipeTotal} sub="leads ativos" />
        </div>

        <SectionLabel>Aportes Semanais</SectionLabel>
        <AportesSemana resumo={aportesSemana} detalhe={aportesSemanaDetalhe} />

        <div className="layout-2col">
          <div>
            <SectionLabel>Novos Clientes — {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</SectionLabel>
            <NovosClientes clientes={novosClientes} />
          </div>
          <div>
            <SectionLabel>Funil de Prospecção</SectionLabel>
            <Pipeline etapas={pipeline} />
          </div>
        </div>

        <SectionLabel>Onboarding</SectionLabel>
        <OnboardingSection consolidado={onboardingConsolidado} clientes={onboardingClientes} />

        <SectionLabel>Controles Operacionais</SectionLabel>
        <Controles kyc={kyc} cobrancas={cobrancas} />
      </div>
    </div>
  )
}
