# Sanityhuang1988pioneer

Sanity Studio project rebuilt from the table structure in
`goldshoot0720/fengbroaiappwrite`, with an additional `CronSanity` document type.

## Document Types

- `article`
- `bank`
- `commonaccount`
- `commondocument`
- `cronsanity`
- `food`
- `image`
- `landtophistory`
- `music`
- `podcast`
- `routine`
- `subscription`
- `video`

## Setup

Copy `.env.example` to `.env.local` and fill in your Sanity project values:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_HOST=sanityhuang1988pioneer
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Deploy to Sanity-managed Studio hosting:

```bash
npm run deploy
```

The hosted Studio URL will be `https://<SANITY_STUDIO_HOST>.sanity.studio`.
