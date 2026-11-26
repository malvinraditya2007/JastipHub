import { randomUUID } from 'node:crypto';
import { ApiError, missing } from '../errors.js';
import { todayInJakarta } from '../utils/date.js';
import { createTripService } from './trip-service.js';
import { createUserService } from './user-service.js';
import { assertOwnedMedia } from './media-service.js';

export function createInteractionService(repositories) {
  const trips = createTripService(repositories);
  const users = createUserService(repositories);

  async function eligibility(trip, userId) {
    if (!userId) return { eligible: false, reason: 'Masuk terlebih dahulu.' };
    if (trip.owner === userId)
      return { eligible: false, reason: 'Kamu tidak dapat mengulas trip sendiri.' };
    if (trip.status !== 'published')
      return { eligible: false, reason: 'Trip belum dipublikasikan.' };
    if (await repositories.reviews.findByAuthorAndTrip(userId, trip.id)) {
      return { eligible: false, reviewed: true, reason: 'Ulasan sudah dikirim.' };
    }
    if (!(await repositories.contacts.find(userId, trip.id))) {
      return {
        eligible: false,
        reason: 'Hubungi jastiper melalui tombol WhatsApp terlebih dahulu.',
      };
    }
    if (!trip.end || trip.end >= todayInJakarta())
      return { eligible: false, reason: 'Ulasan tersedia setelah trip selesai.' };
    return { eligible: true, reason: 'Trip selesai dan permintaan kontak tercatat.' };
  }

  return {
    eligibility,

    async openContact(tripId, userId, stopId) {
      return repositories.transaction(async (transaction) => {
        const trip = await transaction.trips.findById(tripId);
        if (!trip || trip.status !== 'published') throw missing();
        if (trip.owner_id === userId)
          throw new ApiError(
            422,
            'OWN_TRIP',
            'Ini trip milikmu sendiri. Gunakan preview di editor.',
          );
        const owner = await transaction.users.findById(trip.owner_id);
        let storeName = '';
        if (stopId) {
          const stop = await transaction.trips.findStop(stopId, tripId);
          if (!stop) throw missing();
          storeName = stop.name;
        }
        await transaction.contacts.save(userId, tripId);
        const message = `Halo ${owner.name}, aku menemukan trip ${trip.city} di JastipHub. Masih menerima titipan? ${storeName ? `Boleh tanya produk di ${storeName} dan total biayanya?` : 'Boleh tanya produk dan total biayanya?'}`;
        return {
          tripId,
          url: `https://wa.me/${owner.phone}?text=${encodeURIComponent(message)}`,
          recorded: true,
        };
      });
    },

    async listContacts(userId) {
      const rows = await repositories.contacts.listTrips(userId);
      const hydrated = await trips.hydrate(rows, userId);
      const results = [];
      for (const [index, trip] of hydrated.entries()) {
        results.push({
          trip,
          firstContactAt: rows[index].first_contact_at,
          lastContactAt: rows[index].last_contact_at,
          ...(await eligibility(trip, userId)),
        });
      }
      return results;
    },

    async saveReview(tripId, userId, data) {
      return repositories.transaction(async (transaction) => {
        const trip = await createTripService(transaction).getTrip(tripId, userId);
        const allowed = await createInteractionService(transaction).eligibility(trip, userId);
        if (!allowed.eligible)
          throw new ApiError(allowed.reviewed ? 409 : 403, 'REVIEW_NOT_ALLOWED', allowed.reason);
        const photos = await Promise.all(
          data.photos.map((url) => assertOwnedMedia(transaction, url, userId, 'review')),
        );
        const id = randomUUID();
        await transaction.reviews.create({
          id,
          authorId: userId,
          tripId,
          rating: data.rating,
          text: data.text,
        });
        for (const [position, media] of photos.entries()) {
          await transaction.reviews.addPhoto(id, media.id, position);
        }
        return {
          id,
          tripId,
          rating: data.rating,
          text: data.text,
          photos: data.photos,
          jastiper: await createUserService(transaction).getProfile(trip.owner),
        };
      });
    },

    async report(userId, data) {
      await users.getProfile(data.targetId);
      const id = randomUUID();
      await repositories.reports.create({ ...data, id, authorId: userId || null });
      return { id, status: 'received' };
    },
  };
}
