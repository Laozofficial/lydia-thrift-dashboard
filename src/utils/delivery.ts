export function deliveryBadgeTone(
  deliveryStatus: string | null | undefined,
): 'success' | 'warning' | 'neutral' | 'danger' {
  switch (deliveryStatus) {
    case 'delivered':
      return 'success';
    case 'in_transit':
      return 'warning';
    case 'processing':
    case 'pending':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export const DELIVERY_STATUS_OPTIONS = [
  { value: 'processing', label: 'Preparing shipment' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
];
