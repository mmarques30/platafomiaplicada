# Project rules

- The backend URL and publishable key are pinned in `vite.config.ts` `define`, not read from env — the host injects stale `VITE_SUPABASE_*` env vars that override `.env`.
