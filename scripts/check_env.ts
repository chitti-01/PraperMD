console.log('Checking environment variables for DB access:');
console.log('SUPABASE_ACCESS_TOKEN present:', Boolean(process.env.SUPABASE_ACCESS_TOKEN));
console.log('DATABASE_URL present:', Boolean(process.env.DATABASE_URL));
console.log('POSTGRES_URL present:', Boolean(process.env.POSTGRES_URL));
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY present:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));
