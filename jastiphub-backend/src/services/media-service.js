import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors.js';
import { createMediaStorage } from './media-storage.js';

export async function assertOwnedMedia(repositories, url, userId, purpose, previous = null) {
  if (!url || url === previous) return;
  const local = url.startsWith('/uploads/');
  const cloud = url.startsWith('https://res.cloudinary.com/');
  const filename = local ? url.slice('/uploads/'.length) : url;
  const media = (local || cloud) && (await repositories.media.findOwned(filename, userId, purpose));
  if (!media) {
    throw new ApiError(422, 'INVALID_MEDIA', 'Foto tidak tersedia atau bukan milik akunmu.');
  }
}

export function createMediaService(repositories, config) {
  const storage = createMediaStorage(config);
  return {
    async upload(userId, file, purpose) {
      if (
        !['avatar', 'cover'].includes(purpose) ||
        !file ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ) {
        throw new ApiError(
          422,
          'INVALID_IMAGE',
          'Pilih satu gambar JPG, PNG, atau WebP dan tujuan unggahan.',
        );
      }

      let output;
      try {
        const image = sharp(file.buffer, {
          limitInputPixels: 25000000,
          failOn: 'warning',
          animated: false,
        });
        const metadata = await image.metadata();
        if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1) {
          throw new Error('Unsupported image');
        }
        output = await image
          .rotate()
          .resize(purpose === 'avatar' ? 240 : 1100, purpose === 'avatar' ? 240 : 619, {
            fit: 'cover',
            withoutEnlargement: true,
          })
          .webp({ quality: 83 })
          .toBuffer();
      } catch {
        throw new ApiError(
          422,
          'INVALID_IMAGE',
          'File gambar rusak, terlalu besar dimensinya, atau format tidak didukung.',
        );
      }

      const id = randomUUID();
      const stored = await storage.save(output, id, purpose);
      try {
        await repositories.media.create({
          id,
          ownerId: userId,
          purpose,
          filename: stored.filename,
          size: output.length,
        });
      } catch (error) {
        await stored.remove().catch(() => {});
        throw error;
      }
      return { id, url: stored.url, purpose };
    },
  };
}
