# Kharcha - Personal Finance Tracker

A modern, responsive web application for personal finance management built with Next.js, TypeScript, and MongoDB.

## 🌟 Features

### Stage 1: Basic Transaction Tracking
- ✅ Add, edit, and delete transactions
- ✅ Transaction validation (amount > 0, required fields)
- ✅ List view with reverse chronological order
- ✅ Monthly expense bar chart visualization
- ✅ Responsive design for all devices

### Stage 2: Categorization & Analytics
- ✅ Predefined expense categories (Food, Rent, Shopping, Utilities, Transport, Other)
- ✅ Category-wise expense breakdown with pie charts
- ✅ Comprehensive dashboard with summary cards
- ✅ Recent transactions overview
- ✅ Monthly expense trends

### Stage 3: Budgeting & Insights
- ✅ Set monthly budgets by category
- ✅ Budget vs. actual spending comparison charts
- ✅ Smart spending insights and alerts
- ✅ Budget utilization tracking
- ✅ Monthly spending comparisons

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Library**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts
- **Database**: MongoDB with Mongoose ODM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
kharcha/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   └── categories/
│   │   ├── dashboard/
│   │   ├── budget/
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── ExpenseBarChart.tsx
│   │   ├── CategoryPieChart.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── BudgetForm.tsx
│   │   ├── BudgetChart.tsx
│   │   └── SpendingInsights.tsx
│   └── lib/
│       ├── db.ts              # MongoDB connection
│       ├── models.ts          # Mongoose schemas
│       └── utils.ts           # Utility functions
├── public/
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kharcha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kharcha
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kharcha
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 API Routes

### Transactions
- `GET /api/transactions` - Fetch all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Budgets
- `GET /api/budgets?month=YYYY-MM` - Fetch budgets for specific month
- `POST /api/budgets` - Create/update budget

### Categories
- `GET /api/categories` - Fetch available categories

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Dark/Light Mode**: Supports system preference
- **Accessible**: WCAG compliant with proper ARIA labels
- **Modern UI**: Clean design with shadcn/ui components
- **Interactive Charts**: Hover effects and tooltips
- **Form Validation**: Real-time validation with error messages

## 💡 Usage Examples

### Adding a Transaction
1. Click "Add Transaction" button
2. Fill in amount, description, date, and category
3. Click "Add Transaction" to save

### Setting a Budget
1. Navigate to Budget page
2. Select the month you want to budget for
3. Click "Set Budget"
4. Choose category and enter budget amount
5. Click "Set Budget" to save

### Viewing Analytics
- **Dashboard**: Overview of all financial data
- **Charts**: Visual representation of spending patterns
- **Insights**: Smart alerts for overspending and budget utilization

## 🔧 Configuration

### Database Schema

**Transaction Model:**
```typescript
{
  amount: number,        // Must be > 0
  description: string,   // Required
  date: Date,           // Required
  category: string,     // Enum: Food, Rent, Shopping, etc.
  createdAt: Date,
  updatedAt: Date
}
```

**Budget Model:**
```typescript
{
  category: string,     // Enum: Food, Rent, Shopping, etc.
  amount: number,       // Must be >= 0
  month: string,        // Format: "YYYY-MM"
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables**
   In Vercel dashboard, add:
   - `MONGODB_URI`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Get connection string
5. Add to environment variables

## 🧪 Testing

### Manual Testing Checklist
- [ ] Form validations work correctly
- [ ] Charts update dynamically with new data
- [ ] Responsive design on different screen sizes
- [ ] API routes return correct HTTP status codes
- [ ] Error states display properly
- [ ] Loading states show during API calls

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```


## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the chart library
- [Lucide](https://lucide.dev/) for the icon set
- [Next.js](https://nextjs.org/) for the React framework
