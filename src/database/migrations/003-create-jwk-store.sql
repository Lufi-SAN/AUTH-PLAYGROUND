CREATE TABLE jwk_store(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    kid TEXT NOT NULL UNIQUE,

    private_jwk JSONB NOT NULL,
    public_jwk JSONB NOT NULL,

    status TEXT NOT NULL CHECK (status IN ('active', 'retired')),

    rotation_period TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)

CREATE UNIQUE INDEX one_active_jwk ON jwk_store(status) WHERE status = 'active';