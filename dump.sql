CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS affirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    user_name TEXT;
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);
