# AutoAudit (MVP)

This is a simple MVP web app for AutoAudit:
- User enters vehicle details
- App generates a free "snapshot" (exposure range + risk level)
- User pays via Stripe to unlock the full report

## What you need before you start
- A computer (Windows/Mac)
- Internet
- 3 free accounts:
  1) GitHub
  2) Supabase
  3) Stripe
- Node.js installed

---

# Step-by-step setup (novice friendly)

## A) Download + install Node.js
1. Go to https://nodejs.org
2. Download the **LTS** version
3. Install it

## B) Create a new GitHub repo
1. Go to https://github.com
2. Click **New**
3. Repository name: `autoaudit`
4. Make it **Public** (or Private if you prefer)
5. Click **Create repository**

## C) Put these files on your computer
1. Unzip this project somewhere easy, e.g. your Desktop
2. You should have a folder called `autoaudit`

## D) Install the project dependencies
1. Open a Terminal:
   - Windows: search for **Command Prompt** or **PowerShell**
   - Mac: open **Terminal**
2. Go into the folder:
   - Example (Mac): `cd ~/Desktop/autoaudit`
3. Run:
   ```bash
   npm install
   ```

## E) Create Supabase database
1. Go to https://supabase.com and create an account
2. Click **New project**
3. Give it a name: `autoaudit`
4. Create the project (wait 1-2 minutes)
5. In Supabase, go to **SQL Editor**
6. Click **New query**
7. Open `supabase/schema.sql` from this repo, copy everything, paste it into Supabase, click **Run**

### Get your Supabase keys
1. In Supabase: **Project Settings → API**
2. Copy:
   - **Project URL**
   - **anon public key**
   - **service_role key** (keep secret)

## F) Create Stripe product + webhooks
1. Go to https://stripe.com and create an account
2. In Stripe Dashboard, switch to **Test mode**
3. Go to **Products → Add product**
4. Name: `AutoAudit Detailed Report`
5. Price: `£3.99` (one-time)
6. Save
7. Copy the **Price ID** (starts with `price_...`)

### Create a Stripe webhook endpoint
You do this after you deploy to Vercel (Step H), because you need the live URL.

## G) Create your local environment file (.env.local)
1. In the `autoaudit` folder, create a file called `.env.local`
2. Copy/paste this and fill in values:

```bash
NEXT_PUBLIC_SUPABASE_URL=PASTE_SUPABASE_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_SUPABASE_SERVICE_ROLE_KEY_HERE

STRIPE_SECRET_KEY=PASTE_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=PASTE_STRIPE_WEBHOOK_SECRET_HERE
STRIPE_PRICE_ID=PASTE_STRIPE_PRICE_ID_HERE

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Where to find Stripe keys
Stripe Dashboard → **Developers → API keys**
- Secret key starts with `sk_test_...`

## H) Run the app on your computer (local)
In the project folder run:
```bash
npm run dev
```

Open:
http://localhost:3000

## I) Add your logo
1. Save your chosen logo image as:
   `public/logo.png`
2. Refresh the page

## J) Put the project on GitHub (push code)
In your terminal, inside the project folder:

```bash
git init
git add .
git commit -m "AutoAudit MVP"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/autoaudit.git
git push -u origin main
```

(Replace YOUR_GITHUB_USERNAME with your username.)

If git asks you to login:
- Follow the prompts, or install GitHub Desktop.

## K) Deploy to Vercel (so Stripe webhook can work)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New → Project**
4. Pick your `autoaudit` repo
5. In **Environment Variables**, add everything from `.env.local`
   - NOTE: Set `NEXT_PUBLIC_APP_URL` to your Vercel URL, e.g. `https://autoaudit.vercel.app`
6. Click **Deploy**

## L) Create Stripe webhook (now that you have a live URL)
1. Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL:
   `https://YOUR_VERCEL_URL/api/stripe-webhook`
4. Events to send:
   `checkout.session.completed`
5. Click **Add endpoint**
6. Stripe shows a **Signing secret** (`whsec_...`)
7. Copy it and set it in Vercel:
   - Env var `STRIPE_WEBHOOK_SECRET=whsec_...`
8. Redeploy (Vercel will do it automatically after env changes)

## M) Test payments (Stripe test mode)
1. Create a report (Start a check → Generate snapshot)
2. Click **Unlock full report**
3. Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Any future date
   - Any CVC
4. After payment, Stripe should hit your webhook and unlock the report.

---

# Common beginner problems

## "Logo not showing"
- Make sure the file is exactly:
  `public/logo.png`

## "Missing env var"
- Check `.env.local` exists
- Restart `npm run dev`

## "Webhook signature verification failed"
- Make sure Vercel env `STRIPE_WEBHOOK_SECRET` matches Stripe webhook signing secret
- Make sure the webhook URL in Stripe is correct

---

# MVP security note (important)
For MVP we disable Row Level Security (RLS) on `reports` to keep things simple.
Before going big:
- Enable RLS
- Add user accounts
- Restrict who can read reports

This is normal for early validation.
