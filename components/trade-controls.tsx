'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Localize } from '@deriv-com/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppTranslations } from '@/components/custom/i18n-provider';
import type {
  ContractMode,
  TradeType,
  DurationLimits,
  ProposalInfo,
  BuyResult,
} from '../lib/types';

interface TradeControlsProps {
  tradeType: TradeType;
  contractMode: ContractMode;
  onContractModeChange: (mode: ContractMode) => void;
  selectedDigit: number;
  isConnected: boolean;
  stake: string;
  onStakeChange: (value: string) => void;
  duration: number;
  onDurationChange: (value: number) => void;
  durationLimits: DurationLimits;
  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  matchesProposal: ProposalInfo | null;
  differsProposal: ProposalInfo | null;
  isMatchesProposalLoading: boolean;
  isDiffersProposalLoading: boolean;
  onBuy: () => void;
  onBuyMode: (mode: 'DIGITMATCH' | 'DIGITDIFF') => void;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  onClearBuyResult: () => void;
  isAuthenticated?: boolean;
  showContractMode?: boolean;
  showPrediction?: boolean;
  bottomSheet?: boolean;
}

function getContractModeOptions(
  localize: (text: string) => string
): Record<TradeType, { value: ContractMode; label: string }[]> {
  return {
    'matches-differs': [
      { value: 'DIGITMATCH', label: localize('Matches') },
      { value: 'DIGITDIFF', label: localize('Differs') },
    ],
    'over-under': [
      { value: 'DIGITOVER', label: localize('Over') },
      { value: 'DIGITUNDER', label: localize('Under') },
    ],
    'even-odd': [
      { value: 'DIGITEVEN', label: localize('Even') },
      { value: 'DIGITODD', label: localize('Odd') },
    ],
  };
}

function getPredictionText(
  contractMode: ContractMode,
  localize: (text: string) => string
): string {
  switch (contractMode) {
    case 'DIGITMATCH':
      return localize('match');
    case 'DIGITDIFF':
      return localize('differ from');
    case 'DIGITOVER':
      return localize('be over');
    case 'DIGITUNDER':
      return localize('be under');
    case 'DIGITEVEN':
      return localize('be even');
    case 'DIGITODD':
      return localize('be odd');
  }
}

function showDigitInPrediction(contractMode: ContractMode): boolean {
  return contractMode !== 'DIGITEVEN' && contractMode !== 'DIGITODD';
}

