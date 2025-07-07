import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "खर्चा - Personal Finance Tracker",
  description: "Track your expenses, set budgets, and visualize your financial data with Kharcha. A beautiful and intuitive personal finance management app.",
  keywords: "finance, expenses, budget, money, tracker, personal finance",
  authors: [{ name: "Kharcha Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 min-h-screen" suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
