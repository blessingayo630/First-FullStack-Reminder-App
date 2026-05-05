# Investigation: Build Error - "supabaseUrl is required"

## Bug Summary
The Vercel build fails with the error `Error: supabaseUrl is required.` during the collection of page data for `/api/cron`. This indicates that the Supabase client initialization is failing during the static analysis/build phase because the required environment variables are not available or are undefined.

## Root Cause Analysis
The issue is caused by top-level module evaluation in `lib/supabase.ts` and `lib/supabase-server.ts`. 

In `lib/supabase-server.ts`:
```typescript
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
```

When `app/api/cron/route.ts` imports `supabaseServer`, the module `lib/supabase-server.ts` is evaluated. If `process.env.SUPABASE_URL` is undefined (which is common during the build phase for private environment variables), `createClient` is called with `undefined`, which throws the "supabaseUrl is required" error.

Next.js tries to statically analyze or pre-render routes during build. Even for API routes, it may attempt to evaluate the module to determine its configuration.

## Affected Components
- `lib/supabase.ts`: Top-level initialization of the public Supabase client.
- `lib/supabase-server.ts`: Top-level initialization of the server-side Supabase client.
- `app/api/cron/route.ts`: Imports `supabaseServer` at the top level.
- Other API routes in `app/api/reminders/` that import these clients.

## Proposed Solution

### 1. Lazy Initialization
Refactor `lib/supabase.ts` and `lib/supabase-server.ts` to export functions that initialize the client on demand, or use a getter pattern to ensure `createClient` is only called when the client is actually needed at runtime.

**Example for `lib/supabase-server.ts`:**
```typescript
let supabaseServerInstance: any = null;

export const getSupabaseServer = () => {
  if (supabaseServerInstance) return supabaseServerInstance;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing');
  }
  
  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseServerInstance;
};
```

### 2. Mark Routes as Dynamic
Add `export const dynamic = 'force-dynamic';` to API routes that rely on these environment variables to explicitly tell Next.js not to attempt static generation or pre-rendering during the build.

### 3. Update Consumers
Update `app/api/cron/route.ts` and other routes to use the new initialization function.

## Recommendations
- Implement lazy initialization in both `lib/supabase.ts` and `lib/supabase-server.ts`.
- Ensure all API routes that use Supabase are marked as dynamic if they aren't already.
- Verify that environment variables are correctly set in the Vercel dashboard for both Build and Runtime environments.
