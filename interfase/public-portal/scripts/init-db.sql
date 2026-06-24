-- Run once: psql -U postgres -f scripts/init-db.sql
CREATE DATABASE public_portal;

\c public_portal

CREATE TABLE IF NOT EXISTS otp_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_user_id VARCHAR(64) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  otp_hash      VARCHAR(64) NOT NULL,
  purpose       VARCHAR(32) NOT NULL CHECK (purpose IN ('email_verify', 'password_reset')),
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_active
  ON otp_codes (keycloak_user_id, purpose)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_otp_email_purpose
  ON otp_codes (email, purpose)
  WHERE used_at IS NULL;
