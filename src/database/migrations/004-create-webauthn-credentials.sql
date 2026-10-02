CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id BYTEA NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX webauthn_credentials_user_id_idx ON webauthn_credentials(user_id, credential_id);

CREATE OR REPLACE FUNCTION update_webauthn_credentials_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER a_update_webauthn_credentials_updated_at
BEFORE UPDATE ON webauthn_credentials
FOR EACH ROW
EXECUTE FUNCTION update_webauthn_credentials_updated_at_column();