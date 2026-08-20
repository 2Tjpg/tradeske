'use client';

import { useState } from 'react';
import { Activity, LoaderCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TRADESKE_SIGNUP_URL } from '@/lib/tradeske-config';

interface LandingHeaderProps {
  onLogin: () => Promise<void>;
  isAuthenticating: boolean;
}

export function LandingHeader({ onLogin, isAuthenticating }: LandingHeaderProps) {
  const [open, setOpen] = useState(false);

  const loginLabel = isAuthenticating ? 'Connecting…' : 'Login';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/70 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Tradeske home">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400 text-emerald-950">
            <Activity className="h-5 w-5" />
          </span>
          <span className="truncate text-lg font-bold tracking-tight text-slate-50">Tradeske</span>
        </a>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-white"
            disabled={isAuthenticating}
            onClick={() => void onLogin()}
          >
            {isAuthenticating && <LoaderCircle className="animate-spin" />}
            {loginLabel}
          </Button>
          <Button asChild className="bg-emerald-400 font-semibold text-emerald-950 hover:bg-emerald-300">
            <a href={TRADESKE_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
              Sign Up
            </a>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 text-slate-100 sm:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-2 border-t border-slate-700 px-4 py-4 sm:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-white"
            disabled={isAuthenticating}
            onClick={() => void onLogin()}
          >
            {isAuthenticating && <LoaderCircle className="animate-spin" />}
            {loginLabel}
          </Button>
          <Button asChild className="w-full bg-emerald-400 font-semibold text-emerald-950 hover:bg-emerald-300">
            <a href={TRADESKE_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
              Sign Up
            </a>
          </Button>
        </div>
      )}
    </header>
  );
}
