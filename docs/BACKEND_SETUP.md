# Website backend setup (theshirtlesshandyman-api)

The website's forms, the `/book` calendar, and the chat widget used to post to
an old Emergent preview server (`design-reveal.preview.emergentagent.com`) that
now returns 404. This sets up the same backend on Ryan's own Render account.

**Cost: $0/month.** One Render *free* web service. No new paid service, no card.

## Where leads go

Every submission (quick quote form, full quote form, QR / door-hanger form,
pricing calculator, `/book` calendar, chat widget when someone types a phone or
email) is written as one new record in the **GEAUXleads Airtable → Leads**
table (`tbliTlH5mmdOjc280`):

| Leads field   | Value                                    |
|---------------|------------------------------------------|
| Leads Name    | visitor's name                           |
| Contact name / phone / email | what they typed (bad emails go in Notes only) |
| Address       | ZIP they typed                           |
| Source        | `Website`                                |
| Source URL    | https://www.theshirtlesshandyman.com     |
| Status        | `New`                                    |
| Notes         | starts with `WEBSITE LEAD — <which form>`, then project, ZIP, phone, email, notes |
| ID            | the website's lead id                    |

Email does **not** come from the API unless Resend is configured (see
below). The free alert is an Airtable automation, **"Website lead → email
Ryan"**, which emails when a Leads record's Notes contain `WEBSITE LEAD`.
It uses Airtable's built-in email, so there's no new account. It has run
successfully; confirm the toggle on that automation is On (step 4). The
API's own mailer and the Twilio texter are separate and are off until their
env vars are set.

If the API ever fails, the visitor's form shows a **Text it to Ryan** button
with their info already filled in, so the lead still reaches Ryan's phone.

The visitor always gets a success response. If Airtable is down or
`AIRTABLE_API_KEY` is missing, the API logs the lead at error level (name,
phone, email, which form — never the token) and keeps it in an in-memory
retry queue with backoff for as long as this process stays up. A restart
clears that queue; the error log is what is left. If Airtable rejects a
field (say a column gets renamed), it makes one fallback write with just
the name and notes, then queues that lead too if the fallback fails.

## Steps only Ryan can do (about 10 minutes)

1. **Create the service on Render (free).**
   Render dashboard → **New → Blueprint** → pick the `the-shirtless-handyman`
   repo → Render reads `render.yaml` and shows **one** new service,
   `theshirtlesshandyman-api`, plan **Free**. If it shows any other change,
   cancel and use the manual path below.
   *Manual path:* **New → Web Service** → this repo → Name
   `theshirtlesshandyman-api` → Root Directory `backend` → Runtime Python →
   Build `pip install -r requirements-render.txt` → Start
   `uvicorn server:app --host 0.0.0.0 --port $PORT` → Instance type **Free** →
   Health check path `/api/health`.
2. **Fill in the secret env vars** it asks for (Render → the new service →
   Environment):
   - `AIRTABLE_API_KEY`: copy the value from the GEAUXleads backend service's
     Environment tab in Render (same token). Don't paste it in chat or GitHub.
   - `ADMIN_PASSWORD`: anything you like, for `/admin` on the website.
   - `MONGO_URL`: leave blank for now (see "Optional" below).
   - If you used the manual path, also add `CORS_ORIGINS` =
     `https://www.theshirtlesshandyman.com,https://theshirtlesshandyman.com`
     and `PYTHON_VERSION` = `3.13.5`.
3. **Point the website at it.** Render → the **static site** that serves
   www.theshirtlesshandyman.com → Environment → set
   `REACT_APP_BACKEND_URL` = `https://theshirtlesshandyman-api.onrender.com`
   (or delete the variable if it's set to the old emergentagent.com URL; the
   code now defaults to the new address). Then **Manual Deploy → Clear build
   cache & deploy**. If Render gave the API a different URL (it adds a suffix
   when a name is taken), use that URL here.
4. **Turn on the email alert** if the toggle is off. Open
   https://airtable.com/appuyAHSSzJrPWlec/wflMBEtIdcW7yv6ED → review →
   toggle **On**. (Airtable's free plan includes a monthly number of
   automation runs; one run per website lead.) This is the free way Ryan
   gets mail. It does not need `RESEND_API_KEY`. The live API reports
   `"email": false` until the Resend vars below are set; that flag is the
   API mailer, not this automation.
5. **Check it.** Visit
   `https://theshirtlesshandyman-api.onrender.com/api/health`. You should see
   `"ok": true` and `"airtable": true`. Then submit the quick quote form on
   the site with your own name + "TEST" and confirm it shows up in Airtable
   (and in your email once step 4 is on). Delete the TEST record afterwards.

## Good to know

- **Free instance sleep.** Render's free web services sleep after ~15 idle
  minutes and take up to a minute to wake. The website pings `/api/health`
  as soon as any page loads, so it's usually awake before a visitor finishes
  typing. If it isn't, the form's **Text it to Ryan** button catches the lead.
  Switching just this service to **Starter ($7/month)** removes the sleep;
  only worth it once leads are flowing.
- **In-memory database.** With `MONGO_URL` blank, the API still works, but the
  `/admin` inbox history, booked calendar slots, chat history, and scheduled
  follow-up emails reset whenever the server restarts or sleeps, unless
  `AIRTABLE_STORE_TABLE` is set (that snapshot is separate and optional).
  Every lead is still written to the GEAUXleads Leads table, which is the
  permanent record.

## Optional upgrades (each needs Ryan's OK)

- **Permanent storage, $0:** create a free MongoDB Atlas M0 cluster
  (mongodb.com/atlas, free signup, no card needed for M0), copy its
  connection string into `MONGO_URL`. That keeps booked slots, so two people
  can't book the same time across restarts.
- **Email from the API, and SMS:** both are off on the live service.
  Health reports `"email": false` because `RESEND_API_KEY` and
  `LEAD_NOTIFICATION_EMAIL` are unset, so `send_lead_email` logs a warning
  and skips. Health reports `"sms": false` because Twilio is unset
  (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`,
  `LEAD_NOTIFICATION_PHONE`); Twilio is pay-per-text and needs A2P 10DLC,
  so leave it unset. To email from the API as well as the Airtable
  automation, set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
  `LEAD_NOTIFICATION_EMAIL` on the Render service (Resend's free tier;
  needs a Resend account and a DNS record, or Resend's onboarding sender
  which only delivers to the account owner). Do not put those values in git.
- **AI chat replies:** set `OPENAI_API_KEY` (pay-per-use, pennies per chat).
  Without it the chat widget gives a friendly scripted reply that points to
  your phone and `/book` and still captures any phone/email typed in.
- **AI Seamless Studio (`/upload`)** needs the old Emergent key
  (`EMERGENT_LLM_KEY` + the `emergentintegrations` package), which isn't
  available off Emergent. It stays off for now.
