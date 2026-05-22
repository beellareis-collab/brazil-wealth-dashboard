export function formatCurrency(value, compact = false) {
  if (value == null) return '—'
  if (compact) {
    if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function initials(name) {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ETAPA_LABELS = {
  novos_contatos: 'Novos contatos',
  primeiro_contato: '1 contato',
  carteira_enviada: 'Carteira enviada',
  consolidacao: 'Consolidação',
  r1: 'R1',
  negociacao: 'Negociação',
  documentacao: 'Documentação',
  contrato_assinado: 'Contrato assinado',
}

export const ETAPA_COLORS = {
  novos_contatos: '#444440',
  primeiro_contato: '#666660',
  carteira_enviada: '#C9A84C',
  consolidacao: '#D4B86A',
  r1: '#E8C97A',
  negociacao: '#E8C97A',
  documentacao: '#C96B4A',
  contrato_assinado: '#4A9C6A',
}

export const ONBOARDING_STEPS = [
  { key: 'email_boas_vindas',          label: 'E-mail de boas-vindas' },
  { key: 'adicionar_comunidade',       label: 'Adicionar à comunidade do WhatsApp' },
  { key: 'grupos_whatsapp',            label: 'Criar grupo com o cliente' },
  { key: 'msg_ativacao_grupo',         label: 'Mensagem de ativação do grupo' },
  { key: 'msg_inicio_processo',        label: 'Mensagem explicando o início do processo' },
  { key: 'abertura_conta_transferencia', label: 'Transferência ou abertura de conta' },
]

export const ONBOARDING_TEMPLATE_KEY_MAP = {
  'welcome-email':             'email_boas_vindas',
  'whatsapp-community':        'adicionar_comunidade',
  'client-group-creation':     'grupos_whatsapp',
  'group-activation-message':  'msg_ativacao_grupo',
  'process-kickoff-message':   'msg_inicio_processo',
  'account-transfer-guidance': 'abertura_conta_transferencia',
}
