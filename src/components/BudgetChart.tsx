'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITransaction, IBudget } from '@/lib/models';

interface BudgetChartProps {
  transactions: ITransaction[];
  budgets: IBudget[];
  selectedMonth: string;
}

export default function BudgetChart({ transactions, budgets, selectedMonth }: BudgetChartProps) {
  const chartData = useMemo(() => {
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

    // Get all categories that have either budget or spending
    const allCategories = new Set([
      ...Object.keys(actualSpending),
      ...Object.keys(budgetMap)
    ]);

    // Create chart data
    const data = Array.from(allCategories).map(category => {
      const actual = actualSpending[category] || 0;
      const budget = budgetMap[category] || 0;
      const difference = budget - actual;
      const percentageUsed = budget > 0 ? (actual / budget) * 100 : actual > 0 ? 100 : 0;

      return {
        category,
        actual: parseFloat(actual.toFixed(2)),
        budget: parseFloat(budget.toFixed(2)),
        difference: parseFloat(difference.toFixed(2)),
        percentageUsed: parseFloat(percentageUsed.toFixed(1)),
        status: actual > budget ? 'over' : actual > budget * 0.8 ? 'warning' : 'good'
      };
    }).sort((a, b) => b.budget - a.budget);

    return data;
  }, [transactions, budgets, selectedMonth]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: any }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Budget: ₹{data.budget.toFixed(2)}
          </p>
          <p className="text-green-600">
            Actual: ₹{data.actual.toFixed(2)}
          </p>
          <p className={`${data.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.difference >= 0 ? 'Under' : 'Over'} by: ₹{Math.abs(data.difference).toFixed(2)}
          </p>
          <p className="text-muted-foreground">
            Used: {data.percentageUsed}%
          </p>
        </div>
      );
    }
    return null;
  };



  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No budget or spending data available for this month</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
        <p className="text-sm text-muted-foreground">
          {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="budget" 
              fill="#3b82f6"
              name="Budget"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="actual" 
              fill="#10b981"
              name="Actual"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 grid gap-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Good (&lt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>Warning (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Over Budget</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
