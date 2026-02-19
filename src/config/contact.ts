/**
 * Contact Configuration
 *
 * Customize your contact details and EmailJS settings here.
 * For EmailJS setup: https://www.emailjs.com/docs/
 *
 * EmailJS Template variables used by the form:
 *   {{from_name}}, {{from_email}}, {{subject}}, {{message}}, {{to_email}}
 *
 * Steps:
 * 1. Create an EmailJS account at https://www.emailjs.com/
 * 2. Add an email service (Gmail, Outlook, etc.)
 * 3. Create an email template with the variables above
 * 4. Get your Service ID, Template ID, and Public Key from the dashboard
 */

export const contactConfig = {
  /** Your email address for mailto: links */
  email: "Misbahsakin1@gmail.com",
  
  /** WhatsApp QR link or number - opens chat via wa.me */
  whatsappLink: "https://wa.me/qr/W5PEBGA46PW4F1",
  
  /** Telegram username (without @) - opens chat via t.me */
  telegramUsername: "misbahsakin",
  
  /** Email address where form submissions will be sent */
  formRecipientEmail: "Misbahsakin1@gmail.com",
};

/** EmailJS configuration - replace with your own credentials */
export const emailJsConfig = {
  serviceId: "service_918yb0u",
  templateId: "template_kh2qwfu",
  publicKey: "x-j2bnlJjKZrJ4TB-",
};
