'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITransaction, TransactionCategory } from '@/lib/models';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['Food', 'Rent', 'Shopping', 'Utilities', 'Transport', 'Other']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: ITransaction;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
}

const categories: TransactionCategory[] = [
  'Food',
  'Rent', 
  'Shopping',
  'Utilities',
  'Transport',
  'Other'
];

export default function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getCategoryColor = (category: string) => {
    const colors = {
      Food: 'bg-green-500',
      Rent: 'bg-blue-500',
      Shopping: 'bg-purple-500',
      Utilities: 'bg-yellow-500',
      Transport: 'bg-red-500',
      Other: 'bg-gray-500',
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      date: transaction?.date 
        ? new Date(transaction.date).toISOString().split('T')[0]
        : '',
      category: transaction?.category || 'Other',
    }
  });

  // Set current date on client side to avoid hydration mismatch
  useEffect(() => {
    if (!transaction?.date) {
      setValue('date', new Date().toISOString().split('T')[0]);
    }
  }, [transaction?.date, setValue]);

  const selectedCategory = watch('category');

  const handleFormSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-t-xl">
        <CardTitle className="text-xl font-bold text-emerald-800 flex items-center gap-2">
          {transaction ? (
            <>
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Edit Transaction
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Add New Transaction
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              💰 Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="h-12 text-lg font-medium border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📝 Description
            </Label>
            <Input
              id="description"
              placeholder="Enter transaction description"
              className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📅 Date
            </Label>
            <Input
              id="date"
              type="date"
              className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🏷️ Category
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value as TransactionCategory)}
            >
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl">
                <SelectValue placeholder="Select a category">
                  {selectedCategory && (
                    <span className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${getCategoryColor(selectedCategory)}`} />
                      <span className="font-medium">{selectedCategory}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-2 shadow-xl">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="cursor-pointer rounded-lg mx-1 my-0.5">
                    <span className="flex items-center gap-3 w-full">
                      <span className={`w-4 h-4 rounded-full ${getCategoryColor(category)} flex-shrink-0`} />
                      <span className="font-medium text-gray-900">{category}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {transaction ? '✏️ Update' : '💾 Add Transaction'}
                </span>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold"
              >
                ❌ Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
