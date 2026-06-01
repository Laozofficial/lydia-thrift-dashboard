import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getDashboardStats } from '../api/admin';
import { formatNaira } from '../api/client';
import type { DashboardStats } from '../api/types';
import { Card, PageHeader } from '../components/ui';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
  }, []);

  const tiles = stats
    ? [
        { label: 'Needs shipping', value: stats.awaiting_shipment_count, sub: 'Completed, not shipped', to: '/enrollments?fulfillment=awaiting_shipment' },
        { label: 'Just completed', value: stats.recently_completed_count, sub: 'Last 14 days', to: '/enrollments?fulfillment=recently_completed' },
        { label: 'In transit', value: stats.in_transit_count, to: '/enrollments?fulfillment=in_transit' },
        { label: 'Delivered', value: stats.delivered_count, to: '/enrollments?fulfillment=delivered' },
        { label: 'Customers', value: stats.users_count, to: '/users' },
        { label: 'Active plans', value: stats.active_enrollments_count, sub: `${stats.enrollments_count} total`, to: '/enrollments' },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of Lydia's Thrift platform" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to}>
            <Card className="p-6 transition hover:border-brand/40 hover:shadow-md">
              <p className="text-sm font-medium text-stone-500">{tile.label}</p>
              <p className="mt-2 text-3xl font-bold text-brand">{tile.value}</p>
              {tile.sub ? <p className="mt-1 text-xs text-stone-500">{tile.sub}</p> : null}
            </Card>
          </Link>
        ))}
      </div>
      {!stats ? <p className="mt-6 text-stone-500">Could not load stats.</p> : null}
      <p className="mt-8 text-xs text-stone-400">Sample format: {formatNaira(12500)}</p>
    </div>
  );
}
