'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import ExpenseBarChart from '@/components/ExpenseBarChart';
import { ITransaction } from '@/lib/models';
import { TrendingUp, Wallet, Calendar, Plus } from 'lucide-react';

export default function Home() {
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <p className="text-muted-foreground" style={{color: '#6b7280', fontSize: '1rem'}}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Track Your <span className="text-emerald-600">Expenses</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Take control of your finances with smart expense tracking
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {transactions.filter(t => {
                      const date = new Date(t.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form and Chart */}
            <div className="lg:col-span-2 space-y-8">
              {/* Add Transaction Button/Form */}
              {!showForm && !editingTransaction ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Transaction
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <TransactionForm
                    transaction={editingTransaction || undefined}
                    onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                    onCancel={editingTransaction ? handleCancelEdit : () => setShowForm(false)}
                  />
                </div>
              )}

              {/* Expense Chart */}
              {transactions.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <ExpenseBarChart transactions={transactions} />
                </div>
              )}
            </div>

            {/* Right Column - Transaction List */}
            <div className="space-y-6">
              <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
                onDelete={handleDeleteTransaction}
              />
            </div>
          </div>

          {/* Empty State */}
          {transactions.length === 0 && !showForm && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your expenses by adding your first transaction</p>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Transaction
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
