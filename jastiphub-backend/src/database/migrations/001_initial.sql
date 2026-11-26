CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  handle MEDIUMTEXT NOT NULL,
  handle_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  recovery_hash CHAR(64) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT '',
  avatar VARCHAR(255) NOT NULL DEFAULT '',
  avatar_color CHAR(7) NULL DEFAULT NULL,
  is_demo TINYINT NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX users_handle_key_unique (handle_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  csrf_token CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX sessions_expires (expires_at),
  INDEX sessions_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  owner_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  purpose VARCHAR(10) NOT NULL CHECK (purpose IN ('avatar', 'cover')),
  filename VARCHAR(255) COLLATE utf8mb4_bin NOT NULL UNIQUE,
  size INT NOT NULL CHECK (size >= 0),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX media_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  owner_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_key VARCHAR(200) NOT NULL,
  start_date DATE,
  end_date DATE,
  fee_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed_per_item')),
  fee_value DECIMAL(13,1),
  cover VARCHAR(255),
  thumb VARCHAR(255),
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version INT NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT trip_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT trip_fee CHECK (fee_value IS NULL OR (fee_value >= 0 AND (fee_type <> 'percentage' OR fee_value <= 100))),
  CONSTRAINT trip_published CHECK (status <> 'published' OR (start_date IS NOT NULL AND end_date IS NOT NULL AND fee_value IS NOT NULL)),
  INDEX trips_public (status, end_date, start_date),
  INDEX trips_destination (country_key, status, end_date),
  INDEX trips_owner (owner_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_stops (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  trip_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(150) NOT NULL DEFAULT '',
  day_offset INT NOT NULL DEFAULT 0 CHECK (day_offset >= 0),
  position INT NOT NULL CHECK (position >= 0),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE (trip_id, name),
  UNIQUE (trip_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_trips (
  user_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  trip_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, trip_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX saved_trips_trip (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_contacts (
  user_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  trip_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  first_contact_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_contact_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, trip_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  INDEX contacts_history (user_id, last_contact_at),
  INDEX contacts_trip (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  author_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  trip_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text VARCHAR(1200) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (author_id, trip_id) REFERENCES trip_contacts(user_id, trip_id),
  UNIQUE (author_id, trip_id),
  INDEX reviews_trip (trip_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  target_id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL,
  author_id VARCHAR(36) COLLATE utf8mb4_bin,
  reason VARCHAR(100) NOT NULL,
  details VARCHAR(2000) NOT NULL DEFAULT '',
  status VARCHAR(10) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'resolved')),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (target_id) REFERENCES users(id),
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX reports_queue (status, created_at),
  INDEX reports_target (target_id),
  INDEX reports_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
