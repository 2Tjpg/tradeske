'use client';

import { useEffect, useMemo, useState } from 'react';
import { Ban, ChevronDown, ChevronUp } from 'lucide-react';
import { Localize } from '@deriv-com/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/custom/footer';
import { Header } from '@/components/custom/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useAppTranslations } from '@/components/custom/i18n-provider';
import { CurrentTickDisplay } from './current-tick-display';
import { DigitStatsBar } from './digit-stats-bar';
import { TradeControls } from './trade-controls';
import { ConfigurableDigitsControls } from './configurable-digits-controls';
import { TradeTypeChips } from '@/components/custom/trade-type-chips';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import { TickChart } from './tick-chart';
import { useTradeChartTracking } from '@/hooks/use-trade-chart-tracking';
import type { DerivWS } from '@deriv/core';
import type {
  AuthState,
  DerivAccount,
  ActiveSymbol,
  Tick,
  TickPoint,
  ProposalInfo,
  DurationLimits,
  BuyResult,
} from '@deriv/core';
import type { ContractMode, TradeType, DigitStats } from '../lib/types';
import type { DigitsAppConfig } from '../lib/app-config';

function getDigitTradeTypeOptions(
  localize: (text: string) => string
): { value: TradeType; label: string }[] {
  return [
    { value: 'matches-differs', label: localize('Matches/Differs') },
    { value: 'over-under', label: localize('Over/Under') },
    { value: 'even-odd', label: localize('Even/Odd') },
  ];
}

export interface DigitsViewProps {
  // Auth
  authState: AuthState;
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onLogin: () => Promise<void>;
  onSignUp: () => Promise<void>;
  onLogout: () => void;
  onSwitchAccount: (accountId: string) => Promise<void>;

  // Connection / loading
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Market data
  ws: DerivWS | null;
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  selectSymbol: (symbol: string) => void;
  currentTick: Tick | null;
  tickHistory: TickPoint[];
  lastDigit: number | null;
  digitStats: DigitStats;
  pipSize: number;

  // Trade controls
  tradeType: TradeType;
  setTradeType: (type: TradeType) => void;
  contractMode: ContractMode;
  setContractMode: (mode: ContractMode) => void;
  selectedDigit: number;
  setSelectedDigit: (digit: number) => void;
  stake: string;
  setStake: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  durationLimits: DurationLimits;
  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  matchesProposal: ProposalInfo | null;
  differsProposal: ProposalInfo | null;
  isMatchesProposalLoading: boolean;
  isDiffersProposalLoading: boolean;
  buyContract: () => Promise<void>;
  buyContractForMode: (mode: 'DIGITMATCH' | 'DIGITDIFF') => Promise<void>;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  clearBuyResult: () => void;
  // Branding (used by preview route; no-op in the real app)
  logoSrc?: string;
  appName?: string;
  showAppName?: boolean;

  /**
   * No-code config. When provided, the controls render in configurable
   * styles/order (ConfigurableDigitsControls). When omitted, the standard
   * DigitsView layout renders unchanged.
   */
  appConfig?: DigitsAppConfig;
  /** Enables the live chart and bottom-sheet presentation on the deployed trade page. */
  phaseOneTradeUi?: boolean;
  /** Edit mode — components become selectable (click opens their accordion). */
  editMode?: boolean;
  /** Called when an editable component is clicked (e.g. "stake"). */
  onSelect?: (key: string) => void;
  /** Currently selected component (highlighted). */
  selectedKey?: string | null;
  /** Rearrange mode — drag blocks in the phone to reorder the layout. */
  rearrangeMode?: boolean;
  /** Called with the new block order after a drag-drop reorder. */
  onReorder?: (order: DigitsAppConfig['order']) => void;
}

