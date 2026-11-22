CREATE TABLE users (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  recovery_hash TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE TABLE sessions (
  token_hash TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;
CREATE INDEX sessions_expires ON sessions(expires_at);

CREATE TABLE media (
  id TEXT NOT NULL PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('avatar', 'cover')),
  filename TEXT NOT NULL UNIQUE,
  size INTEGER NOT NULL CHECK (size >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;
CREATE INDEX media_owner ON media(owner_id);

CREATE TABLE trips (
  id TEXT NOT NULL PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_key TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  fee_type TEXT NOT NULL DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed_per_item')),
  fee_value REAL,
  cover TEXT,
  thumb TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT trip_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT trip_fee CHECK (fee_value IS NULL OR (fee_value >= 0 AND (fee_type <> 'percentage' OR fee_value <= 100))),
  CONSTRAINT trip_published CHECK (status <> 'published' OR (start_date IS NOT NULL AND end_date IS NOT NULL AND fee_value IS NOT NULL))
) STRICT;
CREATE INDEX trips_public ON trips(status, end_date, start_date);
CREATE INDEX trips_destination ON trips(country_key, status, end_date);
CREATE INDEX trips_owner ON trips(owner_id, status);

CREATE TABLE trip_stops (
  id TEXT NOT NULL PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL COLLATE NOCASE,
  category TEXT NOT NULL DEFAULT '',
  day_offset INTEGER NOT NULL DEFAULT 0 CHECK (day_offset >= 0),
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (trip_id, name),
  UNIQUE (trip_id, position)
) STRICT;

CREATE TABLE saved_trips (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, trip_id)
) STRICT;
CREATE INDEX saved_trips_trip ON saved_trips(trip_id);

CREATE TABLE trip_contacts (
  user_id TEXT NOT NULL REFERENCES users(id),
  trip_id TEXT NOT NULL REFERENCES trips(id),
  first_contact_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_contact_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, trip_id)
) STRICT;
CREATE INDEX contacts_history ON trip_contacts(user_id, last_contact_at);
CREATE INDEX contacts_trip ON trip_contacts(trip_id);

CREATE TABLE reviews (
  id TEXT NOT NULL PRIMARY KEY,
  author_id TEXT NOT NULL,
  trip_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id, trip_id) REFERENCES trip_contacts(user_id, trip_id),
  UNIQUE (author_id, trip_id)
) STRICT;
CREATE INDEX reviews_trip ON reviews(trip_id, created_at);

CREATE TABLE reports (
  id TEXT NOT NULL PRIMARY KEY,
  target_id TEXT NOT NULL REFERENCES users(id),
  author_id TEXT REFERENCES users(id),
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'resolved')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;
CREATE INDEX reports_queue ON reports(status, created_at);
