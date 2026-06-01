import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getEnrollment, updateEnrollmentDelivery } from '../api/admin';
import { formatNaira } from '../api/client';
import type { Enrollment } from '../api/types';
import { deliveryBadgeTone, DELIVERY_STATUS_OPTIONS } from '../utils/delivery';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Label,
  MobileCard,
  MobileCardRow,
  PageHeader,
  Select,
  TableScroll,
  Textarea,
} from '../components/ui';

export function EnrollmentDetailPage() {
  const { id } = useParams();
  const enrollmentId = Number(id);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState('processing');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function applyEnrollment(e: Enrollment) {
    setEnrollment(e);
    const s = e.shipping;
    setDeliveryStatus(s?.status ?? e.delivery_status ?? 'processing');
    setCarrier(s?.carrier ?? '');
    setTrackingNumber(s?.tracking_number ?? '');
    setShippingNotes(s?.notes ?? '');
    setAddress(s?.address ?? e.user?.delivery_address ?? '');
    setPhone(s?.phone ?? e.user?.phone ?? '');
  }

  useEffect(() => {
    getEnrollment(enrollmentId)
      .then(applyEnrollment)
      .catch(() => setError('Plan not found.'));
  }, [enrollmentId]);

  async function handleSaveShipping(e: FormEvent) {
    e.preventDefault();
    if (enrollment?.status !== 'completed') {
      setError('All installments must be paid before updating shipping.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateEnrollmentDelivery(enrollmentId, {
        delivery_status: deliveryStatus,
        carrier: carrier.trim() || undefined,
        tracking_number: trackingNumber.trim() || undefined,
        shipping_notes: shippingNotes.trim() || undefined,
        delivery_address_snapshot: address.trim() || undefined,
        recipient_phone_snapshot: phone.trim() || undefined,
      });
      applyEnrollment(updated);
      setMessage('Shipping details saved. Customer will see this in the app.');
    } catch {
      setError('Could not save shipping details.');
    } finally {
      setSaving(false);
    }
  }

  if (error && !enrollment) return <Alert>{error}</Alert>;
  if (!enrollment) return <p className="text-stone-500">Loading…</p>;

  const shipping = enrollment.shipping;

  return (
    <div>
      <PageHeader
        title={enrollment.product?.name ?? 'Plan'}
        subtitle={`Enrollment #${enrollment.id}`}
        action={
          <Link to="/enrollments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Back to queue
            </Button>
          </Link>
        }
      />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone={enrollment.status === 'completed' ? 'success' : 'neutral'}>Plan: {enrollment.status}</Badge>
        <Badge tone={deliveryBadgeTone(enrollment.delivery_status)}>
          {enrollment.delivery_status_label ?? enrollment.delivery_status}
        </Badge>
        {shipping?.completed_at ? (
          <span className="text-sm text-stone-500">
            Paid off {new Date(shipping.completed_at).toLocaleString()}
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-3 text-sm">
          <h2 className="font-display font-semibold">Customer</h2>
          {enrollment.user ? (
            <>
              <p className="font-medium">{enrollment.user.name}</p>
              <p className="text-stone-500">{enrollment.user.email}</p>
              <Link to={`/users/${enrollment.user.id}`} className="text-brand font-semibold hover:underline">
                View profile
              </Link>
            </>
          ) : (
            <p className="text-stone-500">—</p>
          )}
        </Card>

        <Card className="p-6 space-y-2 text-sm">
          <h2 className="font-display font-semibold">Plan summary</h2>
          <p className="capitalize">Duration: {enrollment.duration_type}</p>
          <p>Total: {formatNaira(enrollment.total_naira)}</p>
          <p>Per installment: {formatNaira(enrollment.amount_per_installment_naira)}</p>
          <p>Installments: {enrollment.installment_count}</p>
          <p>Started: {enrollment.start_date}</p>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display mb-1 text-lg font-semibold">Shipping & delivery</h2>
        <p className="mb-4 text-sm text-stone-500">
          Update status and tracking — customers see this on their plan screen in the app.
        </p>

        {enrollment.status !== 'completed' ? (
          <Alert>Shipping can be managed after all installments are paid.</Alert>
        ) : (
          <form onSubmit={handleSaveShipping} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Delivery status</Label>
              <Select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
                {DELIVERY_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Carrier</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="GIG, DHL, etc." />
            </div>
            <div>
              <Label>Tracking number</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking ID"
              />
            </div>
            <div>
              <Label>Recipient phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Delivery address</Label>
              <Textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Notes for customer (optional)</Label>
              <Textarea
                rows={2}
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                placeholder="e.g. Leave at front desk"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving} className="w-full md:w-auto">
                {saving ? 'Saving…' : 'Save shipping details'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 font-semibold">Payment schedule</h2>
        <div className="flex flex-col gap-2 md:hidden">
          {(enrollment.payment_schedules ?? []).map((s) => (
            <MobileCard key={s.id}>
              <p className="mb-2 font-semibold">Payment #{s.sequence}</p>
              <MobileCardRow label="Due">{new Date(s.due_at).toLocaleDateString()}</MobileCardRow>
              <MobileCardRow label="Amount">{formatNaira(s.amount_naira)}</MobileCardRow>
              <MobileCardRow label="Status">
                <span className="capitalize">{s.status}</span>
              </MobileCardRow>
            </MobileCard>
          ))}
        </div>
        <Card className="hidden overflow-hidden md:block">
          <TableScroll>
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="bg-cream/50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Due</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(enrollment.payment_schedules ?? []).map((s) => (
                  <tr key={s.id} className="border-t border-stone-100">
                    <td className="px-4 py-2">{s.sequence}</td>
                    <td className="px-4 py-2">{new Date(s.due_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{formatNaira(s.amount_naira)}</td>
                    <td className="px-4 py-2 capitalize">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </Card>
      </div>
    </div>
  );
}
