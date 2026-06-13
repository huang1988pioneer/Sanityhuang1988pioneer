# Sanityhuang1988pioneer

Next.js + Appwrite table setup utility, structured after
`goldshoot0720/fengbroaiappwrite`.

## Tables

- `cronsanity`: cron job sanity/health table.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_API_KEY=your_api_key
```

## Usage

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Create the CronSanity table:

```bash
curl "http://localhost:3000/api/create-table?table=cronsanity"
```

Check database stats:

```bash
curl "http://localhost:3000/api/database-stats"
```
