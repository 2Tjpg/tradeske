'use client';

import { Localize } from '@deriv-com/translations';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClosedPosition } from '@/hooks/use-closed-positions';
import { getSymbolDisplayName } from '@/lib/active-symbols-display-names';

interface ClosedPositionCardProps {
  pos: ClosedPosition;
  contractTypeLabels: Record<string, string>;
}

function getDirectionDisplay(
  contractType: string,
  labels: Record<string, string>
): { label: string } {
  const label = labels[contractType] ?? contractType;
  return { label };
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function ClosedPositionCard({
  pos,
  contractTypeLabels,
}: ClosedPositionCardProps) {
  const { label: dirLabel } = getDirectionDisplay(
    pos.contract_type,
    contractTypeLabels
  );
  const profit = pos.sell_price - pos.buy_price;
  const isProfit = profit >= 0;
  const duration = pos.sell_time - pos.purchase_time;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Row 1: Contract identity + Asset */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="max-w-full truncate rounded-md px-2 py-0.5 font-mono text-[11px]">
              ID: {pos.contract_id}
            </Badge>
            <span className="text-sm font-semibold text-foreground">{getSymbolDisplayName(pos.underlying_symbol)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{dirLabel}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs px-2 py-0.5 rounded-md font-medium">
          {pos.underlying_symbol}
        </Badge>
      </div>

      {/* Duration */}
      <div>
        <span className="text-sm font-mono text-muted-foreground">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            <Localize i18n_default_text="Total profit/loss:" />
          </p>
          <p
            className={cn(
              'text-base font-bold',
              isProfit ? 'text-emerald-500' : 'text-destructive'
            )}
          >
            {isProfit ? '+' : ''}
            {profit.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            <Localize i18n_default_text="Sell price:" />
          </p>
          <p className="text-base font-bold text-foreground">
            {pos.sell_price.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            <Localize i18n_default_text="Stake:" />
          </p>
          <p className="text-base font-bold text-foreground">
            {pos.buy_price.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            <Localize i18n_default_text="Payout:" />
          </p>
          <p className="text-base font-bold text-foreground">
            {pos.payout.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
