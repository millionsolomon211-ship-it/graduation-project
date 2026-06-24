const { Client } = require('pg');

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1q2w3e4r5t',
  };
  const dbName = process.env.DB_NAME || 'public_portal';

  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${dbName}`);
    console.log(`Created database: ${dbName}`);
  }
  await admin.end();

  const db = new Client({ ...config, database: dbName });
  await db.connect();
  await db.query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      keycloak_user_id VARCHAR(64) NOT NULL,
      email            VARCHAR(255) NOT NULL,
      otp_hash         VARCHAR(64) NOT NULL,
      purpose          VARCHAR(32) NOT NULL CHECK (purpose IN ('email_verify', 'password_reset')),
      expires_at       TIMESTAMPTZ NOT NULL,
      used_at          TIMESTAMPTZ,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_otp_active
      ON otp_codes (keycloak_user_id, purpose) WHERE used_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_otp_email_purpose
      ON otp_codes (email, purpose) WHERE used_at IS NULL;
  `);
  await db.end();
  console.log('OTP tables ready.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
