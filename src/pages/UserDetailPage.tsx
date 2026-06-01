import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { blockUser, getUser, listUserEnrollments, unblockUser, updateUser, updateUserWallet } from '../api/admin';
import { ApiError, formatFieldErrors, formatNaira } from '../api/client';
import type { Enrollment, User } from '../api/types';
import { Alert, Badge, Button, Card, Input, Label, PageHeader, PasswordInput } from '../components/ui';

export function UserDetailPage() {
  const { id } = useParams();
  const userId = Number(id);

  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const u = await getUser(userId);
      setUser(u);
      setName(u.name);
      setEmail(u.email);
      setPhone(u.phone ?? '');
      setAddress(u.delivery_address ?? '');
      setWalletBalance(String(u.wallet_balance_naira ?? 0));
      const plans = await listUserEnrollments(userId);
      setEnrollments(plans);
    } catch {
      setError('User not found.');
    }
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const body: Record<string, string> = { name, email, phone, delivery_address: address };
      if (password.trim()) body.password = password;
      const updated = await updateUser(userId, body);
      setUser(updated);
      setPassword('');
      setMessage('Profile updated.');
    } catch (err) {
      if (err instanceof ApiError) setError(formatFieldErrors(err.errors) || err.message);
      else setError('Could not update user.');
    }
  }

  async function saveWallet(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const updated = await updateUserWallet(userId, parseFloat(walletBalance));
      setUser(updated);
      setMessage('Wallet balance updated.');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Could not update wallet.');
    }
  }

  async function toggleBlock() {
    if (!user) return;
    if (user.is_blocked) {
      await unblockUser(userId);
      setMessage('User unblocked.');
    } else {
      if (!confirm('Block this user? They will not be able to sign in.')) return;
      await blockUser(userId);
      setMessage('User blocked.');
    }
    load();
  }

  if (!user && !error) return <p className="text-stone-500">Loading…</p>;
  if (error && !user) return <Alert>{error}</Alert>;

  return (
    <div>
      <PageHeader
        title={user?.name ?? 'User'}
        subtitle={user?.email}
        action={
          <div className="flex gap-2">
            <Link to="/users">
              <Button variant="outline">Back</Button>
            </Link>
            <Button variant={user?.is_blocked ? 'outline' : 'danger'} onClick={toggleBlock}>
              {user?.is_blocked ? 'Unblock' : 'Block user'}
            </Button>
          </div>
        }
      />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Profile</h2>
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Delivery address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label>New password (optional)</Label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={user?.is_blocked ? 'danger' : 'success'}>{user?.is_blocked ? 'blocked' : 'active'}</Badge>
              <Badge>{user?.role}</Badge>
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Wallet</h2>
          {user?.bank_account ? (
            <p className="mb-4 text-sm text-stone-600">
              Bank: {user.bank_account.bank_name} · {user.bank_account.account_number} · {user.bank_account.account_name}
            </p>
          ) : (
            <p className="mb-4 text-sm text-stone-500">No bank account on file.</p>
          )}
          <form onSubmit={saveWallet} className="space-y-3">
            <div>
              <Label>Balance (₦)</Label>
              <Input type="number" min="0" step="0.01" value={walletBalance} onChange={(e) => setWalletBalance(e.target.value)} required />
            </div>
            <p className="text-xs text-stone-500">Sets absolute wallet balance and records an admin adjustment.</p>
            <Button type="submit">Update wallet</Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="font-semibold">Plans ({enrollments.length})</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-t border-stone-100">
                <td className="px-4 py-3">{e.product?.name}</td>
                <td className="px-4 py-3 capitalize">{e.status}</td>
                <td className="px-4 py-3">{formatNaira(e.total_naira)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/enrollments/${e.id}`} className="font-semibold text-brand hover:underline">
                    Details
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
