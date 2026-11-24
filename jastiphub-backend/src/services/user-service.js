import { missing } from '../errors.js';
import { assertOwnedMedia } from './media-service.js';

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatar: user.avatar,
    avatarColor: user.avatar_color || null,
    city: user.city,
    rating: Number(user.rating || 0),
    count: Number(user.review_count || 0),
  };
}

export function paginationMeta(pagination, total) {
  return { ...pagination, total, pages: Math.ceil(total / pagination.pageSize) };
}

export function createUserService(repositories) {
  return {
    async getProfile(id, privateData = false) {
      const user = await repositories.users.findProfile(id);
      if (!user) throw missing();
      return { ...publicUser(user), ...(privateData ? { phone: user.phone } : {}) };
    },

    async updateProfile(userId, profile) {
      await repositories.transaction(async (transaction) => {
        const existing = await transaction.users.findById(userId);
        if (!existing) throw missing();
        await assertOwnedMedia(transaction, profile.avatar, userId, 'avatar', existing.avatar);
        await transaction.users.updateProfile(userId, {
          ...profile,
          avatarColor:
            profile.avatarColor === undefined ? existing.avatar_color || null : profile.avatarColor,
        });
      });
      return this.getProfile(userId, true);
    },

    async listReviews(ownerId, pagination) {
      await this.getProfile(ownerId);
      const { rows, total } = await repositories.reviews.listForOwner(ownerId, pagination);
      return {
        data: rows.map((review) => ({
          id: review.id,
          tripId: review.trip_id,
          rating: review.rating,
          text: review.text,
          createdAt: review.created_at,
          city: review.city,
          author: {
            id: review.author_id,
            name: review.name,
            avatar: review.avatar,
            avatarColor: review.avatar_color || null,
          },
        })),
        meta: paginationMeta(pagination, total),
      };
    },
  };
}
