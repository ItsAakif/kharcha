'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import BudgetForm from '@/components/BudgetForm';
import BudgetChart from '@/components/BudgetChart';
import SpendingInsights from '@/components/SpendingInsights';
import { ITransaction, IBudget } from '@/lib/models';
import { Plus, Target, Calendar } from 'lucide-react';

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
  }, [selectedMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
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
        setBudgets(prevBudgets => {
          const existingIndex = prevBudgets.findIndex(
            b => b.category === newBudget.category && b.month === newBudget.month
          );
          
          if (existingIndex >= 0) {
            const updated = [...prevBudgets];
            updated[existingIndex] = newBudget;
            return updated;
          } else {
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
      <>
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading budget data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Target className="h-8 w-8 text-emerald-600" />
                    Budget Management
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Set spending limits and track your financial goals
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <Label htmlFor="month-select" className="text-sm font-medium text-gray-700">
                      Month:
                    </Label>
                    <Input
                      id="month-select"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-40 border-2 border-gray-200 focus:border-emerald-500 rounded-lg"
                    />
                  </div>
                  {!showForm && (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Set Budget
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <BudgetChart
                  transactions={transactions}
                  budgets={budgets}
                  selectedMonth={selectedMonth}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending Insights</h2>
                <SpendingInsights
                  transactions={transactions}
                  budgets={budgets}
                  selectedMonth={selectedMonth}
                />
              </div>
            </div>

            <div className="space-y-6">
              {showForm && (
                <div className="sticky top-24">
                  <BudgetForm
                    onSubmit={handleAddBudget}
                    onCancel={() => setShowForm(false)}
                    initialMonth={selectedMonth}
                  />
                </div>
              )}

              {!showForm && budgets.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Summary</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-800">
                        ₹{budgets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-emerald-600">Total Budget</div>
                    </div>
                    
                    <div className="space-y-2">
                      {budgets.map((budget) => {
                        const spent = transactions
                          .filter(t => {
                            const transactionDate = new Date(t.date);
                            const [year, month] = selectedMonth.split('-');
                            return transactionDate.getMonth() === parseInt(month) - 1 &&
                                   transactionDate.getFullYear() === parseInt(year) &&
                                   t.category === budget.category;
                          })
                          .reduce((sum, t) => sum + t.amount, 0);
                        
                        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                        const isOverBudget = spent > budget.amount;
                        
                        return (
                          <div key={budget.category} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                              <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                                ₹{spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Budget
                    </Button>
                  </div>
                </div>
              )}

              {!showForm && budgets.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Budgets Set</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Start by setting your first budget for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
