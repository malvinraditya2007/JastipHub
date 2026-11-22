const now = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export function sessionRepository(query) {
  return {
    async findActive(tokenHash) {
      const rows = await query(
        `SELECT sessions.*, users.id AS account_id
         FROM sessions JOIN users ON users.id = sessions.user_id
         WHERE sessions.token_hash = ? AND sessions.expires_at > ${now}`,
        [tokenHash],
      );
      return rows[0];
    },

    create(session) {
      return query(
        `INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at)
         VALUES (?, ?, ?, ?)`,
        [session.tokenHash, session.userId, session.csrfToken, session.expiresAt.toISOString()],
      );
    },

    deleteByToken(tokenHash) {
      return query('DELETE FROM sessions WHERE token_hash = ?', [tokenHash]);
    },

    deleteByUser(userId) {
      return query('DELETE FROM sessions WHERE user_id = ?', [userId]);
    },

    deleteExpired() {
      return query(`DELETE FROM sessions WHERE expires_at <= ${now}`);
    },
  };
}
