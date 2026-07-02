// ──────────────────────────────────────────────
// RUVA House — Input Validation & Sanitization
// ──────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export interface ConsultationData {
  name: string;
  phone: string;
  email: string;
  occasion: string;
  eventDate: string;
  piece: string;
  message: string;
}

/**
 * Strip HTML tags and trim whitespace from a string.
 * Prevents XSS and cleans up user input.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')   // Remove HTML tags
    .replace(/&lt;/g, '<')      // Decode common entities for re-sanitization
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, '')   // Second pass after decode
    .trim();
}

/**
 * Validate email format using a robust regex.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number — allows international formats.
 * Permits: digits, spaces, hyphens, plus sign, parentheses.
 * Minimum 7 digit characters.
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^\d{7,15}$/.test(cleaned);
}

/**
 * Valid jewellery piece options.
 */
const VALID_PIECES = [
  'Bespoke Ring',
  'Necklace',
  'Earrings',
  'Full Bridal Set',
  'Other',
];

/**
 * Validate and sanitize all consultation form fields.
 * Returns sanitized data and an array of validation errors.
 */
export function validateConsultationForm(body: Record<string, unknown>): {
  data: ConsultationData;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  const name = sanitizeInput(body.name);
  const phone = sanitizeInput(body.phone);
  const email = sanitizeInput(body.email);
  const occasion = sanitizeInput(body.occasion);
  const eventDate = sanitizeInput(body.eventDate);
  const piece = sanitizeInput(body.piece);
  const message = sanitizeInput(body.message);

  // Required fields
  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: 'Full name is required (minimum 2 characters).' });
  }
  if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be under 100 characters.' });
  }

  if (!phone) {
    errors.push({ field: 'phone', message: 'Phone number is required.' });
  } else if (!validatePhone(phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number (7-15 digits).' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (!piece) {
    errors.push({ field: 'piece', message: 'Please select a preferred jewellery piece.' });
  } else if (!VALID_PIECES.includes(piece)) {
    errors.push({ field: 'piece', message: 'Invalid jewellery piece selection.' });
  }

  // Optional fields — just length checks
  if (occasion && occasion.length > 200) {
    errors.push({ field: 'occasion', message: 'Occasion must be under 200 characters.' });
  }
  if (eventDate && eventDate.length > 100) {
    errors.push({ field: 'eventDate', message: 'Event date must be under 100 characters.' });
  }
  if (message && message.length > 2000) {
    errors.push({ field: 'message', message: 'Design vision notes must be under 2000 characters.' });
  }

  return {
    data: { name, phone, email, occasion, eventDate, piece, message },
    errors,
  };
}
