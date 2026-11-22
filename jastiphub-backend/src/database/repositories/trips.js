export function tripRepository(query) {
  return {
    async findById(id) {
      const rows = await query('SELECT * FROM trips WHERE id = ?', [id]);
      return rows[0];
    },

    listOwned(ownerId) {
      return query('SELECT * FROM trips WHERE owner_id = ? ORDER BY created_at DESC, id', [
        ownerId,
      ]);
    },

    listCountries(today) {
      return query('SELECT DISTINCT country FROM trips WHERE status = ? AND end_date >= ?', [
        'published',
        today,
      ]);
    },

    async search(filter, today) {
      const conditions = ['trips.status = ?', 'trips.end_date >= ?'];
      const values = ['published', today];

      if (filter.countryKey) {
        conditions.push('trips.country_key = ?');
        values.push(filter.countryKey);
      }
      if (filter.ownerId) {
        conditions.push('trips.owner_id = ?');
        values.push(filter.ownerId);
      }
      if (filter.date) {
        conditions.push('trips.start_date <= ? AND trips.end_date >= ?');
        values.push(filter.date, filter.date);
      }
      if (filter.q) {
        const term = '%' + filter.q.replace(/[!%_]/g, (character) => '!' + character) + '%';
        conditions.push(`(
          fold_text(trips.city) LIKE fold_text(?) ESCAPE '!'
          OR fold_text(trips.country) LIKE fold_text(?) ESCAPE '!'
          OR fold_text(users.name) LIKE fold_text(?) ESCAPE '!'
          OR users.handle LIKE ? ESCAPE '!'
          OR EXISTS (
            SELECT 1 FROM trip_stops
            WHERE trip_stops.trip_id = trips.id
              AND fold_text(trip_stops.name) LIKE fold_text(?) ESCAPE '!'
          )
        )`);
        values.push(term, term, term, term, term);
      }

      const where = conditions.join(' AND ');
      const [{ total }] = await query(
        `SELECT COUNT(*) AS total FROM trips JOIN users ON users.id = trips.owner_id WHERE ${where}`,
        values,
      );
      const order = {
        soon: 'trips.start_date ASC',
        latest: 'trips.start_date DESC',
        rating: `(
          SELECT COALESCE(AVG(reviews.rating), 0)
          FROM reviews JOIN trips rated_trip ON rated_trip.id = reviews.trip_id
          WHERE rated_trip.owner_id = trips.owner_id
        ) DESC`,
      }[filter.sort];
      const offset = (filter.page - 1) * filter.pageSize;
      const rows = await query(
        `SELECT trips.* FROM trips JOIN users ON users.id = trips.owner_id
         WHERE ${where} ORDER BY ${order}, trips.id ASC
         LIMIT ${filter.pageSize} OFFSET ${offset}`,
        values,
      );
      return { rows, total: Number(total) };
    },

    stopsByTripIds(ids) {
      if (!ids.length) return [];
      const placeholders = ids.map(() => '?').join(',');
      return query(
        `SELECT * FROM trip_stops WHERE trip_id IN (${placeholders}) ORDER BY position`,
        ids,
      );
    },

    async findStop(id, tripId) {
      const rows = await query('SELECT * FROM trip_stops WHERE id = ? AND trip_id = ?', [
        id,
        tripId,
      ]);
      return rows[0];
    },

    create(id, ownerId, trip) {
      return query(
        `INSERT INTO trips (
          id, owner_id, city, country, country_key, start_date, end_date,
          fee_type, fee_value, cover, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          ownerId,
          trip.city,
          trip.country,
          trip.countryKey,
          trip.start,
          trip.end,
          trip.type,
          trip.value,
          trip.cover,
          trip.status,
        ],
      );
    },

    update(id, trip) {
      return query(
        `UPDATE trips SET city = ?, country = ?, country_key = ?, start_date = ?, end_date = ?,
         fee_type = ?, fee_value = ?, cover = ?, status = ?, version = version + 1, thumb = NULL,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          trip.city,
          trip.country,
          trip.countryKey,
          trip.start,
          trip.end,
          trip.type,
          trip.value,
          trip.cover,
          trip.status,
          id,
        ],
      );
    },

    deleteStops(tripId) {
      return query('DELETE FROM trip_stops WHERE trip_id = ?', [tripId]);
    },

    createStop(stop) {
      return query(
        `INSERT INTO trip_stops (id, trip_id, name, category, day_offset, position)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [stop.id, stop.tripId, stop.name, stop.category, stop.dayOffset, stop.position],
      );
    },
  };
}
