import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

export default supabase;