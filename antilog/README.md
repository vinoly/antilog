# antilog
*two sides to every truth*

## Deploy to Vercel

1. Go to vercel.com → sign in with GitHub
2. Click "Add New Project" → "Upload" (drag the antilog folder)
3. In the project settings, add these Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click Deploy

## After deploying

1. Copy your new Vercel URL (e.g. https://antilog.vercel.app)
2. In Google Cloud Console → Clients → antilog → add your Vercel URL to Authorized redirect URIs
3. In Supabase → Authentication → URL Configuration → add your Vercel URL to Site URL and Redirect URLs
4. Google sign-in will now work end to end

## Local development

```bash
npm install
npm run dev
```
