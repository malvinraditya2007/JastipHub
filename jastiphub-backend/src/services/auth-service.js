import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors.js';
import { token, sha256, hashPassword, verifyPassword } from '../security.js';
import { createUserService } from './user-service.js';

export const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000;

export async function createAuthService(repositories) {
  const users = createUserService(repositories);
  const dummyPasswordHash = await hashPassword(token());

  async function makeSession(transaction, userId, previousSessionHash) {
    const sessionToken = token();
    const csrfToken = token();
    if (previousSessionHash) await transaction.sessions.deleteByToken(previousSessionHash);
    await transaction.sessions.create({
      tokenHash: sha256(sessionToken),
      userId,
      csrfToken,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
    });
    return { sessionToken, csrfToken };
  }

  async function loginResult(userId, session) {
    return { user: await users.getProfile(userId, true), ...session };
  }

  return {
    async readSession(rawToken) {
      if (typeof rawToken !== 'string' || !/^[a-f0-9]{64}$/.test(rawToken)) return null;
      const session = await repositories.sessions.findActive(sha256(rawToken));
      return session && !session.is_demo ? session : null;
    },

    async register(data, previousSessionHash) {
      const passwordHash = await hashPassword(data.password);
      const id = randomUUID();
      const session = await repositories.transaction(async (transaction) => {
        await transaction.users.create({
          ...data,
          id,
          passwordHash,
        });
        return makeSession(transaction, id, previousSessionHash);
      });
      return loginResult(id, session);
    },

    async login(data, previousSessionHash) {
      const account = await repositories.users.findByHandle(data.handle);
      const valid = await verifyPassword(
        data.password,
        account?.password_hash || dummyPasswordHash,
      );
      if (!valid || !account || account.is_demo) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Username atau password belum sesuai.');
      }
      const session = await repositories.transaction(async (transaction) => {
        const current = await transaction.users.findById(account.id);
        if (!current || current.password_hash !== account.password_hash) {
          throw new ApiError(401, 'INVALID_CREDENTIALS', 'Password berubah. Silakan masuk lagi.');
        }
        return makeSession(transaction, account.id, previousSessionHash);
      });
      return loginResult(account.id, session);
    },

    async logout(sessionHash) {
      await repositories.sessions.deleteByToken(sessionHash);
      return { loggedOut: true };
    },
  };
}
