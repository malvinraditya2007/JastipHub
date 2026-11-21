import { randomUUID } from 'node:crypto';
import { ApiError, missing } from '../errors.js';
import {
  token,
  sha256,
  hashPassword,
  verifyPassword,
  recoveryCode,
  recoveryHash,
  equal,
} from '../security.js';
import { createUserService } from './user-service.js';

export const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000;

export async function createAuthService(repositories, config) {
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
    readSession(rawToken) {
      if (typeof rawToken !== 'string' || !/^[a-f0-9]{64}$/.test(rawToken)) return null;
      return repositories.sessions.findActive(sha256(rawToken));
    },

    async register(data, previousSessionHash) {
      const passwordHash = await hashPassword(data.password);
      const recovery = recoveryCode();
      const id = randomUUID();
      const session = await repositories.transaction(async (transaction) => {
        await transaction.users.create({
          ...data,
          id,
          passwordHash,
          recoveryHash: recoveryHash(recovery),
        });
        return makeSession(transaction, id, previousSessionHash);
      });
      return { ...(await loginResult(id, session)), recoveryCode: recovery };
    },

    async login(data, previousSessionHash) {
      const account = await repositories.users.findByHandle(data.handle);
      const valid = await verifyPassword(
        data.password,
        account?.password_hash || dummyPasswordHash,
      );
      if (!valid || !account || (account.is_demo && !config.demo)) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Username atau password belum sesuai.');
      }
      const session = await repositories.transaction(async (transaction) => {
        const current = await transaction.users.findById(account.id, { lock: true });
        if (!current || current.password_hash !== account.password_hash) {
          throw new ApiError(401, 'INVALID_CREDENTIALS', 'Password berubah. Silakan masuk lagi.');
        }
        return makeSession(transaction, account.id, previousSessionHash);
      });
      return loginResult(account.id, session);
    },

    async demo(previousSessionHash) {
      if (!config.demo) throw missing();
      const account = await repositories.users.findById('aldo');
      if (!account?.is_demo)
        throw new ApiError(503, 'DEMO_UNAVAILABLE', 'Data demo belum disiapkan.');
      const session = await repositories.transaction((transaction) =>
        makeSession(transaction, account.id, previousSessionHash),
      );
      return loginResult(account.id, session);
    },

    async resetPassword(data) {
      const passwordHash = await hashPassword(data.password);
      const recovery = recoveryCode();
      await repositories.transaction(async (transaction) => {
        const account = await transaction.users.findByHandle(data.handle, { lock: true });
        if (
          !account ||
          account.is_demo ||
          !equal(recoveryHash(data.recoveryCode), account.recovery_hash)
        ) {
          throw new ApiError(422, 'INVALID_RECOVERY', 'Username atau kode pemulihan belum sesuai.');
        }
        await transaction.users.updateCredentials(account.id, passwordHash, recoveryHash(recovery));
        await transaction.sessions.deleteByUser(account.id);
      });
      return {
        recoveryCode: recovery,
        message: 'Password diperbarui. Simpan kode pemulihan pengganti lalu masuk kembali.',
      };
    },

    async logout(sessionHash) {
      await repositories.sessions.deleteByToken(sessionHash);
      return { loggedOut: true };
    },
  };
}
