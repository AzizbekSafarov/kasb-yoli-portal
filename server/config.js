export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const demo = env.DEMO_MODE === 'true' || (!production && !env.SUPABASE_URL && env.DEMO_MODE !== 'false');
  if (production && demo) throw new Error('Production muhitida DEMO_MODE=false bo‘lishi kerak.');
  const config = { production, demo, port: Number(env.PORT || 3001), origin: env.APP_ORIGIN || 'http://localhost:3001', supabaseUrl: env.SUPABASE_URL || '', anonKey: env.SUPABASE_ANON_KEY || '', serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || '', groqKey: env.GROQ_API_KEY || '', model: env.GROQ_MODEL || 'openai/gpt-oss-120b', telegramToken: env.TELEGRAM_BOT_TOKEN || '', chatId: env.TELEGRAM_CHAT_ID || '', dbPath: env.DEMO_DB_PATH || '.data/practice.sqlite' };
  config.authReady = Boolean(config.supabaseUrl && config.anonKey);
  config.telegramReady = Boolean(!demo && config.telegramToken && config.chatId && config.serviceKey);
  if (production && (!config.authReady || !config.serviceKey)) throw new Error('Supabase URL, anon va service role kalitlarini sozlang.');
  return config;
}
