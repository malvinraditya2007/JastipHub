import { randomUUID } from 'node:crypto';
import { countries, countryKey, destinationCover } from '../config/destinations.js';
import { ApiError, missing } from '../errors.js';
import { todayInJakarta } from '../utils/date.js';
import { publicUser, paginationMeta } from './user-service.js';
import { assertOwnedMedia } from './media-service.js';

export function createTripService(repositories) {
  async function hydrate(rows, viewerId) {
    if (!rows.length) return [];
    const tripIds = rows.map((trip) => trip.id);
    const ownerIds = [...new Set(rows.map((trip) => trip.owner_id))];
    const stops = await repositories.trips.stopsByTripIds(tripIds);
    const users = await repositories.users.profilesByIds(ownerIds);
    const bookmarks = viewerId
      ? await repositories.bookmarks.tripIdsForUser(viewerId, tripIds)
      : [];
    const savedIds = new Set(bookmarks.map((bookmark) => bookmark.trip_id));
    const usersById = new Map(users.map((user) => [user.id, publicUser(user)]));
    const stopsByTripId = new Map();

    for (const stop of stops) {
      if (!stopsByTripId.has(stop.trip_id)) stopsByTripId.set(stop.trip_id, []);
      stopsByTripId.get(stop.trip_id).push({
        id: stop.id,
        name: stop.name,
        category: stop.category,
        dayOffset: stop.day_offset,
      });
    }

    return rows.map((trip) => {
      const itinerary = stopsByTripId.get(trip.id) || [];
      return {
        id: trip.id,
        owner: trip.owner_id,
        person: usersById.get(trip.owner_id),
        city: trip.city,
        country: trip.country,
        start: trip.start_date || '',
        end: trip.end_date || '',
        type: trip.fee_type,
        value: trip.fee_value === null ? null : Number(trip.fee_value),
        cover: trip.cover || destinationCover(trip.country),
        customCover: trip.cover,
        thumb: trip.thumb || undefined,
        status: trip.status,
        version: trip.version,
        stops: itinerary,
        stores: itinerary.map((stop) => stop.name),
        categories: itinerary.map((stop) => stop.category),
        days: itinerary.map((stop) => stop.dayOffset),
        saved: savedIds.has(trip.id),
        createdAt: trip.created_at,
        updatedAt: trip.updated_at,
      };
    });
  }

  async function getTrip(id, viewerId, ownerOnly = false) {
    const trip = await repositories.trips.findById(id);
    if (
      !trip ||
      (ownerOnly
        ? trip.owner_id !== viewerId
        : trip.status !== 'published' && trip.owner_id !== viewerId)
    ) {
      throw missing();
    }
    return (await hydrate([trip], viewerId))[0];
  }

  return {
    hydrate,
    getTrip,

    async listDestinations() {
      const custom = await repositories.trips.listCountries(todayInJakarta());
      const names = new Map(countries.map((name) => [countryKey(name), name]));
      for (const { country } of custom) {
        if (!names.has(countryKey(country))) names.set(countryKey(country), country);
      }
      return [...names].map(([key, name]) => ({ key, name, cover: destinationCover(name) }));
    },

    async search(filter, viewerId) {
      const { rows, total } = await repositories.trips.search(
        { ...filter, countryKey: countryKey(filter.country) },
        todayInJakarta(),
      );
      return {
        data: await hydrate(rows, viewerId),
        meta: paginationMeta({ page: filter.page, pageSize: filter.pageSize }, total),
      };
    },

    async listOwned(userId) {
      return hydrate(await repositories.trips.listOwned(userId), userId);
    },

    async listSaved(userId) {
      return hydrate(await repositories.bookmarks.listTrips(userId), userId);
    },

    async setSaved(userId, tripId, saved) {
      if (saved) {
        const trip = await getTrip(tripId, userId);
        if (trip.status !== 'published') throw missing();
        await repositories.bookmarks.save(userId, tripId);
      } else {
        await repositories.bookmarks.remove(userId, tripId);
      }
      return { tripId, saved };
    },

    async save(ownerId, data, existingId) {
      return repositories.transaction(async (transaction) => {
        const tripId = existingId || data.id || randomUUID();
        const existing = await transaction.trips.findById(tripId, { lock: true });
        const transactionService = createTripService(transaction);

        if (existingId && (!existing || existing.owner_id !== ownerId)) throw missing();
        if (!existingId && existing) {
          if (existing.owner_id !== ownerId)
            throw new ApiError(409, 'ID_CONFLICT', 'ID trip sudah digunakan.');
          return { trip: await transactionService.getTrip(tripId, ownerId), created: false };
        }
        if (existing && data.version !== existing.version) {
          throw new ApiError(
            409,
            'VERSION_CONFLICT',
            'Trip diubah di tab lain. Muat ulang sebelum menyimpan.',
          );
        }
        if (existing?.status === 'published' && data.status === 'draft') {
          throw new ApiError(
            422,
            'INVALID_STATUS',
            'Trip terbit harus disimpan sebagai trip terbit.',
          );
        }
        await assertOwnedMedia(transaction, data.cover, ownerId, 'cover', existing?.cover);

        const datesChanged =
          existing && (existing.start_date !== data.start || existing.end_date !== data.end);
        if (datesChanged && (await transaction.contacts.countForTrip(tripId))) {
          throw new ApiError(
            409,
            'DATES_LOCKED',
            'Jadwal trip yang sudah memiliki riwayat kontak tidak dapat diubah. Buat trip baru untuk jadwal lain.',
          );
        }

        const record = { ...data, countryKey: countryKey(data.country) };
        if (existing) {
          await transaction.trips.update(tripId, record);
          await transaction.trips.deleteStops(tripId);
        } else {
          await transaction.trips.create(tripId, ownerId, record);
        }
        for (const [position, stop] of data.stops.entries()) {
          await transaction.trips.createStop({ ...stop, id: randomUUID(), tripId, position });
        }
        return { trip: await transactionService.getTrip(tripId, ownerId), created: !existing };
      });
    },
  };
}
