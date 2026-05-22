CREATE TABLE pending_email_changes (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	email TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT pending_email_changes_user_id_unique_constraint UNIQUE(user_id)
);
CREATE UNIQUE INDEX pending_email_changes_email_unique_idx 
ON pending_email_changes(LOWER(email));