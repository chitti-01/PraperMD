const fs = require('fs');
const https = require('https');

const envFile = fs.readFileSync('e:/medico/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2 && !line.startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connection to:', supabaseUrl);

const req = https.request(`${supabaseUrl}/rest/v1/colleges?select=*`, {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('DATA:', data);
  });
});

req.on('error', (err) => {
  console.error('HTTPS REQ ERROR:', err);
});

req.end();
