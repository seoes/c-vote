-- Church Vote Database Schema
-- For local development with SQLite

-- Members 테이블
CREATE TABLE IF NOT EXISTS members (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	phone TEXT NOT NULL UNIQUE,
	password_hash TEXT, -- NULL 허용 (후보자 계정)
	church TEXT NOT NULL,
	region TEXT NOT NULL,
	sigchal TEXT NOT NULL,
	position TEXT,
	security_answer TEXT,
	status TEXT NOT NULL DEFAULT 'pending',
	is_admin INTEGER NOT NULL DEFAULT 0,
	can_vote INTEGER NOT NULL DEFAULT 1,
	created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS members_phone_idx ON members(phone);
CREATE INDEX IF NOT EXISTS members_status_idx ON members(status);

-- Votes 테이블
CREATE TABLE IF NOT EXISTS votes (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	description TEXT,
	vote_type TEXT NOT NULL,
	max_selections INTEGER NOT NULL DEFAULT 1,
	result_display_count INTEGER NOT NULL DEFAULT 10,
	pin TEXT NOT NULL,
	end_time INTEGER NOT NULL,
	status TEXT NOT NULL DEFAULT 'active',
	created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS votes_status_idx ON votes(status);
CREATE INDEX IF NOT EXISTS votes_type_idx ON votes(vote_type);

-- Candidates 테이블
CREATE TABLE IF NOT EXISTS candidates (
	id TEXT PRIMARY KEY,
	vote_id TEXT NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
	member_id TEXT,
	name TEXT NOT NULL,
	church TEXT,
	`order` INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS candidates_vote_idx ON candidates(vote_id);

-- Vote Records 테이블
CREATE TABLE IF NOT EXISTS vote_records (
	id TEXT PRIMARY KEY,
	vote_id TEXT NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
	member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
	voted_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS vote_records_vote_idx ON vote_records(vote_id);
CREATE INDEX IF NOT EXISTS vote_records_member_idx ON vote_records(member_id);
CREATE UNIQUE INDEX IF NOT EXISTS vote_records_vote_member_idx ON vote_records(vote_id, member_id);

-- Vote Selections 테이블
CREATE TABLE IF NOT EXISTS vote_selections (
	id TEXT PRIMARY KEY,
	record_id TEXT NOT NULL REFERENCES vote_records(id) ON DELETE CASCADE,
	candidate_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS vote_selections_record_idx ON vote_selections(record_id);
CREATE INDEX IF NOT EXISTS vote_selections_candidate_idx ON vote_selections(candidate_id);

-- Refresh Tokens 테이블
CREATE TABLE IF NOT EXISTS refresh_tokens (
	id TEXT PRIMARY KEY,
	member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
	token TEXT NOT NULL,
	expires_at INTEGER NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS refresh_tokens_token_idx ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS refresh_tokens_member_idx ON refresh_tokens(member_id);
