// ──────────────────────────────────────────────
// RUVA House — Premium HTML Email Templates
// ──────────────────────────────────────────────

import { ConsultationData } from './validation';

// RUVA Brand Colors
const COLORS = {
  bgDeep: '#110E08',
  bgSurface: '#1A1510',
  bgSurfaceLight: '#2A2016',
  textPrimary: '#F0E4C8',
  textSecondary: '#C8B898',
  accent: '#B8844A',
  accentHover: '#E2C99A',
  bgVoid: '#0D0A06',
  white: '#FFFFFF',
  divider: '#3A3020',
};

/**
 * Build the admin notification email — sent to contact@ruvahouse.com
 * when a new consultation request comes in.
 */
export function buildNotificationEmail(data: ConsultationData, timestamp: string, ip?: string): string {
  const rows = [
    { label: 'Full Name', value: data.name },
    { label: 'Phone / WhatsApp', value: data.phone },
    { label: 'Email Address', value: `<a href="mailto:${data.email}" style="color: ${COLORS.accent}; text-decoration: none;">${data.email}</a>` },
    { label: 'Occasion', value: data.occasion || '—' },
    { label: 'Event Date', value: data.eventDate || '—' },
    { label: 'Preferred Piece', value: data.piece },
  ];

  const tableRows = rows.map(row => `
    <tr>
      <td style="padding: 14px 20px; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${COLORS.textSecondary}; width: 160px; vertical-align: top; border-bottom: 1px solid ${COLORS.divider};">
        ${row.label}
      </td>
      <td style="padding: 14px 20px; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.textPrimary}; border-bottom: 1px solid ${COLORS.divider};">
        ${row.value}
      </td>
    </tr>
  `).join('');

  const designVisionSection = data.message ? `
    <div style="margin-top: 28px;">
      <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${COLORS.textSecondary}; margin: 0 0 12px 0;">
        Design Vision / Notes
      </p>
      <div style="background-color: ${COLORS.bgSurfaceLight}; padding: 20px; border-left: 3px solid ${COLORS.accent}; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: ${COLORS.textPrimary};">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Consultation Request — RUVA House</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.bgDeep}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.bgDeep};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <img src="https://www.ruvahouse.com/img/logo.png" alt="RUVA House" width="120" style="display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: ${COLORS.bgSurface}; border: 1px solid ${COLORS.divider};">

              <!-- Header Banner -->
              <div style="background: linear-gradient(135deg, ${COLORS.bgSurfaceLight} 0%, ${COLORS.bgSurface} 100%); padding: 36px 32px 28px; border-bottom: 1px solid ${COLORS.divider};">
                <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 400; color: ${COLORS.textPrimary}; margin: 0 0 8px 0; letter-spacing: 0.02em;">
                  New Consultation Request
                </h1>
                <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 13px; color: ${COLORS.textSecondary}; margin: 0; letter-spacing: 0.03em;">
                  Received on ${timestamp}
                </p>
              </div>

              <!-- Customer Details Table -->
              <div style="padding: 28px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${tableRows}
                </table>

                ${designVisionSection}
              </div>

              <!-- Metadata Footer -->
              <div style="padding: 16px 32px; background-color: ${COLORS.bgVoid}; border-top: 1px solid ${COLORS.divider};">
                <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; color: ${COLORS.textSecondary}; margin: 0; opacity: 0.7;">
                  Submitted via ruvahouse.com contact form${ip ? ` · IP: ${ip}` : ''}
                </p>
              </div>

            </td>
          </tr>

          <!-- Quick Actions -->
          <tr>
            <td align="center" style="padding: 28px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="mailto:${data.email}?subject=Re: Your Consultation Request — RUVA House" style="display: inline-block; padding: 12px 28px; background-color: ${COLORS.accent}; color: ${COLORS.bgDeep}; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; border-radius: 0;">
                      Reply to Customer
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://wa.me/${data.phone.replace(/[\s\-\(\)\+]/g, '')}" style="display: inline-block; padding: 12px 28px; border: 1px solid ${COLORS.accent}; color: ${COLORS.accent}; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; border-radius: 0;">
                      WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 0 0;">
              <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; color: ${COLORS.textSecondary}; margin: 0; opacity: 0.5;">
                © ${new Date().getFullYear()} RUVA House · Bespoke Bridal Jewellery
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build the auto-reply confirmation email — sent to the customer
 * after they submit a consultation request.
 */
export function buildAutoReplyEmail(name: string): string {
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Consultation Request has been received — RUVA House</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.bgDeep}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.bgDeep};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 0 0 36px 0;">
              <img src="https://www.ruvahouse.com/img/logo.png" alt="RUVA House" width="140" style="display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: ${COLORS.bgSurface}; border: 1px solid ${COLORS.divider};">

              <!-- Decorative Gold Line -->
              <div style="height: 3px; background: linear-gradient(90deg, transparent 0%, ${COLORS.accent} 30%, ${COLORS.accentHover} 50%, ${COLORS.accent} 70%, transparent 100%);"></div>

              <!-- Content -->
              <div style="padding: 48px 40px;">

                <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 400; color: ${COLORS.textPrimary}; margin: 0 0 32px 0; letter-spacing: 0.02em; line-height: 1.3;">
                  Thank You, ${firstName}
                </h1>

                <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.8; color: ${COLORS.textSecondary}; margin: 0 0 20px 0;">
                  Dear ${name},
                </p>

                <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.8; color: ${COLORS.textSecondary}; margin: 0 0 20px 0;">
                  Thank you for contacting RUVA House.
                </p>

                <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.8; color: ${COLORS.textSecondary}; margin: 0 0 20px 0;">
                  We have received your consultation request successfully. Our design team will review your submission and contact you shortly to discuss your bespoke jewellery requirements.
                </p>

                <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.8; color: ${COLORS.textSecondary}; margin: 0 0 6px 0;">
                  Warm regards,
                </p>

                <!-- Signature -->
                <div style="margin-top: 28px; padding-top: 28px; border-top: 1px solid ${COLORS.divider};">
                  <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: ${COLORS.textPrimary}; margin: 0 0 4px 0;">
                    RUVA House
                  </p>
                  <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; color: ${COLORS.textSecondary}; margin: 0 0 4px 0; letter-spacing: 0.05em;">
                    Bespoke Bridal Jewellery
                  </p>
                  <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; margin: 8px 0 0 0;">
                    <a href="https://www.ruvahouse.com" style="color: ${COLORS.accent}; text-decoration: none;">www.ruvahouse.com</a>
                    <span style="color: ${COLORS.divider}; margin: 0 8px;">·</span>
                    <a href="mailto:contact@ruvahouse.com" style="color: ${COLORS.accent}; text-decoration: none;">contact@ruvahouse.com</a>
                  </p>
                </div>

              </div>

              <!-- Decorative Gold Line -->
              <div style="height: 3px; background: linear-gradient(90deg, transparent 0%, ${COLORS.accent} 30%, ${COLORS.accentHover} 50%, ${COLORS.accent} 70%, transparent 100%);"></div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 28px 0 0;">
              <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; color: ${COLORS.textSecondary}; margin: 0 0 8px 0; opacity: 0.5;">
                © ${new Date().getFullYear()} RUVA House · All rights reserved
              </p>
              <p style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; color: ${COLORS.textSecondary}; margin: 0; opacity: 0.4;">
                This is an automated confirmation. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
