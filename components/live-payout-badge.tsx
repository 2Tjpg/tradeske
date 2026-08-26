'use client';

import { Localize } from '@deriv-com/translations';
import { cn } from '@/lib/utils';

interface LivePayoutBadgeProps {
  profit: number | null;
  mounted: boolean;
  visible: boolean;
  settled: boolean;
  compact?: boolean;
  className?: string;
}

export function LivePayoutBadge({
  profit,
  mounted,
  visible,
  settled,
  compact = false,
  className,
}: LivePayoutBadgeProps) {
  if (!mounted || profit === null) return null;

  return (
    <div
      className={cn(
        'pointer-events-none z-10 whitespace-nowrap rounded-full font-bold shadow-lg ring-1 transition-[color,background-color,border-color,opacity,transform] duration-200 motion-reduce:transition-none',
        compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base',
        settled ? (compact ? 'scale-110' : 'scale-125') : 'scale-100',
        visible ? 'opacity-100' : 'opacity-0',
        profit > 0
          ? 'bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800'
          : 'bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {settled && (
        <>
          <Localize i18n_default_text="Payout" />{' '}
        </>
      )}
      {profit > 0 ? '+' : '-'}
      {Math.abs(profit).toFixed(2)} USD
    </div>
  );
}
