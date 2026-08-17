/**
 * @file validation.js
 * @description Input validation and sanitisation utilities for CIRCULAI forms.
 *
 * Provides reusable validation rules for addresses, contact numbers,
 * body measurements, and custom order parameters to ensure data integrity
 * before sending payloads to the backend API or local storage.
 */

// ─── Regex Patterns ──────────────────────────────────────────────────────────

/** Indonesian phone number format: starts with 08 or +628, 9-14 digits. */
const ID_PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;

/** Indonesian postal code: exactly 5 digits. */
const POSTAL_CODE_REGEX = /^[1-9][0-9]{4}$/;

// ─── Validators ─────────────────────────────────────────────────────────────

/**
 * Validates an Indonesian phone number.
 *
 * @param {string} phone
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validatePhone(phone) {
  const clean = (phone ?? '').trim().replace(/[\s-]/g, '');
  if (!clean) {
    return { valid: false, error: 'Nomor telepon wajib diisi.' };
  }
  if (!ID_PHONE_REGEX.test(clean)) {
    return {
      valid: false,
      error: 'Nomor telepon tidak valid (contoh: 08123456789).',
    };
  }
  return { valid: true, sanitized: clean };
}

/**
 * Validates a shipping address draft.
 *
 * @param {{ label?: string, name?: string, phone?: string, city?: string, detail?: string, postalCode?: string }} draft
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateAddressDraft(draft = {}) {
  const errors = {};

  const label = (draft.label ?? '').trim();
  if (!label) {
    errors.label = 'Label alamat wajib diisi (e.g. Rumah, Kantor).';
  } else if (label.length < 2) {
    errors.label = 'Label minimal 2 karakter.';
  }

  const name = (draft.name ?? '').trim();
  if (!name) {
    errors.name = 'Nama penerima wajib diisi.';
  } else if (name.length < 2) {
    errors.name = 'Nama penerima minimal 2 karakter.';
  }

  const phoneRes = validatePhone(draft.phone);
  if (!phoneRes.valid) {
    errors.phone = phoneRes.error;
  }

  const city = (draft.city ?? '').trim();
  if (!city) {
    errors.city = 'Kota / Kabupaten wajib diisi.';
  }

  const detail = (draft.detail ?? '').trim();
  if (!detail) {
    errors.detail = 'Detail alamat jalan / patokan wajib diisi.';
  } else if (detail.length < 10) {
    errors.detail = 'Detail alamat terlalu singkat (minimal 10 karakter).';
  }

  if (draft.postalCode) {
    const cleanZip = draft.postalCode.trim();
    if (!POSTAL_CODE_REGEX.test(cleanZip)) {
      errors.postalCode = 'Kode pos harus 5 digit angka.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates body measurements (bust, waist, hips, height, weight).
 *
 * @param {{ bust?: number, waist?: number, hips?: number, height?: number, weight?: number }} measurements
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateMeasurements(measurements = {}) {
  const errors = {};

  const checkNumericRange = (field, label, min, max) => {
    const val = measurements[field];
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (Number.isNaN(num) || num < min || num > max) {
        errors[field] = `${label} harus antara ${min} dan ${max} cm.`;
      }
    }
  };

  checkNumericRange('bust', 'Lingkar dada', 40, 220);
  checkNumericRange('waist', 'Lingkar pinggang', 40, 220);
  checkNumericRange('hips', 'Lingkar pinggul', 40, 240);
  checkNumericRange('height', 'Tinggi badan', 100, 230);

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
