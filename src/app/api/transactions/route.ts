import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Transaction } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const category = searchParams.get('category');
    
    let query = {};
    
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      query = { 
        ...query, 
        date: { $gte: startDate, $lte: endDate } 
      };
    }
    
    if (category) {
      query = { ...query, category };
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(100);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { amount, description, date, category } = body;
    
    if (!amount || !description || !date) {
      return NextResponse.json(
        { error: 'Amount, description, and date are required' },
        { status: 400 }
      );
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    const transaction = new Transaction({
      amount: parseFloat(amount),
      description: description.trim(),
      date: new Date(date),
      category: category || 'Other',
    });
    
    await transaction.save();
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
