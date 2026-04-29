import { createBrowserClient } from "@supabase/ssr";

type ClientOptions = {
  persistSession?: boolean;
};

export function createClient(options?: ClientOptions) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: options?.persistSession ?? true,
      },
    }
  );
}
