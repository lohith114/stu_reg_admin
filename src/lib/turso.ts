import { createClient } from '@libsql/client';

console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN);

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  throw new Error('TURSO_DATABASE_URL and/or TURSO_AUTH_TOKEN are undefined in .env.local');
}

export const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});