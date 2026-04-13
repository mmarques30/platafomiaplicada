const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').filter(Boolean);

// Fallback origins when env var is not set
const DEFAULT_ORIGINS = [
  'https://platafomiaplicada.lovable.app',
  'https://ocwpsanqtfubixerjive.supabase.co',
];

const origins = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : DEFAULT_ORIGINS;

export function getCorsHeaders(req: Request) {
  const requestOrigin = req.headers.get('Origin') || '';
  const allowedOrigin = origins.includes(requestOrigin) ? requestOrigin : origins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  };
}

// Backwards-compatible static export for functions that haven't migrated yet
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}
