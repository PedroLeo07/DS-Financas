import { useEffect, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, MonthFilter } from '@/types';
import { getTransactions } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(entry.value || 0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p style={{ color: data.payload?.color }}>
          {data.name}: {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(data.value || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Generate month options
  const monthOptions: MonthFilter[] = useMemo(() => {
    const options: MonthFilter[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: format(date, 'MMMM yyyy', { locale: ptBR }),
      });
    }
    return options;
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      if (user) {
        const data = await getTransactions(user.id);
        setTransactions(data);
      }
      setIsLoading(false);
    };
    loadTransactions();
  }, [user]);

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() + 1 === month;
    });
  }, [transactions, selectedMonth]);

  // Calculate totals
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  // Get latest transactions
  const latestIncome = filteredTransactions.find((t) => t.type === 'income');
  const latestExpense = filteredTransactions.find((t) => t.type === 'expense');

  // Chart data - Income vs Expense by category
  const categoryData = useMemo(() => {
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    });

    const categories = new Set([...Object.keys(incomeByCategory), ...Object.keys(expenseByCategory)]);
    
    return Array.from(categories).map((category) => ({
      name: category,
      Entradas: incomeByCategory[category] || 0,
      Saídas: expenseByCategory[category] || 0,
    }));
  }, [filteredTransactions]);

  // Pie chart data
  const pieData = useMemo(() => {
    const data = [
      { name: 'Entradas', value: totalIncome, color: '#10b981' },
      { name: 'Saídas', value: totalExpense, color: '#ef4444' },
    ];
    return data;
  }, [totalIncome, totalExpense]);

  // Balance evolution data
  const balanceEvolution = useMemo(() => {
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let runningBalance = 0;
    const data: { date: string; saldo: number }[] = [];
    
    sortedTransactions.forEach((t) => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      data.push({
        date: format(parseISO(t.date), 'dd/MM'),
        saldo: runningBalance,
      });
    });
    
    return data;
  }, [filteredTransactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Olá, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'}!
          </h2>
          <p className="text-muted-foreground">
            Aqui está um resumo das suas finanças
          </p>
        </div>

        {/* Month Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem 
                    key={`${option.year}-${option.month}`} 
                    value={`${option.year}-${String(option.month).padStart(2, '0')}`}
                  >
                    {option.label.charAt(0).toUpperCase() + option.label.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de entradas - Total de saídas
              </p>
            </CardContent>
          </Card>

          {/* Total Income Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.type === 'income').length} transações
              </p>
            </CardContent>
          </Card>

          {/* Total Expense Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.type === 'expense').length} transações
              </p>
            </CardContent>
          </Card>

          {/* Latest Transactions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Últimas Transações</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              {latestIncome && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[120px]">{latestIncome.name}</p>
                    <p className="text-xs text-muted-foreground">{latestIncome.category}</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">
                    +{formatCurrency(latestIncome.amount)}
                  </span>
                </div>
              )}
              {latestExpense && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[120px]">{latestExpense.name}</p>
                    <p className="text-xs text-muted-foreground">{latestExpense.category}</p>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    -{formatCurrency(latestExpense.amount)}
                  </span>
                </div>
              )}
              {!latestIncome && !latestExpense && (
                <p className="text-sm text-muted-foreground">Nenhuma transação neste mês</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Bar Chart - Income vs Expense by Category */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Entradas vs Saídas por Categoria</CardTitle>
              <CardDescription>
                Comparação entre receitas e despesas por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(value) => `R$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Entradas" fill="#10b981" />
                  <Bar dataKey="Saídas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Income vs Expense */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição</CardTitle>
              <CardDescription>
                Proporção entre entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, percent } = props as { name?: string; percent?: number };
                      return `${name || ''} ${(percent || 0) * 100 > 0 ? ((percent || 0) * 100).toFixed(0) : 0}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Line Chart - Balance Evolution */}
        {balanceEvolution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Saldo</CardTitle>
              <CardDescription>
                Acompanhamento do saldo ao longo do mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={balanceEvolution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `R$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}