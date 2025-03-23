import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
