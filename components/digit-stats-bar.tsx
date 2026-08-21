'use client';

import { Localize } from '@deriv-com/translations';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DigitStats } from '../lib/types';

interface DigitStatsBarProps {
  digitStats: DigitStats;
  selectedDigit: number;
  liveDigit?: number | null;
  onDigitSelect: (digit: number) => void;
  readOnly?: boolean;
}

export function DigitStatsBar({
  digitStats,
  selectedDigit,
  liveDigit,
  onDigitSelect,
  readOnly = false,
}: DigitStatsBarProps) {
  const maxPct = Math.max(...digitStats.percentages);
  const minPct = Math.min(...digitStats.percentages);

  return (
    <div className="h-full flex flex-col min-h-0">
      <span className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
        <Localize i18n_default_text="Last digit prediction" />
      </span>
      <div className="flex-1 flex items-center min-h-0">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 place-items-center w-full">
        {digitStats.percentages.map((pct, digit) => {
          const isSelected = !readOnly && digit === selectedDigit;
          const isLive = digit === liveDigit;
          const isHighest = digitStats.totalTicks > 0 && pct === maxPct;
          const isLowest = digitStats.totalTicks > 0 && pct === minPct;

          return (
            <div key={digit} className="flex flex-col items-center gap-1 sm:gap-1.5">
              <Button
                variant={isSelected ? 'default' : 'outline'}
                onClick={readOnly ? undefined : () => onDigitSelect(digit)}
                aria-disabled={readOnly}
                tabIndex={readOnly ? -1 : undefined}
                className={cn(
                  'w-11 h-11 sm:w-14 sm:h-14 text-base sm:text-xl font-semibold rounded-lg p-0 transition-all duration-150',
                  !isSelected && 'bg-muted/50 border-muted-foreground/20',
                  readOnly && 'pointer-events-none',
                  isLive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                {digit}
              </Button>
              {isLive && (
                <span
                  aria-label="Live tick digit"
                  className="h-1.5 w-1.5 rounded-full bg-primary transition-all duration-150"
                />
              )}
              <span
                className={cn(
                  'text-xs font-mono',
                  isHighest && 'text-green-500 font-semibold',
                  isLowest && 'text-red-500 font-semibold',
                  !isHighest && !isLowest && 'text-muted-foreground'
                )}
              >
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
