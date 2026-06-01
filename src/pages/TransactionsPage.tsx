import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listPayments, listTransactions } from '../api/admin';
import { formatNaira } from '../api/client';
import type { Payment, WalletTransaction } from '../api/types';
import { Alert, Badge, Button, Card, MobileCard, MobileCardRow, PageHeader, TableScroll } from '../components/ui';

export function TransactionsPage() {
  const [tab, setTab] = useState<'wallet' | 'paystack'>('wallet');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      if (tab === 'wallet') {
        const result = await listTransactions();
        setTransactions(result.data);
      } else {
        const result = await listPayments();
        setPayments(result.data);
      }
    } catch {
      setError('Could not load transactions.');
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Wallet movements and Paystack payments" />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant={tab === 'wallet' ? 'primary' : 'outline'} onClick={() => setTab('wallet')}>
          Wallet transactions
        </Button>
        <Button variant={tab === 'paystack' ? 'primary' : 'outline'} onClick={() => setTab('paystack')}>
          Paystack payments
        </Button>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>
      {error ? <Alert>{error}</Alert> : null}

      {tab === 'wallet' ? (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {transactions.map((t) => (
              <MobileCard key={t.id}>
                <p className="mb-2 font-semibold">
                  {t.user ? (
                    <Link to={`/users/${t.user.id}`} className="text-brand">
                      {t.user.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
                <MobileCardRow label="Type">
                  <Badge>{t.type.replace(/_/g, ' ')}</Badge>
                </MobileCardRow>
                <MobileCardRow label="Amount">{formatNaira(t.amount_naira)}</MobileCardRow>
                <MobileCardRow label="Balance after">{formatNaira(t.balance_after_naira)}</MobileCardRow>
                <MobileCardRow label="Date">
                  <span className="text-xs">{new Date(t.created_at).toLocaleString()}</span>
                </MobileCardRow>
              </MobileCard>
            ))}
          </div>
          <Card className="hidden overflow-hidden md:block">
            <TableScroll>
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-cream/50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Balance after</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-stone-100">
                      <td className="px-4 py-3">
                        {t.user ? (
                          <Link to={`/users/${t.user.id}`} className="font-medium text-brand hover:underline">
                            {t.user.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{t.type.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatNaira(t.amount_naira)}</td>
                      <td className="px-4 py-3">{formatNaira(t.balance_after_naira)}</td>
                      <td className="px-4 py-3 text-stone-500">{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </Card>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {payments.map((p) => (
              <MobileCard key={p.id}>
                <p className="mb-2 font-semibold">
                  {p.user ? (
                    <Link to={`/users/${p.user.id}`} className="text-brand">
                      {p.user.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
                <MobileCardRow label="Purpose">{p.purpose}</MobileCardRow>
                <MobileCardRow label="Reference">
                  <span className="break-all font-mono text-xs">{p.reference}</span>
                </MobileCardRow>
                <MobileCardRow label="Amount">{formatNaira(p.amount_naira)}</MobileCardRow>
                <MobileCardRow label="Status">
                  <Badge tone={p.status === 'success' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}>
                    {p.status}
                  </Badge>
                </MobileCardRow>
              </MobileCard>
            ))}
          </div>
          <Card className="hidden overflow-hidden md:block">
            <TableScroll>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-cream/50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-stone-100">
                      <td className="px-4 py-3">
                        {p.user ? (
                          <Link to={`/users/${p.user.id}`} className="font-medium text-brand hover:underline">
                            {p.user.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">{p.purpose}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                      <td className="px-4 py-3">{formatNaira(p.amount_naira)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={p.status === 'success' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </Card>
        </>
      )}
    </div>
  );
}
