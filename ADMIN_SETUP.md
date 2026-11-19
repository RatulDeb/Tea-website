# Admin panel setup

The storefront is still a demo for payments, but customer orders are now saved
to Supabase and a Telegram message is sent to the shop owner when an order
arrives.

Admin URL: `/admin`

## 1. Create the Supabase project

1. Sign in at https://supabase.com and create a new project.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. Open **Project Settings → API** and copy:
   - **Project URL** — used as `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key — used as `VITE_SUPABASE_ANON_KEY`
   - **service_role** key — used as `SUPABASE_SERVICE_ROLE_KEY` (server only)

The SQL creates the `orders` table, indexes, row-level security, an
`updated_at` trigger, and adds the table to Supabase Realtime.

## 2. Create the admin login

1. Open **Authentication → Users → Add user**.
2. Enter the owner email and a strong password. Enable **Auto Confirm User**.
3. Allow that account to manage orders by running this in **SQL Editor**
   (replace the email with the owner email):
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'owner@example.com'
   on conflict do nothing;
   ```
4. Open **Authentication → Providers → Email** and turn off **Allow new users
   to sign up** so nobody else can create an account.
5. Sign in at `/admin` with that email and password.

Only users listed in `public.admin_users` can read, update, or delete orders.
Customers can only insert a new order. If you skip step 3, sign-in succeeds but
the dashboard cannot load orders because of row-level security.

## 3. Create the Telegram bot

1. Open Telegram and message `@BotFather`.
2. Send `/newbot`, choose a name, and choose a username ending in `bot`.
3. Copy the HTTP API token and use it as `TELEGRAM_BOT_TOKEN`.
4. Open your new bot and send it any message, for example `hello`.
5. Find your numeric chat ID:
   - Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser
     and copy `chat.id` from the JSON response, or
   - message `@userinfobot` and copy the ID it returns.
6. Use that number as `TELEGRAM_CHAT_ID`.

The bot can only message you after you have started a chat with it.

## 4. Add the environment variables

Add all six variables to **Vercel → Project → Settings → Environment
Variables** for Production, Preview, and Development:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

For local development, copy `.env.example` to `.env.local` and fill in the same
values. Never put the service role key or bot token in a `VITE_` variable — those
values are shipped to the browser.

Redeploy after changing environment variables because Vite bakes the `VITE_`
values into the build.

## 5. How orders flow

1. A customer checks out with name, phone, email, address, items, and payment
   method.
2. The order is inserted into `orders`.
3. The browser calls `api/notify-order.js`.
4. The serverless function reads the order with the service role key and sends a
   Telegram message to `TELEGRAM_CHAT_ID`.
5. The function marks `notified_at` so the same order is not announced twice.
6. The owner opens `/admin` to see the order, call or email the customer, open
   the address in Google Maps, update the order status, and mark cash as
   collected.

If the Telegram call fails, the order is still saved. The admin panel shows a
**Send alerts** button for orders that have not been announced yet.

## Notes

- Card checkout is still test mode. The admin panel labels card orders as
  **Prepaid**, but no real money is charged until a real payment gateway is
  connected.
- Customer card numbers are never stored. Only the last four digits are saved.
- New orders appear in the panel automatically through Supabase Realtime. The
  **Refresh** button is there as a fallback.
- Only users in `public.admin_users` can read or change orders. Keep signups
  disabled so no one else can create an account.
- `npm run test` builds the site with whatever is in `.env.local`. If you have
  Supabase configured locally, the checkout test creates one real order. You can
  delete it from the admin panel.
- If `/admin` shows the setup screen after deployment, the `VITE_SUPABASE_*`
  variables were missing at build time. Add them and redeploy.
- If no Telegram message arrives, check the bot token, the chat ID, and that you
  have started a chat with the bot. You can also use **Send alerts** in the
  admin panel to retry.
- Order totals are calculated in the browser. That is fine for this demo store,
  but before accepting real payments, move order creation to a server-side
  function that recalculates prices from the product catalog.
