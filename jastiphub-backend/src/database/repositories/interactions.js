export function bookmarkRepository(query) {
  return {
    listTrips(userId) {
      return query(
        `SELECT trips.* FROM trips JOIN saved_trips ON saved_trips.trip_id = trips.id
         WHERE saved_trips.user_id = ? AND trips.status = ?
         ORDER BY saved_trips.created_at DESC, trips.id`,
        [userId, 'published'],
      );
    },
    tripIdsForUser(userId, ids) {
      if (!ids.length) return [];
      return query(
        `SELECT trip_id FROM saved_trips WHERE user_id = ? AND trip_id IN (${ids.map(() => '?').join(',')})`,
        [userId, ...ids],
      );
    },
    save(userId, tripId) {
      return query(
        `INSERT INTO saved_trips (user_id, trip_id) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE user_id = user_id`,
        [userId, tripId],
      );
    },
    remove(userId, tripId) {
      return query('DELETE FROM saved_trips WHERE user_id = ? AND trip_id = ?', [userId, tripId]);
    },
  };
}

export function contactRepository(query) {
  return {
    async countForTrip(tripId) {
      const [{ total }] = await query(
        'SELECT COUNT(*) AS total FROM trip_contacts WHERE trip_id = ?',
        [tripId],
      );
      return Number(total);
    },
    async find(userId, tripId) {
      const rows = await query('SELECT * FROM trip_contacts WHERE user_id = ? AND trip_id = ?', [
        userId,
        tripId,
      ]);
      return rows[0];
    },
    save(userId, tripId) {
      return query(
        `INSERT INTO trip_contacts (user_id, trip_id) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE last_contact_at = CURRENT_TIMESTAMP(3)`,
        [userId, tripId],
      );
    },
    listTrips(userId) {
      return query(
        `SELECT trips.*, trip_contacts.first_contact_at, trip_contacts.last_contact_at
         FROM trip_contacts JOIN trips ON trips.id = trip_contacts.trip_id
         WHERE trip_contacts.user_id = ? ORDER BY trip_contacts.last_contact_at DESC, trips.id`,
        [userId],
      );
    },
  };
}

export function reviewRepository(query) {
  return {
    async findByAuthorAndTrip(authorId, tripId) {
      const rows = await query('SELECT id FROM reviews WHERE author_id = ? AND trip_id = ?', [
        authorId,
        tripId,
      ]);
      return rows[0];
    },
    async listForOwner(ownerId, pagination) {
      const [{ total }] = await query(
        `SELECT COUNT(*) AS total FROM reviews JOIN trips ON trips.id = reviews.trip_id
         WHERE trips.owner_id = ?`,
        [ownerId],
      );
      const offset = (pagination.page - 1) * pagination.pageSize;
      const rows = await query(
        `SELECT reviews.id, reviews.trip_id, reviews.rating, reviews.text, reviews.created_at,
                users.id AS author_id, users.name, users.avatar, trips.city
         FROM reviews JOIN trips ON trips.id = reviews.trip_id
         JOIN users ON users.id = reviews.author_id
         WHERE trips.owner_id = ? ORDER BY reviews.created_at DESC, reviews.id
         LIMIT ${pagination.pageSize} OFFSET ${offset}`,
        [ownerId],
      );
      return { rows, total: Number(total) };
    },
    create(review) {
      return query(
        'INSERT INTO reviews (id, author_id, trip_id, rating, text) VALUES (?, ?, ?, ?, ?)',
        [review.id, review.authorId, review.tripId, review.rating, review.text],
      );
    },
  };
}

export function reportRepository(query) {
  return {
    create(report) {
      return query(
        'INSERT INTO reports (id, target_id, author_id, reason, details) VALUES (?, ?, ?, ?, ?)',
        [report.id, report.targetId, report.authorId, report.reason, report.details],
      );
    },
  };
}
