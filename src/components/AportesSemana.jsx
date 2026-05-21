import React from 'react'
import { formatCurrency } from '../lib/utils'

function DeltaBadge({ pct }) {
  if (pct == null) return <span style={{ color: 'var(--bw-muted)', fontSize: 11 }}>sem dados anteriores</span>
  const up = pct >= 0
  return (
    <span style={{ fontSize: 11, color: up ? 'var(--bw-ok)' : 'var(--bw-alert)' }}>
      {up ? '↑' : '↓'} {up ? '+' : ''}{pct.toFixed(1)}% vs semana anterior
    </span>
  )
}

function MiniCompare({ labelA, valueA, labelB, valueB }) {
  const max = Math.max(valueA, valueB, 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--bw-gold-light)', minWidth: 90 }}>{labelA}</span>
        <div style={{ flex: 1, height: 5, background: 'var(--bw-border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(valueA / max) * 100}%`, height: '100%', background: 'var(--bw-gold)', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--bw-text)', minWidth: 56, textAlign: 'right' }}>{formatCurrency(valueA, true)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--bw-muted)', minWidth: 90 }}>{labelB}</span>
        <div style={{ flex: 1, height: 5, background: 'var(--bw-border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(valueB / max) * 100}%`, height: '100%', background: '#444440', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--bw-muted)', minWidth: 56, textAlign: 'right' }}>{formatCurrency(valueB, true)}</span>
      </div>
    </div>
  )
}

export default function AportesSemana({ resumo, detalhe }) {
  if (!resumo) return null

  const {
    semana_total, semana_ativos, semana_novos,
    anterior_total, anterior_ativos, anterior_novos,
    variacao_pct,
  } = resumo

  const varAtivos = anterior_ativos > 0
    ? ((semana_ativos - anterior_ativos) / anterior_ativos * 100).toFixed(1)
    : null
  const varNovos = anterior_novos > 0
    ? ((semana_novos - anterior_novos) / anterior_novos * 100).toFixed(1)
    : null

  return (
    <div className="card">
      <div className="card-title">
        Aportes da semana
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--bw-muted)' }}>
          vs semana anterior
        </span>
      </div>

      {/* Três cards de totais */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: 'var(--bw-gold-dim2)', border: '0.5px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--bw-muted)', marginBottom: 6 }}>Total da semana</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--bw-gold-light)' }}>{formatCurrency(semana_total, true)}</div>
          <div style={{ marginTop: 5 }}><DeltaBadge pct={variacao_pct} /></div>
        </div>
        <div style={{ background: 'var(--bw-black)', border: '0.5px solid var(--bw-border)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--bw-muted)', marginBottom: 6 }}>Clientes ativos</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--bw-gold-light)' }}>{formatCurrency(semana_ativos, true)}</div>
          <div style={{ marginTop: 5 }}><DeltaBadge pct={varAtivos !== null ? parseFloat(varAtivos) : null} /></div>
        </div>
        <div style={{ background: 'var(--bw-black)', border: '0.5px solid var(--bw-border)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--bw-muted)', marginBottom: 6 }}>Novos clientes</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--bw-gold-light)' }}>{formatCurrency(semana_novos, true)}</div>
          <div style={{ marginTop: 5 }}><DeltaBadge pct={varNovos !== null ? parseFloat(varNovos) : null} /></div>
        </div>
      </div>

      {/* Barra comparativa */}
      <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '0.5px solid var(--bw-border)' }}>
        <MiniCompare
          labelA="Esta semana"
          valueA={semana_total}
          labelB="Semana anterior"
          valueB={anterior_total}
        />
      </div>

      {/* Detalhamento */}
      <div style={{ fontSize: 11, color: 'var(--bw-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Detalhamento por aporte
      </div>
      {(detalhe || []).map((a) => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '0.5px solid var(--bw-border)' }}>
          <span style={{
            fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
            background: a.tipo === 'novo_cliente' ? 'var(--bw-gold-dim)' : 'var(--bw-ok-bg)',
            color: a.tipo === 'novo_cliente' ? 'var(--bw-gold-light)' : 'var(--bw-ok)',
          }}>
            {a.tipo === 'novo_cliente' ? 'Novo' : 'Ativo'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--bw-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.cliente_nome}</div>
            <div style={{ fontSize: 11, color: 'var(--bw-muted)' }}>Consultor: {a.consultor_nome?.split(' ')[0]}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bw-gold-light)' }}>{formatCurrency(a.valor, true)}</div>
            <div style={{ fontSize: 11, color: 'var(--bw-muted)' }}>
              {new Date(a.data_aporte + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
