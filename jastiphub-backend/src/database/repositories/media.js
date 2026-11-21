export function mediaRepository(query) {
  return {
    async findOwned(filename, ownerId, purpose) {
      const rows = await query(
        'SELECT id FROM media WHERE filename = ? AND owner_id = ? AND purpose = ?',
        [filename, ownerId, purpose],
      );
      return rows[0];
    },
    create(media) {
      return query(
        'INSERT INTO media (id, owner_id, purpose, filename, size) VALUES (?, ?, ?, ?, ?)',
        [media.id, media.ownerId, media.purpose, media.filename, media.size],
      );
    },
  };
}
