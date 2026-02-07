import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ELEVIQ - Personal Finance Assistant',
  description: 'GenAI-powered personal finance management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
