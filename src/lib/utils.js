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

// Cada etapa tem múltiplos nomes possíveis vindos do RD Station
// (underscored, com espaço, com/sem acento). Todas as variações apontam
// para o mesmo label/cor, garantindo exibição correta independente do formato.
const _ETAPAS = [
  { keys: ['novos_contatos',   'novos contatos',    'novo contato',     'novos contato'],
    label: 'Novos contatos',   color: '#444440' },
  { keys: ['primeiro_contato', '1 contato',         '1º contato',       '1o contato',
            '1° contato',      'primeiro contato',  '1ª contato',       '1a contato'],
    label: '1º Contato',       color: '#666660' },
  { keys: ['carteira_enviada', 'carteira enviada'],
    label: 'Carteira enviada', color: '#C9A84C' },
  { keys: ['consolidacao',     'consolidação',      'consolidaçao'],
    label: 'Consolidação',     color: '#D4B86A' },
  { keys: ['r1',               'reunião 1',         'reuniao 1'],
    label: 'R1',               color: '#E8C97A' },
  { keys: ['negociacao',       'negociação',        'negociaçao'],
    label: 'Negociação',       color: '#E8C97A' },
  { keys: ['documentacao',     'documentação',      'documentaçao'],
    label: 'Documentação',     color: '#C96B4A' },
  { keys: ['contrato_assinado','contrato assinado', 'contrato'],
    label: 'Contrato assinado',color: '#4A9C6A' },
]

export const ETAPA_LABELS = Object.fromEntries(
  _ETAPAS.flatMap(e => e.keys.map(k => [k, e.label]))
)

export const ETAPA_COLORS = Object.fromEntries(
  _ETAPAS.flatMap(e => e.keys.map(k => [k, e.color]))
)

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
