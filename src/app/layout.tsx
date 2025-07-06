import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kharcha - Personal Finance Tracker",
  description: "Track your expenses, set budgets, and visualize your financial data with Kharcha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
