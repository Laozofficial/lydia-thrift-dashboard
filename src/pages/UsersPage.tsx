import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listUsers } from '../api/admin';
import { formatNaira } from '../api/client';
import type { User } from '../api/types';
import { Alert, Badge, Button, Card, Input, PageHeader } from '../components/ui';

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
      <div className="mb-4 flex gap-2">
        <Input placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Button variant="outline" onClick={load}>
          Search
        </Button>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
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
      </Card>
    </div>
  );
}
