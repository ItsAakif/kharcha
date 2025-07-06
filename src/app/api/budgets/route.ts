import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Budget } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    
    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required (format: YYYY-MM)' },
        { status: 400 }
      );
    }
    
    const budgets = await Budget.find({ month })
      .sort({ category: 1 });
    
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { category, amount, month } = body;
    
    if (!category || !amount || !month) {
      return NextResponse.json(
        { error: 'Category, amount, and month are required' },
        { status: 400 }
      );
    }
    
    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than or equal to 0' },
        { status: 400 }
      );
    }
    
    // Check if month format is correct
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Month must be in format YYYY-MM' },
        { status: 400 }
      );
    }
    
    // Use upsert to create or update budget
    const budget = await Budget.findOneAndUpdate(
      { category, month },
      { category, amount: parseFloat(amount), month },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 }
    );
  }
}
