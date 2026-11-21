'use client';

import { LogOut } from 'lucide-react';

export default function AdminLogout() {
  return (
    <button className="admin-logout" type="button" onClick={async () => {
      await fetch('/api/auth/session', { method: 'DELETE' });
      window.location.assign('/admin/login');
    }}>
      <LogOut size={16} /> Sign out
    </button>
  );
}
