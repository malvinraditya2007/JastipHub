CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  handle VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  recovery_hash CHAR(64) CHARACTER SET ascii NOT NULL,
  phone VARCHAR(15) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT '',
  avatar VARCHAR(255) NOT NULL DEFAULT '',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY users_handle_unique (handle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  csrf_token CHAR(64) CHARACTER SET ascii NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  owner_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  purpose ENUM('avatar','cover') NOT NULL,
  filename VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY media_filename_unique (filename),
  INDEX media_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  owner_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_key VARCHAR(100) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  fee_type ENUM('percentage','fixed_per_item') NOT NULL DEFAULT 'percentage',
  fee_value DECIMAL(14,2) NULL,
  cover VARCHAR(255) NULL,
  thumb VARCHAR(100) NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT trip_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT trip_fee CHECK (fee_value IS NULL OR (fee_value >= 0 AND (fee_type <> 'percentage' OR fee_value <= 100))),
  CONSTRAINT trip_published CHECK (status <> 'published' OR (start_date IS NOT NULL AND end_date IS NOT NULL AND fee_value IS NOT NULL)),
  INDEX trips_public (status,end_date,start_date),
  INDEX trips_destination (country_key,status,end_date),
  INDEX trips_owner (owner_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_stops (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  trip_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(150) NOT NULL DEFAULT '',
  day_offset SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  position SMALLINT UNSIGNED NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE KEY trip_stop_name_unique (trip_id,name),
  UNIQUE KEY trip_stop_position_unique (trip_id,position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_trips (
  user_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  trip_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id,trip_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_contacts (
  user_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  trip_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  first_contact_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_contact_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id,trip_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  INDEX contacts_history (user_id,last_contact_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  author_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  trip_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  text VARCHAR(1200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id,trip_id) REFERENCES trip_contacts(user_id,trip_id),
  UNIQUE KEY reviews_author_trip_unique (author_id,trip_id),
  CONSTRAINT reviews_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX reviews_trip (trip_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  target_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  author_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  reason VARCHAR(100) NOT NULL,
  details VARCHAR(2000) NOT NULL DEFAULT '',
  status ENUM('received','reviewing','resolved') NOT NULL DEFAULT 'received',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_id) REFERENCES users(id),
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX reports_queue (status,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
