import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';

import { ApiError, formatFieldErrors } from '../api/client';
import { Alert, Button, Card, Input, Label, PasswordInput } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(formatFieldErrors(err.errors) || err.message);
      } else {
        setError('Could not sign in.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-bg p-6">
      <Card className="w-full max-w-md p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Lydia&apos;s Thrift</p>
        <h1 className="font-display mt-2 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-stone-500">Manage products, users, plans, and payments.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          <div>
            <Label>Email</Label>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
