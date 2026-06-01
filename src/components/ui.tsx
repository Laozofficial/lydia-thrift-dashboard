import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold text-stone-900 sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">{action}</div> : null}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-stone-200 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' }) {
  const base =
    'inline-flex min-h-[44px] w-full items-center justify-center px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 sm:w-auto';
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    outline: 'border border-stone-300 text-stone-700 hover:border-brand hover:text-brand',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

const fieldClass =
  'w-full min-h-[44px] border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-1 focus:ring-brand sm:text-sm';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${fieldClass} ${className}`} {...props}>
      {children}
    </select>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PasswordInput({ className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={`${fieldClass} pr-11 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center text-stone-500 hover:text-brand"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">{children}</label>;
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-1 focus:ring-brand sm:text-sm ${className}`}
      {...props}
    />
  );
}

export function Alert({ variant = 'error', children }: { variant?: 'error' | 'success'; children: ReactNode }) {
  const styles =
    variant === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200';
  return <div className={`mb-4 border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const tones = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-flex border px-2.5 py-0.5 text-xs font-semibold capitalize ${tones[tone]}`}>{children}</span>
  );
}

/** Horizontal scroll wrapper for wide tables on tablet */
export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">{children}</div>;
}

export function MobileCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-stone-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>
  );
}

export function MobileCardRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-stone-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</span>
      <div className="min-w-0 text-right text-sm text-stone-800">{children}</div>
    </div>
  );
}
