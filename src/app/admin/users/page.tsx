
import type { Metadata } from 'next';
import { UsersTable } from '@/components/admin/UsersTable';
import { users } from '@/lib/admin-data';
import { AddUserDialog } from '@/components/admin/AddUserDialog';

export const metadata: Metadata = {
  title: 'Manajemen Pengguna - KUA Banjarmasin Utara',
  description: 'Kelola data pengguna sistem.',
};

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Lihat, tambah, dan kelola akun untuk staf, penghulu, dan kepala KUA.
        </p>
      </div>
      <AddUserDialog>
        <UsersTable data={users} />
      </AddUserDialog>
    </div>
  );
}
