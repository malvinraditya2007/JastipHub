import { z } from 'zod';
import { normalizePhone } from './utils/phone.js';

const text = (max, label) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(max, `${label} maksimal ${max} karakter.`);
export const id = z.string().regex(/^[a-zA-Z0-9-]{1,36}$/, 'ID tidak valid.');
const handle = z.string().trim().min(1, 'Username wajib diisi.');
const password = z.string().min(1, 'Password wajib diisi.');
const phone = z
  .string()
  .max(30)
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\d{8,15}$/, 'Nomor WhatsApp harus 8–15 digit.'));
export const registration = z.object({ name: text(100, 'Nama'), handle, password, phone }).strict();
export const login = z.object({ handle, password }).strict();
export const profile = z
  .object({
    name: text(100, 'Nama'),
    handle,
    phone,
    city: z.string().trim().max(100).default(''),
    avatar: z.string().max(255).default(''),
    avatarColor: z
      .string()
      .regex(/^#[0-9a-f]{6}$/i, 'Pilih warna inisial yang valid.')
      .transform((value) => value.toLowerCase())
      .nullable()
      .optional(),
  })
  .strict();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const d = new Date(value + 'T12:00:00Z');
    return (
      !Number.isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === value &&
      value >= '2000-01-01' &&
      value <= '2100-12-31'
    );
  }, 'Tanggal tidak valid.');
const optionalDate = z.union([date, z.literal(''), z.null()]).transform((value) => value || null);
export const tripInput = z
  .object({
    id: z.string().uuid().optional(),
    city: text(100, 'Kota'),
    country: text(100, 'Negara'),
    start: optionalDate,
    end: optionalDate,
    type: z.enum(['percentage', 'fixed_per_item']),
    value: z.number().finite().min(0).max(999999999999).nullable(),
    cover: z.string().max(255).nullable(),
    status: z.enum(['draft', 'published']),
    version: z.number().int().positive().optional(),
    stops: z
      .array(
        z
          .object({
            name: text(150, 'Nama toko'),
            category: z.string().trim().max(150).default(''),
            dayOffset: z.number().int().min(0).max(366).default(0),
          })
          .strict(),
      )
      .max(30, 'Maksimal 30 toko per trip.'),
  })
  .strict()
  .superRefine((t, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (t.start && t.end && t.end < t.start)
      issue('end', 'Tanggal pulang harus sama atau setelah tanggal berangkat.');
    if (t.type === 'percentage' && t.value > 100) issue('value', 'Persentase fee maksimal 100%.');
    if (t.type === 'fixed_per_item' && t.value !== null && !Number.isInteger(t.value))
      issue('value', 'Nominal rupiah harus bilangan bulat.');
    if (
      t.type === 'percentage' &&
      t.value !== null &&
      Math.abs(t.value * 10 - Math.round(t.value * 10)) > 0.00001
    )
      issue('value', 'Persentase maksimal satu angka desimal.');
    const keys = t.stops.map((s) => s.name.toLowerCase());
    if (new Set(keys).size !== keys.length) issue('stops', 'Nama toko tidak boleh duplikat.');
    if (t.start && t.end) {
      const duration = (new Date(t.end) - new Date(t.start)) / 86400000;
      if (t.stops.some((s) => s.dayOffset > duration))
        issue('stops', 'Hari kunjungan toko harus berada dalam tanggal perjalanan.');
    }
    if (t.status === 'published') {
      if (!t.start || !t.end) issue('start', 'Lengkapi tanggal perjalanan sebelum publikasi.');
      if (!t.stops.length) issue('stops', 'Tambahkan minimal satu toko sebelum publikasi.');
      if (t.value === null) issue('value', 'Isi fee sebelum publikasi.');
    }
  });
export const reviewInput = z
  .object({
    rating: z.number().int().min(1).max(5),
    text: text(1200, 'Ulasan'),
    acknowledged: z.literal(true, { error: 'Centang persetujuan ulasan.' }),
  })
  .strict();
export const reportInput = z
  .object({
    targetId: id,
    reason: z.enum([
      'Informasi trip menyesatkan',
      'Meminta pembayaran mencurigakan',
      'Alasan lainnya',
    ]),
    details: z.string().trim().max(2000).default(''),
  })
  .strict()
  .refine((value) => value.reason !== 'Alasan lainnya' || value.details.length > 0, {
    message: 'Jelaskan alasan laporan.',
    path: ['details'],
  });
export const listing = z
  .object({
    q: z.string().trim().max(200).default(''),
    country: z.string().trim().max(100).default(''),
    date: date.optional(),
    ownerId: id.optional(),
    sort: z.enum(['soon', 'latest', 'rating']).default('soon'),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    pageSize: z.coerce.number().int().min(1).max(30).default(12),
  })
  .strict();
