// ──────────────────────────────────────────────
// RUVA House — Consultation API Endpoint
// POST /api/consultation
// ──────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { validateConsultationForm } from './lib/validation';
import { checkRateLimit } from './lib/rate-limit';
import { buildNotificationEmail, buildAutoReplyEmail } from './lib/email-templates';

// ── Environment ──────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'contact@ruvahouse.com';
const TO_EMAIL = process.env.TO_EMAIL || 'contact@ruvahouse.com';

// ── Allowed origins for CORS & origin validation ──
const ALLOWED_ORIGINS = [
  'https://www.ruvahouse.com',
  'https://ruvahouse.com',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
];

// ── Minimum submission time (ms) to filter bots ──
const MIN_SUBMIT_TIME_MS = 2000;

/**
 * Extract client IP from Vercel request headers.
 */
function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.headers['x-real-ip'] as string || '0.0.0.0';
}

/**
 * Validate the request origin.
 */
function isOriginAllowed(req: VercelRequest): boolean {
  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  // In development, allow if no origin (e.g. Postman, curl)
  if (!origin && !referer) return true;

  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    return true;
  }

  if (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
    return true;
  }

  return false;
}

/**
 * Format a Date to a human-readable timestamp string.
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  });
}

/**
 * Set CORS headers on the response.
 */
function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin as string | undefined;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Main Handler ─────────────────────────────
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers for all responses
  setCorsHeaders(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
    return;
  }

  // ── Check API key is configured ──
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set.');
    res.status(500).json({
      success: false,
      error: 'Email service is not configured. Please contact us directly at contact@ruvahouse.com',
    });
    return;
  }

  // ── Origin validation ──
  if (!isOriginAllowed(req)) {
    res.status(403).json({
      success: false,
      error: 'Request origin not allowed.',
    });
    return;
  }

  // ── Rate limiting ──
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
    res.status(429).json({
      success: false,
      error: `Too many requests. Please try again in ${Math.ceil((rateCheck.retryAfter || 60) / 60)} minutes.`,
    });
    return;
  }

  // ── Parse body ──
  const body = req.body;
  if (!body || typeof body !== 'object') {
    res.status(400).json({
      success: false,
      error: 'Invalid request body.',
    });
    return;
  }

  // ── Honeypot check (silent reject) ──
  if (body._gotcha) {
    // Bot detected — return fake success to avoid revealing the trap
    res.status(200).json({
      success: true,
      message: 'Your consultation request has been submitted successfully.',
    });
    return;
  }

  // ── Timing check ──
  if (body._timestamp) {
    const submitTime = Date.now() - Number(body._timestamp);
    if (submitTime < MIN_SUBMIT_TIME_MS) {
      // Too fast — likely a bot
      res.status(200).json({
        success: true,
        message: 'Your consultation request has been submitted successfully.',
      });
      return;
    }
  }

  // ── Validate & sanitize inputs ──
  const { data, errors } = validateConsultationForm(body);
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: errors[0].message,
      errors,
    });
    return;
  }

  // ── Build emails ──
  const timestamp = formatTimestamp(new Date());
  const notificationHtml = buildNotificationEmail(data, timestamp, clientIp);
  const autoReplyHtml = buildAutoReplyEmail(data.name);

  // ── Send emails via Resend ──
  const resend = new Resend(RESEND_API_KEY);

  try {
    // Send both emails concurrently
    const [notificationResult, autoReplyResult] = await Promise.allSettled([
      // 1. Notification to RUVA
      resend.emails.send({
        from: `RUVA House <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        replyTo: data.email,
        subject: `New Consultation Request — RUVA House`,
        html: notificationHtml,
      }),
      // 2. Auto-reply to customer
      resend.emails.send({
        from: `RUVA House <${FROM_EMAIL}>`,
        to: [data.email],
        subject: `Your Consultation Request has been received — RUVA House`,
        html: autoReplyHtml,
      }),
    ]);

    // Check if the primary notification email was sent
    if (notificationResult.status === 'rejected') {
      console.error('Notification email failed:', notificationResult.reason);
      throw new Error('Failed to send notification email.');
    }

    const notificationValue = notificationResult.value;
    if ('error' in notificationValue && notificationValue.error) {
      console.error('Resend notification error:', notificationValue.error);
      throw new Error('Email delivery failed.');
    }

    // Log auto-reply status (non-critical)
    if (autoReplyResult.status === 'rejected') {
      console.warn('Auto-reply email failed (non-critical):', autoReplyResult.reason);
    } else if ('error' in autoReplyResult.value && autoReplyResult.value.error) {
      console.warn('Auto-reply Resend error (non-critical):', autoReplyResult.value.error);
    }

    // ── Success response ──
    res.status(200).json({
      success: true,
      message: 'Your consultation request has been submitted successfully. Our team will contact you shortly.',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'We were unable to send your request. Please try again or contact us directly at contact@ruvahouse.com',
    });
  }
}
