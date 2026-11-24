import { randomUUID } from 'node:crypto';
import { configuration } from '../config.js';
import { database } from './connection.js';
import { initDatabase } from './init.js';
import { hashPassword, recoveryCode, recoveryHash } from '../security.js';
import { countryKey } from '../config/destinations.js';
import { todayInJakarta } from '../utils/date.js';
import { usernameKey } from '../utils/username.js';

export async function seedDemo(db) {
  const date = (offset) => {
    const d = new Date(todayInJakarta() + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  await db.transaction(async (query) => {
    const passwordHash = await hashPassword(randomUUID());
    const people = [
      ['owen', 'Owen', 'owenjastip', '12025550100'],
      ['nadia', 'Nadia', 'nadiajastip', '12025550101'],
      ['kevin', 'Kevin', 'kevinjastip', '12025550102'],
      ['aldo', 'Aldo Pratama', 'aldojastip', '12025550103'],
      ['salsa', 'Salsa Putri', 'salsajastip', '12025550104'],
      ['rizky', 'Rizky Aditya', 'rizkyjastip', '12025550105'],
      ['mei', 'Mei Lin', 'meilinjastip', '12025550106'],
    ];
    for (const [id, name, handle, phone] of people) {
      const [existing] = await query(
        'SELECT id, is_demo FROM users WHERE id = ? OR handle_key = ?',
        [id, usernameKey(handle)],
      );
      if (existing) {
        if (existing.id !== id || !existing.is_demo) {
          throw new Error(`Data demo ${handle} bentrok dengan akun yang sudah ada.`);
        }
        await query("UPDATE users SET avatar = '' WHERE id = ? AND is_demo = 1 AND avatar = ?", [
          id,
          id,
        ]);
        continue;
      }
      await query(
        'INSERT INTO users (id,name,handle,handle_key,password_hash,recovery_hash,phone,city,avatar,is_demo) VALUES (?,?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE id = id',
        [
          id,
          name,
          handle,
          usernameKey(handle),
          passwordHash,
          recoveryHash(recoveryCode()),
          phone,
          {
            aldo: 'Tangerang, Indonesia',
            salsa: 'Bandung, Indonesia',
            rizky: 'Jakarta, Indonesia',
            mei: 'Surabaya, Indonesia',
          }[id] || '',
          '',
        ],
      );
    }
    const trips = [
      {
        id: 'tokyo',
        city: 'Tokyo',
        country: 'Jepang',
        owner: 'owen',
        start: 18,
        end: 23,
        value: 10,
        cover: 'tokyo',
        thumb: 'tokyoCard',
        stores: ['Nintendo Tokyo', 'Uniqlo Ginza', 'Don Quijote Shibuya'],
        days: [0, 1, 2],
        categories: [
          'Gaming & merchandise',
          'Fashion & daily essentials',
          'Souvenir & kebutuhan harian',
        ],
      },
      {
        id: 'seoul',
        city: 'Seoul',
        country: 'Korea Selatan',
        owner: 'nadia',
        start: 20,
        end: 25,
        value: 8,
        cover: 'seoul',
        thumb: 'seoulCard',
        stores: ['Olive Young', 'Musinsa', 'The Hyundai Seoul'],
        days: [0, 1, 3],
      },
      {
        id: 'singapura',
        city: 'Singapura',
        country: 'Singapura',
        owner: 'kevin',
        start: 22,
        end: 26,
        value: 10,
        cover: 'singapore',
        thumb: 'singaporeCard',
        stores: ['FairPrice', 'POP MART', 'Changi Jewel'],
        days: [0, 1, 3],
      },
      {
        id: 'bangkok',
        city: 'Bangkok',
        country: 'Thailand',
        owner: 'aldo',
        start: 60,
        end: 65,
        value: 8,
        cover: null,
        stores: ['CentralWorld', 'Siam Paragon', 'Big C Ratchadamri'],
      },
      {
        id: 'osaka',
        city: 'Osaka',
        country: 'Jepang',
        owner: 'owen',
        start: -18,
        end: -13,
        value: 10,
        cover: 'tokyo',
        stores: ['Shinsaibashi'],
      },
      {
        id: 'kualalumpur',
        city: 'Kuala Lumpur',
        country: 'Malaysia',
        owner: 'salsa',
        start: 10,
        end: 15,
        value: 7,
        cover: null,
        stores: ['Pavilion Kuala Lumpur', 'Suria KLCC', 'Central Market'],
        days: [0, 1, 3],
        categories: ['Fashion & aksesori', 'Beauty & lifestyle', 'Oleh-oleh'],
      },
      {
        id: 'taipei',
        city: 'Taipei',
        country: 'Taiwan',
        owner: 'rizky',
        start: 14,
        end: 19,
        value: 9,
        cover: null,
        stores: ['Taipei 101', 'Ximending', 'Eslite Spectrum'],
        days: [0, 1, 2],
        categories: ['Fashion & lifestyle', 'Snack & kosmetik', 'Buku & merchandise'],
      },
      {
        id: 'hochiminh',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        owner: 'mei',
        start: 25,
        end: 29,
        value: 8,
        cover: null,
        stores: ['Saigon Centre', 'Ben Thanh Market', 'Lotte Mart'],
        days: [0, 1, 2],
        categories: ['Fashion & beauty', 'Kopi & oleh-oleh', 'Snack & kebutuhan harian'],
      },
    ];
    for (const trip of trips) {
      const [existing] = await query('SELECT id FROM trips WHERE id=?', [trip.id]);
      if (existing) continue;
      await query(
        'INSERT INTO trips (id,owner_id,city,country,country_key,start_date,end_date,fee_type,fee_value,cover,thumb,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [
          trip.id,
          trip.owner,
          trip.city,
          trip.country,
          countryKey(trip.country),
          date(trip.start),
          date(trip.end),
          'percentage',
          trip.value,
          trip.cover,
          trip.thumb || null,
          'published',
        ],
      );
      for (const [i, name] of trip.stores.entries())
        await query(
          'INSERT INTO trip_stops (id,trip_id,name,category,day_offset,position) VALUES (?,?,?,?,?,?)',
          [randomUUID(), trip.id, name, trip.categories?.[i] || '', trip.days?.[i] || 0, i],
        );
    }
    for (const id of ['seoul', 'singapura'])
      await query(
        'INSERT INTO saved_trips (user_id,trip_id) VALUES (?,?) ON DUPLICATE KEY UPDATE user_id = user_id',
        ['aldo', id],
      );
    await query(
      'INSERT INTO trip_contacts (user_id,trip_id) VALUES (?,?) ON DUPLICATE KEY UPDATE user_id = user_id',
      ['aldo', 'osaka'],
    );
  });
}
if (process.argv[1]?.replace(/\\/g, '/').endsWith('/src/database/seed.js')) {
  const config = configuration();
  if (config.production || !config.demo)
    throw new Error('Seed demo hanya tersedia saat demo diaktifkan di development.');
  const db = database(config.database);
  try {
    await initDatabase(db);
    await seedDemo(db);
    console.log('Data demo disiapkan. Login melalui tombol demo, tanpa password bersama.');
  } finally {
    await db.close();
  }
}
