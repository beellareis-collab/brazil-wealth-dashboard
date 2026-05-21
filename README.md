# Brazil Wealth — Dashboard

Dashboard interno da Brazil Wealth Consultoria de Investimentos.

## Stack
- React 18
- Supabase (banco de dados + auth)
- Recharts (gráficos)
- Vercel (deploy)

---

## 1. Supabase — configurar o banco

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá em **SQL Editor**
3. Execute o conteúdo de `supabase_schema.sql` (tabelas principais)
4. Execute o conteúdo de `supabase_aportes.sql` (tabela de aportes semanais)

### Tabelas criadas
| Tabela | O que guarda |
|---|---|
| `consultores` | Consultores da Brazil Wealth |
| `clientes` | Clientes ativos com custódia e fee |
| `onboarding` | Checklist de onboarding por cliente |
| `pipeline` | Leads no funil de prospecção |
| `kyc_suitability` | Status de KYC e suitability |
| `cobrancas` | Cobranças mensais de fee |
| `aportes` | Aportes semanais (ativos + novos) |

---

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com os dados do seu projeto Supabase:
- `REACT_APP_SUPABASE_URL` — em Project Settings > API > Project URL
- `REACT_APP_SUPABASE_ANON_KEY` — em Project Settings > API > anon public

> Sem as variáveis preenchidas, o dashboard roda com **dados mockados** automaticamente.

---

## 3. Rodar localmente

```bash
npm install
npm start
```

Acesse: http://localhost:3000

---

## 4. Deploy no Vercel

### Via CLI
```bash
npm install -g vercel
vercel
```

### Via GitHub
1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) > Import Project
3. Selecione o repositório
4. Em **Environment Variables**, adicione:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Clique em Deploy

---

## 5. Estrutura do projeto

```
bw-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── AportesSemana.jsx     ← Aportes semanais
│   ├── lib/
│   │   ├── supabase.js           ← Client Supabase
│   │   ├── useDashboard.js       ← Hook de dados
│   │   ├── mockData.js           ← Dados de fallback
│   │   └── utils.js              ← Formatação e constantes
│   ├── App.jsx                   ← Componente principal
│   ├── App.css                   ← Estilos globais (BW identity)
│   └── index.js
├── supabase_schema.sql           ← Schema principal
├── supabase_aportes.sql          ← Tabela de aportes
├── vercel.json
├── .env.example
└── package.json
```

---

## 6. Adicionando dados reais

Para registrar um aporte:
```sql
INSERT INTO aportes (cliente_id, tipo, valor, data_aporte, consultor_id)
VALUES ('uuid-do-cliente', 'cliente_ativo', 500000, '2026-05-21', 'uuid-do-consultor');
```

Para avançar um lead no funil:
```sql
UPDATE pipeline SET etapa = 'r1' WHERE id = 'uuid-do-lead';
```

Para atualizar custódia de um cliente:
```sql
UPDATE clientes SET custodia = 1500000 WHERE id = 'uuid-do-cliente';
```
