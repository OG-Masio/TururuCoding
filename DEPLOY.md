# Putting TururuCoding online

Three parts, in this order. Parts 1 and 2 give two IDs that go into `wrangler.toml`; part 3 publishes the site.

## 1. Google sign-in: get a Client ID

If ChunChunDraw already uses Google sign-in, you can reuse its Google Cloud project and its client: just add the TururuCoding addresses in step 4.

1. Open [console.cloud.google.com](https://console.cloud.google.com) and pick a project (or create one called `TururuCoding`).
2. Go to **APIs & Services > Credentials** (it may be called **Google Auth Platform > Clients**).
3. Click **Create credentials > OAuth client ID** and choose **Web application**.
   - If Google asks you to set up the consent screen first: app name `TururuCoding`, your email, audience **External**. Then either add your own Gmail under **Test users**, or click **Publish app**. Only basic sign-in is used, so publishing needs no review.
4. Under **Authorized JavaScript origins**, add:
   - `https://tururucoding.pages.dev`
   - `http://localhost:8788` (for running it on your computer)
5. Leave redirect URIs empty, click **Create**, and copy the **Client ID**. It ends in `.apps.googleusercontent.com`. It's safe to share; it isn't a password.

## 2. Cloudflare: create the database

1. Open [dash.cloudflare.com](https://dash.cloudflare.com) with the same account as ChunChunDraw.
2. Go to **Storage & databases > D1 SQL database** and click **Create**.
3. Name it `tururucoding` and click **Create**.
4. Copy the **Database ID** shown on its page.

You don't need to create tables; the site does that by itself the first time it runs.

Put both IDs in `wrangler.toml` (`GOOGLE_CLIENT_ID` and `database_id`) and commit.

## 3. Cloudflare: publish the site from GitHub

1. In the Cloudflare dashboard, go to **Workers & Pages** and click **Create**.
2. Choose **Pages** (not Workers), then **Import an existing Git repository**.
3. Connect GitHub if asked, and pick the **TururuCoding** repository.
4. Project name: `tururucoding`. Production branch: `main`.
5. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Click **Save and Deploy**.

After a minute or two the site is at `https://tururucoding.pages.dev`. Every push to `main` redeploys it automatically.

If Cloudflare gives a different address (for example when the name is taken), add that address to the Google **Authorized JavaScript origins** too.

## Who can sign in

Only the Google accounts listed in `ALLOWED_EMAIL_SHA256` in `wrangler.toml` can sign in. Each entry is the SHA-256 "fingerprint" of a lowercase email address, so the address itself never appears in this public repository. To allow another account, add its fingerprint, separated by a comma:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('someone@gmail.com').digest('hex'))"
```

Leave it empty (`""`) to let any Google account sign in.
