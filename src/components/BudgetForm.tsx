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
import { TransactionCategory } from '@/lib/models';

const budgetSchema = z.object({
  category: z.enum(['Food', 'Rent', 'Shopping', 'Utilities', 'Transport', 'Other']),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  month: z.string().min(1, 'Month is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel?: () => void;
  initialMonth?: string;
}

const categories: TransactionCategory[] = [
  'Food',
  'Rent', 
  'Shopping',
  'Utilities',
  'Transport',
  'Other'
];

export default function BudgetForm({ onSubmit, onCancel, initialMonth }: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentMonth = initialMonth || '';
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: 'Food',
      amount: 0,
      month: currentMonth,
    }
  });

  // Set current month on client side to avoid hydration mismatch
  useEffect(() => {
    if (!initialMonth) {
      setValue('month', new Date().toISOString().slice(0, 7));
    }
  }, [initialMonth, setValue]);

  const selectedCategory = watch('category');

  const handleFormSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value as TransactionCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              {...register('month')}
            />
            {errors.month && (
              <p className="text-sm text-red-500">{errors.month.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Set Budget'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