export function DigitsView({
  authState,
  accounts,
  activeAccount,
  onLogin,
  onSignUp,
  onLogout,
  onSwitchAccount,
  isConnected,
  isLoading,
  error,
  ws,
  symbols,
  activeSymbol,
  selectSymbol,
  currentTick,
  tickHistory,
  lastDigit,
  digitStats,
  pipSize,
  tradeType,
  setTradeType,
  contractMode,
  setContractMode,
  selectedDigit,
  setSelectedDigit,
  stake,
  setStake,
  duration,
  setDuration,
  durationLimits,
  proposal,
  isProposalLoading,
  matchesProposal,
  differsProposal,
  isMatchesProposalLoading,
  isDiffersProposalLoading,
  buyContract,
  buyContractForMode,
  isBuying,
  buyResult,
  buyError,
  clearBuyResult,
  logoSrc,
  appName,
  showAppName,
  appConfig,
  phaseOneTradeUi = false,
  editMode,
  onSelect,
  selectedKey,
  rearrangeMode,
  onReorder,
}: DigitsViewProps) {
  const isMobile = useIsMobile();
  const chartTracking = useTradeChartTracking(
    ws,
    isConnected,
    buyResult,
    contractMode,
    selectedDigit
  );
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  useEffect(() => {
    if (phaseOneTradeUi && buyResult) clearBuyResult();
  }, [buyResult, clearBuyResult, phaseOneTradeUi]);
  const { localize } = useAppTranslations();
  const digitTradeTypeOptions = getDigitTradeTypeOptions(localize);

  // In edit mode, login/sign-up/account actions are inert (no OAuth navigation
  // out of the editor) — only the theme toggle stays interactive.
  const headerEl = useMemo(() => {
    const noop = () => {};
    const noopAsync = async () => {};
    return (
      <Header
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={editMode ? noopAsync : onLogin}
        onSignUp={editMode ? noopAsync : onSignUp}
        onLogout={editMode ? noop : onLogout}
        onSwitchAccount={editMode ? noopAsync : onSwitchAccount}
        logoSrc={logoSrc}
        appName={appName}
        showAppName={showAppName}
        actions={<ThemeToggle />}
      />
    );
  }, [
    authState,
    accounts,
    activeAccount,
    editMode,
    onLogin,
    onSignUp,
    onLogout,
    onSwitchAccount,
    logoSrc,
    appName,
    showAppName,
  ]);

  if (error) {
    return (
      <main className="flex flex-col bg-background items-center justify-center px-4 min-h-dvh">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">
              <Localize i18n_default_text="Connection Error" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // The configurable controls — a single, reorderable column of every block.
  const renderConfigurable = () =>
    appConfig ? (
      <ConfigurableDigitsControls
        config={appConfig}
        symbols={symbols}
        activeSymbol={activeSymbol}
        selectSymbol={selectSymbol}
        currentTick={currentTick}
        lastDigit={lastDigit}
        digitStats={digitStats}
        pipSize={pipSize}
        tradeType={tradeType}
        onTradeTypeChange={setTradeType}
        contractMode={contractMode}
        onContractModeChange={setContractMode}
        selectedDigit={selectedDigit}
        onDigitSelect={setSelectedDigit}
        stake={stake}
        onStakeChange={setStake}
        duration={duration}
        onDurationChange={setDuration}
        durationLimits={durationLimits}
        proposal={proposal}
        isProposalLoading={isProposalLoading}
        matchesProposal={matchesProposal}
        differsProposal={differsProposal}
        isMatchesProposalLoading={isMatchesProposalLoading}
        isDiffersProposalLoading={isDiffersProposalLoading}
        onBuy={buyContract}
        onBuyMode={buyContractForMode}
        isBuying={isBuying}
        buyResult={buyResult}
        buyError={buyError}
        onClearBuyResult={clearBuyResult}
        isConnected={isConnected}
        isAuthenticated={authState === 'authenticated'}
        editMode={editMode}
        onSelect={onSelect}
        selectedKey={selectedKey}
        rearrangeMode={rearrangeMode}
        onReorder={onReorder}
      />
    ) : null;

  if (phaseOneTradeUi && !isLoading) {
    return (
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
        {headerEl}
        <div className={authState === 'authenticated' ? 'h-[76px] shrink-0' : 'h-[66px] shrink-0'} />

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="Live market view">
          <div className="relative z-20 shrink-0 border-b border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur-xl sm:px-5">
            <div className="mb-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TradeTypeChips
                value={tradeType}
                options={digitTradeTypeOptions}
                onValueChange={setTradeType}
              />
            </div>
            <div className="w-[min(22rem,100%)]">
              <SymbolSelector
                symbols={symbols}
                activeSymbol={activeSymbol}
                onSymbolChange={selectSymbol}
                prices={tickHistory.map(point => point.value)}
                pipSize={pipSize}
              />
            </div>
          </div>

          <div className={isSheetExpanded ? 'hidden' : 'relative min-h-0 flex-1'}>
            <TickChart
              data={tickHistory}
              symbol={activeSymbol?.underlying_symbol}
            />
            {chartTracking.hudMounted && chartTracking.hudProfit !== null && (
              <div
                className={`pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-bold shadow-lg ring-1 transition-[color,background-color,border-color,opacity,transform] duration-200 motion-reduce:transition-none sm:top-6 sm:px-5 sm:py-2.5 sm:text-base ${
                  chartTracking.hudSettled ? 'scale-125' : 'scale-100'
                } ${
                  chartTracking.hudVisible
                    ? 'opacity-100'
                    : 'opacity-0'
                } ${
                  chartTracking.hudProfit > 0
                    ? 'bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800'
                    : 'bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800'
                }`}
                role="status"
                aria-live="polite"
              >
                {chartTracking.hudSettled && (
                  <>
                    <Localize i18n_default_text="Payout" />{' '}
                  </>
                )}
                {chartTracking.hudProfit > 0 ? '+' : '-'}
                {Math.abs(chartTracking.hudProfit).toFixed(2)} USD
              </div>
            )}
          </div>

          <div
            className={`relative z-10 border-t border-border bg-background/95 shadow-2xl backdrop-blur-xl ${
              isSheetExpanded ? 'min-h-0 flex-1 overflow-y-auto' : 'shrink-0'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsSheetExpanded(expanded => !expanded)}
              aria-expanded={isSheetExpanded}
              aria-label={isSheetExpanded ? 'Collapse digit predictions' : 'Expand digit predictions'}
              className="mx-auto flex h-8 w-14 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {isSheetExpanded ? (
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronUp className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <div
              className={`flex min-h-0 flex-col overflow-hidden px-3 transition-[max-height,opacity,transform] duration-300 ease-out motion-reduce:transition-none sm:px-5 ${
                isSheetExpanded
                  ? 'max-h-none flex-1 translate-y-0 overflow-y-auto opacity-100'
                  : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
              }`}
              aria-hidden={!isSheetExpanded}
              inert={!isSheetExpanded ? true : undefined}
            >
              <div className="pb-3">
                <DigitStatsBar
                  digitStats={digitStats}
                  selectedDigit={selectedDigit}
                  liveDigit={lastDigit}
                  onDigitSelect={setSelectedDigit}
                  readOnly={tradeType === 'even-odd'}
                />
              </div>
            </div>

            <div className="space-y-3 px-3 pb-3 sm:px-5">
              <TradeControls
                tradeType={tradeType}
                contractMode={contractMode}
                onContractModeChange={setContractMode}
                selectedDigit={selectedDigit}
                isConnected={isConnected}
                stake={stake}
                onStakeChange={setStake}
                duration={duration}
                onDurationChange={setDuration}
                durationLimits={durationLimits}
                proposal={proposal}
                isProposalLoading={isProposalLoading}
                matchesProposal={matchesProposal}
                differsProposal={differsProposal}
                isMatchesProposalLoading={isMatchesProposalLoading}
                isDiffersProposalLoading={isDiffersProposalLoading}
                onBuy={buyContract}
                onBuyMode={buyContractForMode}
                isBuying={isBuying}
                buyResult={buyResult}
                buyError={buyError}
                onClearBuyResult={clearBuyResult}
                isAuthenticated={authState === 'authenticated'}
                showStakeDuration={false}
                showBuy={false}
                showFeedback={false}
                bottomSheet
              />
            </div>

            <div className={`px-3 pb-3 sm:px-5 ${isSheetExpanded ? 'pt-6 sm:pt-8' : ''}`}>
              <TradeControls
                tradeType={tradeType}
                contractMode={contractMode}
                onContractModeChange={setContractMode}
                selectedDigit={selectedDigit}
                isConnected={isConnected}
                stake={stake}
                onStakeChange={setStake}
                duration={duration}
                onDurationChange={setDuration}
                durationLimits={durationLimits}
                proposal={proposal}
                isProposalLoading={isProposalLoading}
                matchesProposal={matchesProposal}
                differsProposal={differsProposal}
                isMatchesProposalLoading={isMatchesProposalLoading}
                isDiffersProposalLoading={isDiffersProposalLoading}
                onBuy={buyContract}
                onBuyMode={buyContractForMode}
                isBuying={isBuying}
                buyResult={buyResult}
                buyError={buyError}
                onClearBuyResult={clearBuyResult}
                isAuthenticated={authState === 'authenticated'}
                showContractMode={false}
                showPrediction={false}
                showFeedback={false}
                bottomSheet
              />
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`flex flex-col max-lg:h-dvh max-lg:overflow-y-auto lg:overflow-visible ${
        editMode ? 'bg-muted/50' : 'bg-background'
      }`}
    >
      {editMode ? (
        // Edit mode: header is fixed and NOT editable. On hover, grey it out with
        // a "Not editable" hint. The overlay is pointer-events-none so the header
        // (incl. the dark/light theme toggle) stays clickable.
        <div className="group/hdr fixed left-0 right-0 top-0 z-50" style={{ height: 66 }}>
          {headerEl}
          <div className="pointer-events-none absolute inset-0 z-[60] opacity-0 ring-2 ring-inset ring-muted-foreground/25 transition-opacity group-hover/hdr:opacity-100">
            <span className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-background/90 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
              <Ban className="h-3.5 w-3.5" />
              <Localize i18n_default_text="Not editable" />
            </span>
          </div>
        </div>
      ) : (
        headerEl
      )}
      {/* Spacer to push content below fixed header — taller when authenticated (account bar visible) */}
      <div className={authState === 'authenticated' ? 'h-[76px] shrink-0' : 'h-[66px] shrink-0'} />

      {appConfig ? (
        isMobile ? (
          /* No-code mobile layout: a single, reorderable column of blocks. */
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-3 py-3 pb-28">
              {isLoading ? <Skeleton className="h-[420px] w-full rounded-xl" /> : renderConfigurable()}
            </div>
          </div>
        ) : (
          /* No-code desktop layout: a single centred controls card so the
             ordering stays honest (drag-to-reorder is top-to-bottom). */
          <div className="flex w-full max-w-2xl mx-auto flex-col px-4 py-4 pb-24">
            {isLoading ? (
              <Skeleton className="h-[420px] w-full rounded-xl" />
            ) : (
              <Card className="overflow-y-auto">
                <CardContent className="pt-4">{renderConfigurable()}</CardContent>
              </Card>
            )}
          </div>
        )
      ) : (
        /* Standard layout (unchanged): trade type chips + main card. */
        <div className="flex w-full max-w-7xl mx-auto flex-col px-3 py-2 sm:px-4 sm:py-4 gap-2 sm:gap-3 lg:flex-none lg:overflow-visible pb-10">
          {isLoading ? (
            <>
              {/* Trade type chips skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              {/* Main card skeleton */}
              <Skeleton className="w-full h-[420px] rounded-xl" />
            </>
          ) : (
            <>
              <div className="-mx-3 shrink-0 overflow-x-auto px-3 pb-0.5 scroll-px-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:scroll-px-0">
                <TradeTypeChips
                  value={tradeType}
                  options={digitTradeTypeOptions}
                  onValueChange={setTradeType}
                />
              </div>

              <Card className="shrink-0 border shadow-sm mb-12">
                <CardContent className="flex flex-col p-3 pt-3 sm:p-6 sm:pt-4 pb-2 sm:pb-6">
                  <div
                    className="lg:grid lg:grid-cols-3 lg:overflow-visible"
                  >
                    {/* Column 1: Symbol selector + tick display */}
                    <div className="flex flex-col pb-4 pt-1 sm:pb-6 sm:pt-2 lg:py-0 lg:pr-6">
                      <SymbolSelector
                        symbols={symbols}
                        activeSymbol={activeSymbol}
                        onSymbolChange={selectSymbol}
                        prices={tickHistory.map(point => point.value)}
                        pipSize={pipSize}
                      />
                      <div className="flex items-center justify-center min-h-24 sm:min-h-32 lg:flex-1">
                        <CurrentTickDisplay
                          tick={currentTick}
                          lastDigit={lastDigit}
                          activeSymbol={activeSymbol}
                          pipSize={pipSize}
                        />
                      </div>
                    </div>

                    {/* Columns 2+3 wrapper: stacked on mobile, transparent on desktop */}
                    <div className="max-lg:border-t max-lg:divide-y divide-border lg:contents">
                      {/* Column 2: Shared digit statistics and live tick cursor */}
                      <div className="py-4 sm:py-6 lg:py-0 lg:px-6 lg:border-l lg:border-border">
                        <DigitStatsBar
                          digitStats={digitStats}
                          selectedDigit={selectedDigit}
                          liveDigit={lastDigit}
                          onDigitSelect={setSelectedDigit}
                          readOnly={tradeType === 'even-odd'}
                        />
                      </div>

                      {/* Column 3: Trade controls */}
                      <div className="pt-4 sm:pt-6 lg:pt-0 lg:pl-6 lg:border-l lg:border-border">
                        <TradeControls
                          tradeType={tradeType}
                          contractMode={contractMode}
                          onContractModeChange={setContractMode}
                          selectedDigit={selectedDigit}
                          isConnected={isConnected}
                          stake={stake}
                          onStakeChange={setStake}
                          duration={duration}
                          onDurationChange={setDuration}
                          durationLimits={durationLimits}
                          proposal={proposal}
                          isProposalLoading={isProposalLoading}
                          matchesProposal={matchesProposal}
                          differsProposal={differsProposal}
                          isMatchesProposalLoading={isMatchesProposalLoading}
                          isDiffersProposalLoading={isDiffersProposalLoading}
                          onBuy={buyContract}
                          onBuyMode={buyContractForMode}
                          isBuying={isBuying}
                          buyResult={buyResult}
                          buyError={buyError}
                          onClearBuyResult={clearBuyResult}
                          isAuthenticated={authState === 'authenticated'}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 py-2 text-center bg-background/80 backdrop-blur-sm">
        <Footer />
      </div>
    </main>
  );
}
