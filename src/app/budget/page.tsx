'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BudgetForm from '@/components/BudgetForm';
import BudgetChart from '@/components/BudgetChart';
import SpendingInsights from '@/components/SpendingInsights';
import { ITransaction, IBudget } from '@/lib/models';
import { Plus, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Set default month on client side
  useEffect(() => {
    if (!selectedMonth) {
      setSelectedMonth(new Date().toISOString().slice(0, 7));
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedMonth) {
      fetchData();
    }
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch transactions and budgets in parallel
      const [transactionsRes, budgetsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch(`/api/budgets?month=${selectedMonth}`)
      ]);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        setBudgets(budgetsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async (data: { category: string; amount: number; month: string }) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newBudget = await response.json();
        
        // Update budgets list
        setBudgets(prevBudgets => {
          const existingIndex = prevBudgets.findIndex(
            b => b.category === newBudget.category && b.month === newBudget.month
          );
          
          if (existingIndex >= 0) {
            // Update existing budget
            const updated = [...prevBudgets];
            updated[existingIndex] = newBudget;
            return updated;
          } else {
            // Add new budget
            return [...prevBudgets, newBudget];
          }
        });
        
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  if (isLoading || !selectedMonth) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Budget Management</h1>
            <p className="text-muted-foreground">Set and track your monthly budgets</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Set Budget
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Label htmlFor="month-select">Select Month:</Label>
          </div>
          <Input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-8">
          <BudgetChart
            transactions={transactions}
            budgets={budgets}
            selectedMonth={selectedMonth}
          />
        </div>

        <div className="space-y-4">
          <SpendingInsights
            transactions={transactions}
            budgets={budgets}
            selectedMonth={selectedMonth}
          />
          
          {showForm && (
            <BudgetForm
              onSubmit={handleAddBudget}
              onCancel={() => setShowForm(false)}
              initialMonth={selectedMonth}
            />
          )}
        </div>
      </div>

      {/* Current Budgets for Selected Month */}
      {budgets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Current Budgets for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <div
                key={budget._id}
                className="border rounded-lg p-4 hover:bg-muted/50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{budget.category}</h3>
                  <span className="text-lg font-bold">
                    ${budget.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
