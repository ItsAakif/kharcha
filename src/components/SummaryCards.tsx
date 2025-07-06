'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITransaction } from '@/lib/models';
import { DollarSign, TrendingDown, Calendar, Activity } from 'lucide-react';

interface SummaryCardsProps {
  transactions: ITransaction[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps) {
  const summary = useMemo(() => {
    // Use a consistent date to avoid hydration mismatches
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonth = new Date(currentYear, currentMonth - 1);
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const currentMonthExpenses = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthExpenses = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyChange = lastMonthExpenses > 0 
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

    // Get the most expensive category this month
    const categoryTotals: { [key: string]: number } = {};
    currentMonthTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalExpenses,
      currentMonthExpenses,
      monthlyChange,
      totalTransactions: transactions.length,
      currentMonthTransactions: currentMonthTransactions.length,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Expenses
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            All time total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            This Month
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.currentMonthExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            <span className={summary.monthlyChange >= 0 ? 'text-red-500' : 'text-green-500'}>
              {formatPercentage(summary.monthlyChange)}
            </span>
            {' from last month'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Transactions
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalTransactions}</div>
          <p className="text-xs text-muted-foreground">
            {summary.currentMonthTransactions} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Category
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.topCategory ? summary.topCategory.name : 'None'}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.topCategory 
              ? `${formatCurrency(summary.topCategory.amount)} this month`
              : 'No expenses this month'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
