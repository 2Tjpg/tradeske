'use client';

import { useState } from 'react';
import { Localize } from '@deriv-com/translations';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LANGUAGE_LOCALES } from '@/lib/i18n';
import { useAppTranslations } from '@/components/custom/i18n-provider';
import { LanguageSwitcher } from '@/components/custom/language-switcher';
import type { AuthState, DerivAccount } from '@deriv/core';

interface HeaderProps {
  authState: AuthState;
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onLogin: () => Promise<void>;
  onLogout: () => void;
  onSwitchAccount: (accountId: string) => Promise<void>;
  /** When provided, a Sign up button is rendered to the right of the Log in button. */
  onSignUp?: () => Promise<void>;
  /** Logo source URL or data URL. When omitted, a placeholder badge is shown until
   *  the user provides a logo via the app builder (passed as a data URL via PREVIEW_BRANDING). */
  logoSrc?: string;
  /** App name used for the header text and the fallback logo letter when no logoSrc
   *  is provided. Prefers the live preview / Customise name, then
   *  NEXT_PUBLIC_DERIV_APP_NAME, then 'Deriv Trading'. */
  appName?: string;
  /**
   * When false, hide the name text next to the logo. Defaults to the
   * NEXT_PUBLIC_DERIV_SHOW_APP_NAME env var (true when unset).
   */
  showAppName?: boolean;
  /** Optional controls rendered to the left of the login/logout button (e.g. a theme toggle). */
  actions?: React.ReactNode;
}

function formatBalance(balance: string, locale: string): string {
  return Number(balance).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function AccountLabel({ type }: { type: 'demo' | 'real' }) {
  return (
    <span
      className={cn(
        'text-sm font-medium',
        type === 'demo' ? 'text-orange-500' : 'text-emerald-600'
      )}
    >
      {type === 'demo' ? (
        <Localize i18n_default_text="Demo account" />
      ) : (
        <Localize i18n_default_text="Real account" />
      )}
    </span>
  );
}

function resolveHeaderAppName(appName?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_DERIV_APP_NAME?.trim();
  return appName?.trim() || fromEnv || 'Deriv Trading';
}

function resolveShowAppName(showAppName?: boolean): boolean {
  if (typeof showAppName === 'boolean') return showAppName;
  return process.env.NEXT_PUBLIC_DERIV_SHOW_APP_NAME !== 'false';
}

export function Header({
  authState,
  accounts,
  activeAccount,
  onLogin,
  onLogout,
  onSwitchAccount,
  onSignUp,
  logoSrc,
  appName,
  showAppName,
  actions,
}: HeaderProps) {
  const { currentLang, localize } = useAppTranslations();
  const numberLocale = LANGUAGE_LOCALES[currentLang];
  const [logoError, setLogoError] = useState(false);
  const resolvedName = resolveHeaderAppName(appName);
  const shouldShowName = resolveShowAppName(showAppName);
  const logoLetter = resolvedName.charAt(0).toUpperCase() || 'D';
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = authState === 'authenticated';
  const isAuthenticating = authState === 'authenticating';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {!logoSrc || logoError ? (
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {logoLetter}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- next/image is avoided here intentionally: it errors in the optimizer when /logo.png is absent locally; a plain img with onError gives the same silent fallback behaviour
          <img
            src={logoSrc}
            alt={localize('App Logo')}
            className="h-8 w-auto object-contain"
            onError={() => setLogoError(true)}
          />
        )}
        {shouldShowName && (
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            {resolvedName}
          </h1>
        )}
      </div>
      <div className="relative flex min-w-0 items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-3 md:flex">
          {actions}
          <LanguageSwitcher />
        </div>
        {isAuthenticated && activeAccount && (
          <Popover open={accountSwitcherOpen} onOpenChange={setAccountSwitcherOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg border border-border px-3 hover:bg-muted/50 transition-colors">
                <div className="text-left">
                  <AccountLabel type={activeAccount.account_type} />
                  <p className="text-base font-bold text-foreground">
                    {formatBalance(activeAccount.balance, numberLocale)} {activeAccount.currency}
                  </p>
                </div>
                <svg
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform',
                    accountSwitcherOpen && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="z-[100] w-64 p-2">
              <div className="space-y-1">
                {accounts.map((account) => (
                  <button
                    key={account.account_id}
                    onClick={() => {
                      onSwitchAccount(account.account_id);
                      setAccountSwitcherOpen(false);
                    }}
                    className={cn(
                      'w-full text-left rounded-lg px-3 py-2.5 transition-colors',
                      account.account_id === activeAccount.account_id
                        ? 'bg-muted'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <AccountLabel type={account.account_type} />
                    <p className="text-base font-bold text-foreground">
                      {formatBalance(account.balance, numberLocale)} {account.currency}
                    </p>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/reports"
            className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Localize i18n_default_text="Positions" />
          </Link>
          {isAuthenticated ? (
            <Button variant="outline" onClick={onLogout}>
              <Localize i18n_default_text="Log out" />
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onLogin} disabled={isAuthenticating}>
                {isAuthenticating ? (
                  <Localize i18n_default_text="Logging in..." />
                ) : (
                  <Localize i18n_default_text="Log in" />
                )}
              </Button>
              {onSignUp && (
                <Button size="sm" onClick={onSignUp} disabled={isAuthenticating}>
                  <Localize i18n_default_text="Sign up" />
                </Button>
              )}
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          aria-label={localize(mobileMenuOpen ? 'Close menu' : 'Open menu')}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        {mobileMenuOpen && (
          <div className="absolute right-0 top-full z-[100] mt-2 w-56 rounded-lg border border-border bg-popover p-2 shadow-lg md:hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border px-2 pb-2">
              {actions}
              <LanguageSwitcher />
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-full items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Localize i18n_default_text="Positions" />
              </Link>
              {isAuthenticated ? (
                <Button variant="outline" className="w-full justify-start" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
                  <Localize i18n_default_text="Log out" />
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => { onLogin(); setMobileMenuOpen(false); }} disabled={isAuthenticating}>
                    {isAuthenticating ? <Localize i18n_default_text="Logging in..." /> : <Localize i18n_default_text="Log in" />}
                  </Button>
                  {onSignUp && (
                    <Button className="w-full" onClick={() => { onSignUp(); setMobileMenuOpen(false); }} disabled={isAuthenticating}>
                      <Localize i18n_default_text="Sign up" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
