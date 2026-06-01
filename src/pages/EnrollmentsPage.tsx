import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { listEnrollments, type EnrollmentFulfillment } from '../api/admin';
import { formatNaira } from '../api/client';
import type { Enrollment } from '../api/types';
import { deliveryBadgeTone } from '../utils/delivery';
import { Alert, Badge, Card, PageHeader } from '../components/ui';

const FULFILLMENT_TABS: { value: EnrollmentFulfillment | ''; label: string; hint: string }[] = [
  { value: '', label: 'All plans', hint: 'Every enrollment' },
  { value: 'recently_completed', label: 'Just completed', hint: 'Paid off in last 14 days' },
  { value: 'awaiting_shipment', label: 'Needs shipping', hint: 'Ready to pack & ship' },
  { value: 'in_transit', label: 'In transit', hint: 'Shipped, not delivered yet' },
  { value: 'delivered', label: 'Delivered', hint: 'Fulfilled orders' },
];

export function EnrollmentsPage() {
  const [searchParams] = useSearchParams();
  const initialFulfillment = (searchParams.get('fulfillment') ?? '') as EnrollmentFulfillment | '';

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [fulfillment, setFulfillment] = useState<EnrollmentFulfillment | ''>(initialFulfillment);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await listEnrollments({
        fulfillment: fulfillment || undefined,
        sort:
          fulfillment === 'recently_completed'
            ? 'completed_recent'
            : fulfillment === 'delivered'
              ? 'delivered_recent'
              : 'newest',
      });
      setEnrollments(result.data);
    } catch {
      setError('Could not load plans.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [fulfillment]);

  return (
    <div>
      <PageHeader title="Plans & shipping" subtitle="Track completed orders and deliveries" />

      <div className="mb-4 flex flex-wrap gap-2">
        {FULFILLMENT_TABS.map((tab) => (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => setFulfillment(tab.value)}
            className={`border px-4 py-2 text-left text-sm transition ${
              fulfillment === tab.value
                ? 'border-brand bg-brand text-white'
                : 'border-stone-300 bg-white text-stone-700 hover:border-brand'
            }`}
          >
            <span className="font-semibold">{tab.label}</span>
            <span className={`mt-0.5 block text-xs ${fulfillment === tab.value ? 'text-white/80' : 'text-stone-500'}`}>
              {tab.hint}
            </span>
          </button>
        ))}
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className="text-stone-500">Loading…</p> : null}

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-cream/50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Shipping</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {!loading && enrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                  No plans in this queue.
                </td>
              </tr>
            ) : null}
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-stone-100 hover:bg-cream/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{e.user?.name ?? '—'}</p>
                  <p className="text-xs text-stone-500">{e.user?.email}</p>
                </td>
                <td className="px-4 py-3">{e.product?.name}</td>
                <td className="px-4 py-3">
                  <Badge tone={e.status === 'active' ? 'success' : e.status === 'completed' ? 'neutral' : 'warning'}>
                    {e.status}
                  </Badge>
                  {e.shipping?.completed_at ? (
                    <p className="mt-1 text-xs text-stone-500">
                      Completed {new Date(e.shipping.completed_at).toLocaleDateString()}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={deliveryBadgeTone(e.delivery_status)}>
                    {e.delivery_status_label ?? e.delivery_status ?? '—'}
                  </Badge>
                  {e.shipping?.tracking_number ? (
                    <p className="mt-1 font-mono text-xs text-stone-600">{e.shipping.tracking_number}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{formatNaira(e.total_naira)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/enrollments/${e.id}`} className="font-semibold text-brand hover:underline">
                    Manage
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
