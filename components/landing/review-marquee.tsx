interface Review {
  quote: string;
  name: string;
  label: string;
}

const REVIEWS: Review[] = [
  {
    quote:
      'Seeing the digits changing and moving in real-time gives me a massive advantage. It makes predicting the next digit so much easier compared to staring at static numbers.',
    name: 'Brian K.',
    label: 'Early Trader',
  },
  {
    quote:
      "I love that I don't have to look at candlestick charts anymore. It's just me, the digits, and my instincts for predictions.",
    name: 'Amina O.',
    label: 'Early Trader',
  },
  {
    quote:
      'Connecting my Deriv account was seamless. I deposit and withdraw on Deriv, but trade here for the speed and simplicity.',
    name: 'Daniel M.',
    label: 'Early Trader',
  },
];

function ReviewCard({ quote, name, label }: Review) {
  return (
    <figure className="tradeske-surface-card w-[300px] shrink-0 rounded-2xl p-6 sm:w-[380px]">
      <blockquote className="text-sm leading-relaxed text-slate-100/90">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 text-sm">
        <span className="font-semibold text-slate-50">{name}</span>
        <span className="text-slate-400"> · {label}</span>
      </figcaption>
    </figure>
  );
}

export function ReviewMarquee() {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="tradeske-marquee flex w-max gap-5 hover:[animation-play-state:paused]">
        {[...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, index) => (
          <ReviewCard
            key={`${review.name}-${index}`}
            quote={review.quote}
            name={review.name}
            label={review.label}
          />
        ))}
      </div>
    </div>
  );
}
