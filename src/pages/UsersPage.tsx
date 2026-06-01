import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listUsers } from '../api/admin';
import { formatNaira } from '../api/client';
import type { User } from '../api/types';
import { Alert, Badge, Button, Card, Input, MobileCard, MobileCardRow, PageHeader, TableScroll } from '../components/ui';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const result = await listUsers({ search: search || undefined });
      setUsers(result.data);
    } catch {
      setError('Could not load users.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Users" subtitle="Customer accounts and wallets" />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Button variant="outline" onClick={load} className="sm:min-w-[100px]">
          Search
        </Button>
      </div>
      {error ? <Alert>{error}</Alert> : null}

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((u) => (
          <MobileCard key={u.id}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">{u.name}</p>
                <p className="truncate text-xs text-stone-500">{u.email}</p>
              </div>
              {u.is_blocked ? <Badge tone="danger">blocked</Badge> : <Badge tone="success">active</Badge>}
            </div>
            <MobileCardRow label="Wallet">{formatNaira(u.wallet_balance_naira ?? 0)}</MobileCardRow>
            <MobileCardRow label="Plans">{u.enrollments_count ?? 0}</MobileCardRow>
            <Link
              to={`/users/${u.id}`}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center border border-brand bg-brand text-sm font-semibold text-white"
            >
              View profile
            </Link>
          </MobileCard>
        ))}
        {users.length === 0 ? <p className="py-8 text-center text-stone-500">No users found.</p> : null}
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <TableScroll>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-cream/50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Plans</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-stone-100 hover:bg-cream/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatNaira(u.wallet_balance_naira ?? 0)}</td>
                  <td className="px-4 py-3">{u.enrollments_count ?? 0}</td>
                  <td className="px-4 py-3">
                    {u.is_blocked ? <Badge tone="danger">blocked</Badge> : <Badge tone="success">active</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/users/${u.id}`} className="text-sm font-semibold text-brand hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </Card>
    </div>
  );
}
