'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  Gauge,
  GraduationCap,
  LineChart,
  Link2,
  LoaderCircle,
  ShieldCheck,
  Wallet,
  Zap,
} from 'lucide-react';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/landing/header';
import { ReviewMarquee } from '@/components/landing/review-marquee';
import { Typewriter } from '@/components/landing/typewriter';
import { TRADESKE_SIGNUP_URL } from '@/lib/tradeske-config';

const STEPS = [
  { icon: Link2, title: 'Connect', text: 'Create and link your Deriv account.' },
  {
    icon: Wallet,
    title: 'Fund',
    text: 'Load your trading capital directly inside your Deriv wallet.',
  },
  {
    icon: GraduationCap,
    title: 'Learning',
    text: 'Get trained on smart digit trading strategy.',
  },
  {
    icon: Gauge,
    title: 'Trade',
    text: 'Use our app to spot patterns and execute digit trades instantly.',
  },
  {
    icon: ArrowDownToLine,
    title: 'Withdraw',
    text: 'Head back to Deriv anytime to withdraw your profits.',
  },
] as const;

export function TradeskeLandingPage() {
  const router = useRouter();
  const { auth } = useDerivWSContext();
  const { authState, login } = auth;
  const isAuthenticating = authState === 'authenticating';

  useEffect(() => {
    if (authState === 'authenticated') {
      router.replace('/trade');
    }
  }, [authState, router]);

  if (authState === 'authenticated') {
    return (
      <main className="tradeske-landing grid min-h-dvh place-items-center bg-slate-950 text-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-400" />
          Opening your trading dashboard…
        </div>
      </main>
    );
  }

  return (
    <main id="top" className="tradeske-landing min-h-dvh overflow-x-hidden bg-slate-950 text-slate-50">
      <LandingHeader
        onLogin={login}
        signUpUrl={TRADESKE_SIGNUP_URL}
        isAuthenticating={isAuthenticating}
      />

      <section className="tradeske-grid-glow relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3.5 py-1.5 text-xs font-medium text-slate-400">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Digit trading, stripped to the essentials
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-50 sm:text-6xl">
            Trade Deriv Digits
            <br />
            <span className="relative inline-block">
              <span className="invisible" aria-hidden="true">
                Real-Time Speed
              </span>
              <span className="absolute left-0 top-0 whitespace-nowrap">
                <Typewriter />
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Tradeske makes binary trading simple: just predict the last digit of the exit spot. Built
            as a trusted analysis tool, we provide a strategic way to master Over/Under, Even/Odd,
            and Matches/Differs. Spot patterns in real time and execute instantly.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="tradeske-glow bg-emerald-400 px-7 text-base font-semibold text-emerald-950 hover:bg-emerald-300"
            >
              <a href={TRADESKE_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
                Get Started
              </a>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="border-slate-700 bg-transparent px-7 text-base text-slate-100 hover:bg-slate-800 hover:text-white"
              disabled={isAuthenticating}
              onClick={() => void login()}
            >
              {isAuthenticating && <LoaderCircle className="animate-spin" />}
              {isAuthenticating ? 'Connecting…' : 'Login to App'}
            </Button>
          </div>

          <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-slate-400">
            New users sign up through our official Deriv partner link. After registration, return here
            and select Login to App.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="mx-auto max-w-2xl text-center text-2xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          A focused trading experience powered by Deriv
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="tradeske-surface-card rounded-2xl p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-slate-400">
              <LineChart className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-slate-50">Standard Trading</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Avoid the long hassle. Standard platforms are built for everything, which means
              navigating complex charts, overwhelming indicators, and a steep learning curve just to
              trade digits.
            </p>
          </div>

          <div className="tradeske-surface-card tradeske-glow rounded-2xl p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400 text-emerald-950">
              <Zap className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-emerald-400">Tradeske</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-100/90">
              Focus specifically on what you are looking for. We stripped away the noise so you can
              focus entirely on pure digits. Faster execution, easier interface, all safely powered
              by your Deriv account.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Your journey from setup to profit
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <div key={step.title} className="tradeske-surface-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-400">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-3xl font-black text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <h2 className="px-4 text-center text-2xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          What early users are saying
        </h2>
        <div className="mt-10">
          <ReviewMarquee />
        </div>
      </section>

      <section className="tradeske-grid-glow border-t border-slate-800">
        <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Ready to simplify your digit strategy?
          </h2>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="tradeske-glow bg-emerald-400 px-9 py-6 text-base font-semibold text-emerald-950 hover:bg-emerald-300"
            >
              <a href={TRADESKE_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
                Let's Get Started
              </a>
            </Button>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            Powered by Deriv. Your funds are only accessible by you on your Deriv wallet.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-slate-400">
            Trading involves risk. Digit contracts are complex instruments and you may lose all of
            your invested capital. Tradeske is an independent third-party application and is not
            affiliated with or endorsed by Deriv. Only trade with money you can afford to lose.
          </p>
          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Tradeske. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
