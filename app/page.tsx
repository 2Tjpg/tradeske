import type { Metadata } from 'next';
import { TradeskeLandingPage } from '@/components/landing/landing-page';

export const metadata: Metadata = {
  title: 'Tradeske — Trade Deriv Digits with Zero Charts',
  description:
    'Tradeske makes binary trading simple: predict the last digit of the exit spot. Master Over/Under, Even/Odd, and Matches/Differs with a focused Deriv trading experience.',
  openGraph: {
    title: 'Tradeske — Trade Deriv Digits with Zero Charts',
    description: 'A focused trading experience powered by Deriv. No charts, no noise — just numbers.',
    type: 'website',
  },
};

export default function HomePage() {
  return <TradeskeLandingPage />;
}
