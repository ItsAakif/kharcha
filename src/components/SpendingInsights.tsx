'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITransaction, IBudget } from '@/lib/models';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface SpendingInsightsProps {
  transactions: ITransaction[];
  budgets: IBudget[];
  selectedMonth: string;
}

export default function SpendingInsights({ transactions, budgets, selectedMonth }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    // Filter transactions for the selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });

    // Calculate actual spending by category
    const actualSpending: { [key: string]: number } = {};
    monthTransactions.forEach(transaction => {
      if (!actualSpending[transaction.category]) {
        actualSpending[transaction.category] = 0;
      }
      actualSpending[transaction.category] += transaction.amount;
    });

    // Create budget map
    const budgetMap: { [key: string]: number } = {};
    budgets.forEach(budget => {
      budgetMap[budget.category] = budget.amount;
    });

    // Calculate insights
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const overBudgetCategories = Object.entries(actualSpending)
      .filter(([category, spent]) => {
        const budget = budgetMap[category];
        return budget && spent > budget;
      })
      .map(([category, spent]) => ({
        category,
        spent,
        budget: budgetMap[category],
        overBy: spent - budgetMap[category]
      }))
      .sort((a, b) => b.overBy - a.overBy);

    const underBudgetCategories = Object.entries(actualSpending)
      .filter(([category, spent]) => {
        const budget = budgetMap[category];
        return budget && spent < budget;
      })
      .map(([category, spent]) => ({
        category,
        spent,
        budget: budgetMap[category],
        underBy: budgetMap[category] - spent,
        percentageUsed: (spent / budgetMap[category]) * 100
      }))
      .sort((a, b) => b.underBy - a.underBy);

    const warningCategories = underBudgetCategories.filter(cat => cat.percentageUsed > 80);

    // Previous month comparison
    const prevMonth = new Date(year, month - 2);
    const prevMonthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getFullYear() === prevMonth.getFullYear() && date.getMonth() === prevMonth.getMonth();
    });
    
    const prevMonthTotal = prevMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const monthlyChange = prevMonthTotal > 0 ? ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overBudgetCategories,
      underBudgetCategories,
      warningCategories,
      monthlyChange,
      prevMonthTotal,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [transactions, budgets, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Budget:</span>
              <span className="font-medium">{formatCurrency(insights.totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Spent:</span>
              <span className="font-medium">{formatCurrency(insights.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining:</span>
              <span className={`font-medium ${insights.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(insights.totalRemaining)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Budget Used:</span>
              <span className="font-medium">{insights.budgetUtilization.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Monthly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Previous Month:</span>
              <span className="font-medium">{formatCurrency(insights.prevMonthTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Month:</span>
              <span className="font-medium">{formatCurrency(insights.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Change:</span>
              <span className={`font-medium ${insights.monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatPercentage(insights.monthlyChange)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Over Budget Categories */}
      {insights.overBudgetCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Over Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.overBudgetCategories.map((category) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-red-600">
                    Over by {formatCurrency(category.overBy)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Categories */}
      {insights.warningCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Approaching Budget Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.warningCategories.map((category) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-amber-600">
                    {category.percentageUsed.toFixed(0)}% used
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Under Budget Categories */}
      {insights.underBudgetCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Under Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.underBudgetCategories.slice(0, 3).map((category) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-green-600">
                    {formatCurrency(category.underBy)} remaining
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
