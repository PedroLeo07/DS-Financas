export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description?: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface MonthFilter {
  year: number;
  month: number;
  label: string;
}

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Dividendos',
  'Aluguel',
  'Vendas',
  'Bônus',
  'Comissões',
  'Reembolso',
  'Presente',
  'Outros'
];

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Vestuário',
  'Utilities',
  'Energia Elétrica',
  'Água',
  'Internet',
  'Telefone',
  'Combustível',
  'Seguro',
  'Impostos',
  'Assinaturas',
  'Manutenção',
  'Viagens',
  'Presentes',
  'Doações',
  'Outros'
];