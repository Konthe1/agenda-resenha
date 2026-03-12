import { createClient } from '@supabase/supabase-js';

// Cliente Supabase que utiliza a SERVICE ROLE KEY
// NUNCA exiba essa chave pro frontend e NÃO chame isso do lado do cliente.
// Usado em Webhooks ou CronJobs onde precisamos bypassar o RLS do Postgres.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
