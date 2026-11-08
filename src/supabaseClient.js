import { createClient } from '@supabase/supabase-js'

// A chave "publishable" e publica por definicao: quem protege os dados sao as
// regras de seguranca (RLS) e as funcoes configuradas no banco do Supabase.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
)
