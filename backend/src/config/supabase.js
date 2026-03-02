import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const supabaseAdminKey = config.supabaseServiceRoleKey || config.supabaseKey;

if (!supabaseAdminKey) {
	console.warn('Supabase key is not configured. Storage uploads will fail.');
}

if (supabaseAdminKey && String(supabaseAdminKey).startsWith('sb_publishable_')) {
	console.warn('Using a publishable Supabase key on backend. Use SUPABASE_SERVICE_ROLE_KEY for storage uploads.');
}

const supabase = createClient(config.supabaseUrl, supabaseAdminKey);

export default supabase;