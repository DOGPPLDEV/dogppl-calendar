# DOG PPL Content Calendar

Real-time collaborative content calendar for DOG PPL social media planning.

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
CREATE TABLE calendar_state (
  id integer PRIMARY KEY DEFAULT 1,
  placements jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO calendar_state (id, placements) VALUES (1, '{}');

ALTER TABLE calendar_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON calendar_state FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE calendar_state;
```

3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key

### 2. Vercel

1. Push this repo to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Deploy

### 3. Custom domain

In Vercel → Domains, add `calendar.dogppl.com`.
At your DNS registrar, add a CNAME record:
- Name: `calendar`
- Value: `cname.vercel-dns.com`

## Local development

```bash
cp .env.example .env
# Fill in your Supabase keys
npm install
npm run dev
```