export function TradeControls({
  tradeType,
  contractMode,
  onContractModeChange,
  selectedDigit,
  isConnected,
  stake,
  onStakeChange,
  duration,
  onDurationChange,
  durationLimits,
  proposal,
  isProposalLoading,
  matchesProposal,
  differsProposal,
  isMatchesProposalLoading,
  isDiffersProposalLoading,
  onBuy,
  onBuyMode,
  isBuying,
  buyResult,
  buyError,
  onClearBuyResult,
  isAuthenticated,
  showContractMode = true,
  showPrediction = true,
  bottomSheet = false,
}: TradeControlsProps) {
  const { localize } = useAppTranslations();

  useEffect(() => {
    if (buyError) {
      toast.error(localize('Purchase Failed'), { description: buyError });
      onClearBuyResult();
    }
  }, [buyError, onClearBuyResult, localize]);

  useEffect(() => {
    if (buyResult) {
      toast.success(localize('Contract Purchased'), {
        description: localize(
          'Buy price: {{buyPrice}} USD | Payout: {{payout}} USD | Balance: {{balance}} USD',
          {
            buyPrice: buyResult.buyPrice.toFixed(2),
            payout: buyResult.payout.toFixed(2),
            balance: buyResult.balanceAfter.toFixed(2),
          }
        ),
      });
      onClearBuyResult();
    }
  }, [buyResult, onClearBuyResult, localize]);

  const modeOptions = getContractModeOptions(localize)[tradeType];
  const isMatchesDiffers = tradeType === 'matches-differs';
  const activeProposal = isMatchesDiffers
    ? contractMode === 'DIGITMATCH'
      ? matchesProposal
      : differsProposal
    : proposal;
  const activeProposalLoading = isMatchesDiffers
    ? contractMode === 'DIGITMATCH'
      ? isMatchesProposalLoading
      : isDiffersProposalLoading
    : isProposalLoading;
  const buyActiveContract = () => {
    if (isMatchesDiffers) {
      onBuyMode(contractMode === 'DIGITMATCH' ? 'DIGITMATCH' : 'DIGITDIFF');
    } else {
      onBuy();
    }
  };
  const buyLabel = isBuying
    ? localize('Purchasing...')
    : localize('Buy @ {{stake}} USD', { stake: (parseFloat(stake) || 0).toFixed(2) });

  return (
    <div className="space-y-2 sm:space-y-4">
      {showContractMode && (
        <ToggleGroup
          type="single"
          value={contractMode}
          onValueChange={value => {
            if (value) onContractModeChange(value as ContractMode);
          }}
          className="w-full gap-0 rounded-full bg-muted p-1"
        >
          {modeOptions.map(opt => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className="flex-1 rounded-full text-sm font-medium text-muted-foreground data-[state=on]:bg-background data-[state=on]:!text-primary data-[state=on]:font-bold data-[state=on]:shadow-sm hover:text-foreground"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="stake" className="text-xs text-muted-foreground">
            <Localize i18n_default_text="Stake" />
          </Label>
          <Input
            id="stake"
            type="number"
            value={stake}
            onChange={e => onStakeChange(e.target.value)}
            onKeyDown={e => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            min={0}
            step="0.01"
            labelRight="USD"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration" className="text-xs text-muted-foreground">
            <Localize i18n_default_text="Duration" />
          </Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onDurationChange(val);
            }}
            min={durationLimits.min}
            max={durationLimits.max}
            step={1}
            labelRight={localize('Ticks')}
          />
        </div>
      </div>

      {showPrediction && (
        <div className="space-y-1.5 rounded-lg border border-border bg-card p-2 text-card-foreground sm:space-y-2 sm:p-3">
          <p className="mb-0 text-[11px] text-muted-foreground sm:text-xs">
            <Localize i18n_default_text="Prediction" />
          </p>
          <p className="text-xs sm:text-sm font-medium">
            <Localize i18n_default_text="Last digit of the price will" />{' '}
            <span className="!text-primary font-bold">
              {getPredictionText(contractMode, localize)}
            </span>
            {showDigitInPrediction(contractMode) && (
              <>
                {' '}
                <span className="inline-flex w-5 h-5 rounded-full bg-primary text-primary-foreground items-center justify-center text-xs font-bold">
                  {selectedDigit}
                </span>
              </>
            )}
          </p>
          {(activeProposal || activeProposalLoading) && (
            <div className="flex items-center justify-between border-t border-border pt-1">
              <span className="text-xs text-muted-foreground">
                <Localize i18n_default_text="Payout" />
              </span>
              {activeProposalLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {activeProposal!.payout.toFixed(2)} USD
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Single buy action follows the selected contract toggle. */}
      <div className={bottomSheet ? 'static' : 'max-lg:fixed max-lg:bottom-[calc(env(safe-area-inset-bottom)+2.5rem)] max-lg:left-3 max-lg:right-3 lg:static'}>
        <Button
          className="h-10 w-full rounded-full px-6 sm:h-11 sm:px-8"
          disabled={!isConnected || !activeProposal || isBuying}
          onClick={buyActiveContract}
        >
          {buyLabel}
        </Button>
      </div>

      {isAuthenticated && !bottomSheet && (
        <Button asChild variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
          <Link href="/reports">
            <Localize i18n_default_text="View your positions →" />
          </Link>
        </Button>
      )}
    </div>
  );
}
