'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SummaryCards from '@/components/SummaryCards';
import CategoryPieChart from '@/components/CategoryPieChart';
import ExpenseBarChart from '@/components/ExpenseBarChart';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { ITransaction } from '@/lib/models';
import { Plus, ArrowLeft, Target } from 'lucide-react';
import Link from 'next/link';

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

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
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
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your finances</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/budget">
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Budget
            </Button>
          </Link>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <SummaryCards transactions={transactions} />
        
        <div className="grid gap-8 lg:grid-cols-2">
          <CategoryPieChart transactions={transactions} />
          <ExpenseBarChart transactions={transactions} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionList
              transactions={recentTransactions}
              onEdit={handleEdit}
              onDelete={handleDeleteTransaction}
            />
          </div>

          <div className="space-y-4">
            {(showForm || editingTransaction) && (
              <TransactionForm
                transaction={editingTransaction || undefined}
                onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                onCancel={editingTransaction ? handleCancelEdit : () => setShowForm(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
