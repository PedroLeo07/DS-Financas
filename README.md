# DS Finanças - Sistema Financeiro Pessoal

Sistema completo de gerenciamento financeiro pessoal desenvolvido com React, Vite, Tailwind CSS, shadcn/ui, Supabase e Recharts.

## 🚀 Funcionalidades

- **Autenticação**: Login e cadastro de usuários com Supabase Auth
- **Dashboard**: Painel principal com gráficos e resumo financeiro
- **Entradas**: Cadastro e gerenciamento de receitas (salário, freelance, investimentos, etc.)
- **Saídas**: Cadastro e gerenciamento de despesas (alimentação, transporte, moradia, etc.)
- **Gráficos**: Visualização de dados com gráficos de barras, pizza e linha
- **Filtros**: Filtragem por mês para análise de períodos específicos
- **Responsivo**: Interface adaptável para desktop e mobile

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)

## 🛠️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: ds-financas)
4. Defina uma senha segura para o banco de dados
5. Aguarde a criação do projeto

### 2. Criar Tabela de Transações

No SQL Editor do Supabase, execute:

```sql
-- Criar tabela de transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can only view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Obter Credenciais

1. No menu lateral, clique em **Project Settings** > **API**
2. Copie os valores:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** API Key (VITE_SUPABASE_ANON_KEY)

### 4. Configurar Autenticação (Opcional)

Se desejar habilitar confirmação de email:

1. Vá em **Authentication** > **Providers**
2. Configure o provedor Email conforme necessário
3. Em **URL Configuration**, defina:
   - Site URL: `http://localhost:5173` (desenvolvimento)
   - Site URL: `https://seu-app.vercel.app` (produção)

## 🔧 Configuração Local

### 1. Clonar e Instalar

```bash
git clone <url-do-repositorio>
cd ds-financas
npm install
```

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Preencha as variáveis no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## 🚀 Deploy na Vercel

### 1. Preparar para Deploy

```bash
npm run build
```

### 2. Deploy via CLI

```bash
npm i -g vercel
vercel
```

### 3. Configurar Variáveis de Ambiente na Vercel

1. Acesse o dashboard do projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 4. Redeploy

```bash
vercel --prod
```

## 📱 Categorias Disponíveis

### Entradas (Receitas)
- Salário
- Freelance
- Investimentos
- Dividendos
- Aluguel
- Vendas
- Bônus
- Comissões
- Reembolso
- Presente
- Outros

### Saídas (Despesas)
- Alimentação
- Transporte
- Moradia
- Saúde
- Lazer
- Educação
- Vestuário
- Utilities
- Energia Elétrica
- Água
- Internet
- Telefone
- Combustível
- Seguro
- Impostos
- Assinaturas
- Manutenção
- Viagens
- Presentes
- Doações
- Outros

## 🎨 Tecnologias Utilizadas

- **React 19** - Biblioteca UI
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS
- **shadcn/ui** - Componentes UI
- **Supabase** - Backend e autenticação
- **Recharts** - Gráficos
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

## 📄 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   └── Header.tsx    # Header compartilhado
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts   # Configuração do Supabase
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Entradas.tsx
│   └── Saidas.tsx
├── types/
│   └── index.ts      # Tipos TypeScript
├── utils/
│   └── cn.ts         # Utility para classes
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.