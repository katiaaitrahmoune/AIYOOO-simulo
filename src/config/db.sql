-- Colle ça dans le SQL editor de Neon

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(30)  UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(10)  DEFAULT 'user' CHECK (role IN ('user','admin')),
  xp          INTEGER      DEFAULT 0,
  level       INTEGER      DEFAULT 1,
  wins        INTEGER      DEFAULT 0,
  losses      INTEGER      DEFAULT 0,
  rank_title  VARCHAR(50)  DEFAULT 'Rookie',
  avatar_url  VARCHAR(500),
  created_at  TIMESTAMP    DEFAULT NOW(),
  updated_at  TIMESTAMP    DEFAULT NOW()
);

-- Refresh tokens table (pour JWT rotation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  difficulty   VARCHAR(10) CHECK (difficulty IN ('Easy','Medium','Hard')),
  topic        VARCHAR(100),
  examples     JSONB,
  constraints  TEXT,
  test_cases   JSONB NOT NULL,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id),
  player1_id   UUID REFERENCES users(id),
  player2_id   UUID REFERENCES users(id),
  status       VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','live','done')),
  is_premium   BOOLEAN DEFAULT FALSE,
  prize_pool   INTEGER DEFAULT 0,
  winner_id    UUID REFERENCES users(id),
  started_at   TIMESTAMP,
  ended_at     TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Battles table (résultats)
CREATE TABLE IF NOT EXISTS battles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID REFERENCES rooms(id),
  user_id      UUID REFERENCES users(id),
  code         TEXT,
  language     VARCHAR(20) DEFAULT 'javascript',
  tests_passed INTEGER DEFAULT 0,
  tests_total  INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW()
);