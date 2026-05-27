export const mockData = {
  custodia: {
    total: 47300000,
    total_clientes: 84,
    variacao_mes: 8.2,
  },

  novosClientes: [
    { id: '1', nome: 'Grupo Pereira Ltda', tipo: 'PJ', perfil: 'renda_variavel', consultor: 'Lucas', custodia: 2800000, data_entrada: '2026-05-05' },
    { id: '2', nome: 'Ricardo Matos', tipo: 'PF', perfil: 'renda_variavel', consultor: 'Lucas', custodia: 1200000, data_entrada: '2026-05-12' },
    { id: '3', nome: 'Thiago Freitas', tipo: 'PF', perfil: 'renda_variavel', consultor: 'Rafael', custodia: 510000, data_entrada: '2026-05-01' },
    { id: '4', nome: 'Ana Costa', tipo: 'PF', perfil: 'moderado', consultor: 'Fernanda', custodia: 380000, data_entrada: '2026-05-09' },
    { id: '5', nome: 'Beatriz Lima', tipo: 'PF', perfil: 'conservador', consultor: 'Fernanda', custodia: 95000, data_entrada: '2026-05-02' },
  ],

  pipeline: [
    { etapa: 'novos_contatos', quantidade: 11, volume_estimado: null, novos: 4 },
    { etapa: 'primeiro_contato', quantidade: 9, volume_estimado: null, novos: 2 },
    { etapa: 'carteira_enviada', quantidade: 7, volume_estimado: 9100000, novos: 1 },
    { etapa: 'consolidacao', quantidade: 5, volume_estimado: 6400000, novos: 1 },
    { etapa: 'r1', quantidade: 4, volume_estimado: 5200000, novos: 0 },
    { etapa: 'negociacao', quantidade: 3, volume_estimado: 3800000, novos: 0 },
    { etapa: 'documentacao', quantidade: 2, volume_estimado: 2100000, novos: 0 },
    { etapa: 'contrato_assinado', quantidade: 1, volume_estimado: 1400000, novos: 1 },
  ],

  onboardingConsolidado: {
    total: 6,
    grupos_whatsapp: 6,
    adicionar_comunidade: 6,
    email_boas_vindas: 5,
    msg_ativacao_grupo: 4,
    msg_inicio_processo: 3,
    abertura_conta_transferencia: 2,
  },

  onboardingClientes: [
    { cliente_id: '1', cliente_nome: 'Beatriz Lima', grupos_whatsapp: true, adicionar_comunidade: true, email_boas_vindas: true, msg_ativacao_grupo: false, msg_inicio_processo: false, abertura_conta_transferencia: false },
    { cliente_id: '2', cliente_nome: 'Ricardo Matos', grupos_whatsapp: true, adicionar_comunidade: true, email_boas_vindas: true, msg_ativacao_grupo: true, msg_inicio_processo: true, abertura_conta_transferencia: false },
    { cliente_id: '3', cliente_nome: 'Grupo Pereira Ltda', grupos_whatsapp: true, adicionar_comunidade: true, email_boas_vindas: true, msg_ativacao_grupo: true, msg_inicio_processo: true, abertura_conta_transferencia: true },
    { cliente_id: '4', cliente_nome: 'Ana Costa', grupos_whatsapp: true, adicionar_comunidade: true, email_boas_vindas: false, msg_ativacao_grupo: false, msg_inicio_processo: false, abertura_conta_transferencia: false },
    { cliente_id: '5', cliente_nome: 'Thiago Freitas', grupos_whatsapp: true, adicionar_comunidade: true, email_boas_vindas: true, msg_ativacao_grupo: true, msg_inicio_processo: false, abertura_conta_transferencia: false },
    { cliente_id: '6', cliente_nome: 'Marcos Andrade', grupos_whatsapp: true, adicionar_comunidade: true, email_boas_vindas: true, msg_ativacao_grupo: true, msg_inicio_processo: true, abertura_conta_transferencia: false },
  ],

  kyc: {
    suitability_vencido: 2,
    vence_30_dias: 5,
    kyc_em_revisao: 3,
    regularizados_mes: 7,
  },

  aportesSemana: {
    semana_total: 4900000,
    semana_ativos: 2100000,
    semana_novos: 2800000,
    anterior_total: 4000000,
    anterior_ativos: 1940000,
    anterior_novos: 1980000,
    variacao_pct: 22.5,
  },

  aportesSemanaDetalhe: [
    { id: '1', tipo: 'novo_cliente', valor: 2800000, data_aporte: '2026-05-20', cliente_nome: 'Grupo Pereira Ltda', cliente_tipo: 'PJ', consultor_nome: 'Lucas Ferreira' },
    { id: '2', tipo: 'cliente_ativo', valor: 850000, data_aporte: '2026-05-21', cliente_nome: 'Fernando Dias', cliente_tipo: 'PF', consultor_nome: 'Rafael Mendes' },
    { id: '3', tipo: 'cliente_ativo', valor: 720000, data_aporte: '2026-05-19', cliente_nome: 'Marina Lopes', cliente_tipo: 'PF', consultor_nome: 'Fernanda Souza' },
    { id: '4', tipo: 'cliente_ativo', valor: 380000, data_aporte: '2026-05-22', cliente_nome: 'Carlos Uchôa', cliente_tipo: 'PF', consultor_nome: 'Lucas Ferreira' },
    { id: '5', tipo: 'cliente_ativo', valor: 150000, data_aporte: '2026-05-23', cliente_nome: 'Patrícia Nunes', cliente_tipo: 'PF', consultor_nome: 'Fernanda Souza' },
  ],

  cobrancas: {
    recebido: 38500,
    em_atraso: 4800,
    clientes_inadimplentes: 2,
    vencendo_7_dias: 9200,
    qtd_vencendo_7_dias: 4,
    abaixo_minimo: 1,
  },
}
