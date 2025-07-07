'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import SummaryCards from '@/components/SummaryCards';
import CategoryPieChart from '@/components/CategoryPieChart';
import ExpenseBarChart from '@/components/ExpenseBarChart';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { ITransaction } from '@/lib/models';
import { Plus, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (data: { amount: number; description: string; date: string; category: string }) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions([newTransaction, ...transactions]);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleEditTransaction = async (data: { amount: number; description: string; date: string; category: string }) => {
    if (!editingTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions(
          transactions.map((t) =>
            t._id === editingTransaction._id ? updatedTransaction : t
          )
        );
        setEditingTransaction(null);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions(transactions.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction: ITransaction) => {
    setEditingTransaction(transaction);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleAddTransactionClick = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation onAddTransaction={handleAddTransactionClick} />
      
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-emerald-600" />
                    Financial Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Comprehensive overview of your financial activities and trends
                  </p>
                </div>
                {!showForm && !editingTransaction && (
                  <Button
                    onClick={handleAddTransactionClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Add
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-8">
            <SummaryCards transactions={transactions} />
          </div>

          {/* Analytics Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              {/* Expense Trends */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Expense Trends</h2>
                </div>
                <ExpenseBarChart transactions={transactions} />
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Category Breakdown</h2>
                </div>
                <CategoryPieChart transactions={transactions} />
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
                  <p className="text-gray-600 text-sm">Latest financial activities</p>
                </div>
                <TransactionList
                  transactions={transactions.slice(0, 10)}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTransaction}
                />
              </div>
            </div>

            {/* Right Column - Form and Stats */}
            <div className="space-y-6">
              {(showForm || editingTransaction) && (
                <div className="sticky top-24">
                  <TransactionForm
                    transaction={editingTransaction || undefined}
                    onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                    onCancel={editingTransaction ? handleCancelEdit : () => setShowForm(false)}
                  />
                </div>
              )}

              {/* Quick Insights */}
              {!showForm && !editingTransaction && transactions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Insights</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-800">
                        ₹{transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-emerald-600">Total Expenses</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-gray-800">{transactions.length}</div>
                        <div className="text-xs text-gray-500">Transactions</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-gray-800">
                          {new Set(transactions.map(t => t.category)).size}
                        </div>
                        <div className="text-xs text-gray-500">Categories</div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleAddTransactionClick}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
