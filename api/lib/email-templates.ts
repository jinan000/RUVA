import { ConsultationData } from './validation';

/**
 * Build the plain-text admin notification email
 */
export function buildNotificationEmail(data: ConsultationData, timestamp: string): string {
  const extraDetails = [
    data.occasion ? `Occasion: ${data.occasion}` : '',
    data.eventDate ? `Event Date: ${data.eventDate}` : '',
    data.piece ? `Preferred Piece: ${data.piece}` : ''
  ].filter(Boolean).join('\n');

  const fullMessage = extraDetails 
    ? `${extraDetails}\n\n${data.message || ''}`.trim()
    : (data.message || 'No additional message provided.');

  return `---------------------------------------
New Website Enquiry

Name:
${data.name}

Email:
${data.email}

Phone:
${data.phone}

Subject:
${data.subject || 'Consultation Request'}

Message:
${fullMessage}

Submitted At:
${timestamp}
---------------------------------------`;
}

/**
 * Build the plain-text auto-reply confirmation email
 */
export function buildAutoReplyEmail(name: string): string {
  return `Dear ${name},

Thank you for contacting RUVA House.

We have successfully received your enquiry. Our team will review your message and get back to you as soon as possible.

Kind Regards,
RUVA House`;
}
