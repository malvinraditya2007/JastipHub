import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../errors.js';

export function createMediaStorage(config) {
  return {
    async save(buffer, id, purpose) {
      if (!config.cloudinary) {
        const filename = id + '.webp';
        const path = join(config.uploadDir, filename);
        await writeFile(path, buffer, { flag: 'wx' });
        return { filename, url: '/uploads/' + filename, remove: () => unlink(path) };
      }

      let result;
      try {
        result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              ...config.cloudinary,
              resource_type: 'image',
              public_id: `jastiphub/${purpose}/${id}`,
              overwrite: false,
              timeout: 30000,
            },
            (error, response) => (error ? reject(error) : resolve(response)),
          );
          stream.on('error', reject);
          stream.end(buffer);
        });
      } catch {
        throw new ApiError(502, 'UPLOAD_FAILED', 'Foto gagal diunggah. Silakan coba lagi.');
      }
      return {
        // The existing filename column stores a local basename or the exact Cloudinary URL.
        filename: result.secure_url,
        url: result.secure_url,
        remove: () =>
          cloudinary.uploader.destroy(result.public_id, {
            ...config.cloudinary,
            resource_type: 'image',
            timeout: 30000,
          }),
      };
    },
  };
}
