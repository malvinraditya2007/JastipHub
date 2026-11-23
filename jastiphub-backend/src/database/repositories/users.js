import { usernameKey } from '../../utils/username.js';

const ratingJoin = `
  LEFT JOIN (
    SELECT trips.owner_id, ROUND(AVG(reviews.rating), 1) AS rating,
           COUNT(*) AS review_count
    FROM reviews
    JOIN trips ON trips.id = reviews.trip_id
    GROUP BY trips.owner_id
  ) scores ON scores.owner_id = users.id
`;

export function userRepository(query, transactional = false) {
  const lock = transactional ? ' FOR UPDATE' : '';
  return {
    async findById(id) {
      const rows = await query('SELECT * FROM users WHERE id = ?' + lock, [id]);
      return rows[0];
    },

    async findByHandle(handle) {
      const rows = await query('SELECT * FROM users WHERE handle_key = ?' + lock, [
        usernameKey(handle),
      ]);
      return rows[0];
    },

    async findProfile(id) {
      const rows = await query(
        `SELECT users.*, scores.rating, scores.review_count
         FROM users ${ratingJoin} WHERE users.id = ?`,
        [id],
      );
      return rows[0];
    },

    profilesByIds(ids) {
      if (!ids.length) return [];
      const placeholders = ids.map(() => '?').join(',');
      return query(
        `SELECT users.*, scores.rating, scores.review_count
         FROM users ${ratingJoin} WHERE users.id IN (${placeholders})`,
        ids,
      );
    },

    create(user) {
      return query(
        `INSERT INTO users (id, name, handle, handle_key, password_hash, recovery_hash, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.handle,
          usernameKey(user.handle),
          user.passwordHash,
          user.recoveryHash,
          user.phone,
        ],
      );
    },

    updateProfile(id, profile) {
      return query(
        `UPDATE users SET name = ?, handle = ?, handle_key = ?, phone = ?, city = ?, avatar = ?,
         updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [
          profile.name,
          profile.handle,
          usernameKey(profile.handle),
          profile.phone,
          profile.city,
          profile.avatar,
          id,
        ],
      );
    },

    updateCredentials(id, passwordHash, recoveryHash) {
      return query(
        `UPDATE users SET password_hash = ?, recovery_hash = ?,
         updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [passwordHash, recoveryHash, id],
      );
    },
  };
}
