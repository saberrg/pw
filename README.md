# Saber Garibi personal site

This Next.js application publishes book notes and includes authenticated writing, library, PDF, and account features backed by Supabase.

## Requirements

Use Node.js 24.19.0 and npm.

## Environment variables

Create `.env.local` with the following variables.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Local development

```bash
npm ci
npm run dev
```

Run the repository checks before deployment.

```bash
npm run typecheck
npm run lint
npm run build
```

## Cloudflare Workers

Build and run the Worker locally with the production runtime.

```bash
npm run preview
```

Build the Worker artifact without starting a server.

```bash
npm run cf:build
```

Deploy after Cloudflare secrets and custom domains have been configured.

```bash
npm run deploy
```

The application intentionally retains `src/middleware.ts` because OpenNext 1.20.2 does not support the Node.js runtime used by the Next.js 16 `proxy.ts` convention. Remove this compatibility constraint after OpenNext supports Node.js proxy execution.
