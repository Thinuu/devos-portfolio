import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Thinu Upadya | Software Engineer',
  description: 'Associate Software Engineer at Cybernetics IT Consultancy. Full-Stack Developer specializing in React, Node.js, MongoDB, and enterprise WordPress solutions.',
  keywords: ['Thinu Upadya', 'Software Engineer', 'Full-Stack Developer', 'MERN', 'React', 'Node.js', 'Sri Lanka'],
  authors: [{ name: 'Thinu Upadya' }],
  openGraph: {
    title: 'Thinu Upadya | Software Engineer',
    description: 'Building useful software, one thoughtful implementation at a time.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
