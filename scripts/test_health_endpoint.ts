import { GET } from '../app/api/health/route';

async function testHealthEndpoint() {
  console.log('Testing /api/health endpoint response...');
  const response = await GET();
  const json = await response.json();
  console.log('HTTP Status:', response.status);
  console.log('Health JSON payload:', JSON.stringify(json, null, 2));
}

testHealthEndpoint().catch(console.error);
