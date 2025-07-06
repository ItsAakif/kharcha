import mongoose from 'mongoose';

// Transaction Categories
export type TransactionCategory = 'Food' | 'Rent' | 'Shopping' | 'Utilities' | 'Transport' | 'Other';

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: ['Food', 'Rent', 'Shopping', 'Utilities', 'Transport', 'Other'],
    default: 'Other',
  },
}, {
  timestamps: true,
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Rent', 'Shopping', 'Utilities', 'Transport', 'Other'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/,
  },
}, {
  timestamps: true,
});

// Create compound index for unique budget per category per month
budgetSchema.index({ category: 1, month: 1 }, { unique: true });

// Transaction Model
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Budget Model
export const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

// Type definitions for TypeScript
export interface ITransaction {
  _id?: string;
  amount: number;
  description: string;
  date: Date;
  category: TransactionCategory;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBudget {
  _id?: string;
  category: TransactionCategory;
  amount: number;
  month: string;
  createdAt?: Date;
  updatedAt?: Date;
}
