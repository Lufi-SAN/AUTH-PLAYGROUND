CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	
	username TEXT NOT NULL CHECK(char_length(username) >= 3),
	email TEXT NOT NULL,
	
	password_hash TEXT NOT NULL,

	is_verified BOOLEAN NOT NULL DEFAULT false,

	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now() 
);

CREATE UNIQUE INDEX users_username_unique_idx
ON users (LOWER(username));

CREATE UNIQUE INDEX users_email_unique_idx
ON users (LOWER(email));

CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS 
$$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER a_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();