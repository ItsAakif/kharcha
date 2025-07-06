import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    'Food',
    'Rent',
    'Shopping',
    'Utilities',
    'Transport',
    'Other'
  ];
  
  return NextResponse.json(categories);
}
