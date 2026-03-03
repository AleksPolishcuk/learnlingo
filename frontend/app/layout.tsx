import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell/AppShell';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LearnLingo — Language Tutors Online',
  description: 'Connect with expert language tutors and unlock your potential.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
