import type { Metadata } from 'next';
import AdminLoginPage from './AdminLoginPage';

export const metadata: Metadata = {
  title: 'Sign In | Portfolio Admin',
  description: 'Sign in to the portfolio administrator workspace.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function Page() {
  return <AdminLoginPage />;
}
