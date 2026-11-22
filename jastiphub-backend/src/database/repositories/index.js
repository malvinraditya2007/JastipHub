import { userRepository } from './users.js';
import { sessionRepository } from './sessions.js';
import { tripRepository } from './trips.js';
import {
  bookmarkRepository,
  contactRepository,
  reviewRepository,
  reportRepository,
} from './interactions.js';
import { mediaRepository } from './media.js';

// Repository transaksi memakai query langsung pada koneksi yang sedang dikunci.
export function createRepositories(database) {
  const query = database.query;
  return {
    users: userRepository(query),
    sessions: sessionRepository(query),
    trips: tripRepository(query),
    bookmarks: bookmarkRepository(query),
    contacts: contactRepository(query),
    reviews: reviewRepository(query),
    reports: reportRepository(query),
    media: mediaRepository(query),
    system: {
      ping: () => query('SELECT 1'),
    },
    transaction(work) {
      return database.transaction((transactionQuery) =>
        work(createRepositories({ ...database, query: transactionQuery })),
      );
    },
  };
}
