# Tradeske

A Next.js digit trading application built on the Deriv WebSocket API. It includes a public marketing page, Deriv OAuth authentication, real-time tick streaming, digit statistics, Matches/Differs, Over/Under, Even/Odd contracts, and trade reports.

## Prerequisites

- Node.js 20.9 or later (required by Next.js 16)
- A Deriv application registered in the [Deriv developer dashboard](https://developers.deriv.com/dashboard/)

## Step 1: Register Your App ID

1. Navigate to [App Registration](https://developers.deriv.com/dashboard/) and register a new OAuth application.
2. Set the **Redirect URI** to the exact origin where Tradeske is hosted, such as `http://localhost:3000` for local development or `https://your-domain.vercel.app` for production.
3. Enable the scopes used by the app and copy the generated App ID.

## Step 2: Configure environment variables

Copy `.env.example` to `.env.local` on Windows and fill in your values:

```bat
copy .env.example .env.local
```

Do not commit `.env.local`, `.env.production`, or other deployment-specific environment files. Add production values in **Vercel Project Settings > Environment Variables**.

Edit `.env.local`:

```env
NEXT_PUBLIC_DERIV_APP_ID=your_app_id_here
NEXT_PUBLIC_DERIV_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_DERIV_APP_NAME=Tradeske
NEXT_PUBLIC_DERIV_SHOW_APP_NAME=true
NEXT_PUBLIC_DERIV_REFERRAL_LINK=https://deriv.com/signup/
NEXT_PUBLIC_DERIV_OAUTH_SCOPES=trade
NEXT_PUBLIC_DERIV_ENV=production
NEXT_PUBLIC_FONT_FAMILY=Inter
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_DERIV_APP_ID` | Your Deriv app ID from the App Registration dashboard |
| `NEXT_PUBLIC_DERIV_REDIRECT_URI` | OAuth redirect URI — must exactly match the URI registered in your Deriv app |
| `NEXT_PUBLIC_DERIV_APP_NAME` | In-app display name (header, tab title, favicon). Set in App Builder Customise. OAuth/consent registration name is configured separately and is not this env var. |
| `NEXT_PUBLIC_DERIV_SHOW_APP_NAME` | `true` (default) shows the name next to the logo on desktop; `false` hides it (logo only). Tab title / favicon still use `NEXT_PUBLIC_DERIV_APP_NAME`. |
| `NEXT_PUBLIC_DERIV_REFERRAL_LINK` | Affiliate referral link used by marketing sign-up CTAs (optional) |
| `NEXT_PUBLIC_DERIV_OAUTH_SCOPES` | Comma-separated OAuth scopes (for example, `trade`) |
| `NEXT_PUBLIC_DERIV_ENV` | `production` to connect to live Deriv endpoints; `preview` for staging |
| `NEXT_PUBLIC_FONT_FAMILY` | Supported application font family; defaults to `Inter` |
| `NEXT_PUBLIC_BASE_PATH` | Optional URL sub-path; normally blank on Vercel |

Next.js loads `.env.local` automatically. Every `NEXT_PUBLIC_*` value is bundled into browser code and must not be treated as a server-side secret. The OAuth redirect URI must exactly match the URI registered in Deriv, including scheme and subdomain.

## Step 3: Local Development

```bash
npm install
npm run dev
```

The app is available at `http://localhost:3000`.

## Step 4: Deploy to Vercel

1. Push the repository to GitHub, including `package-lock.json` and `.env.example`.
2. Import the repository into Vercel. Keep the framework preset as **Next.js** and the root directory as the repository root.
3. Add the required `NEXT_PUBLIC_*` values for the Production environment in Vercel.
4. Set `NEXT_PUBLIC_DERIV_REDIRECT_URI` to the final production URL and register that exact URL in the Deriv application dashboard.
5. Deploy using Vercel's default install and build commands.

This is a standard Next.js deployment. It does not use `output: 'export'` and does not generate an `/out` directory.

## Production validation

```bash
npm run build
npm run start
```

After deployment, verify `/`, `/trade`, `/reports`, the Deriv OAuth callback, live tick streaming, and a demo-account trade flow before enabling real-money use.
