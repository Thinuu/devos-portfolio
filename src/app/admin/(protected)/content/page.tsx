import { redirect } from 'next/navigation';

export default function ContentManagerIndex() {
  redirect('/admin/content/profile');
}
