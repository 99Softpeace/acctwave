import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.warn('RESEND_API_KEY is missing in environment variables.');
}

export const resend = new Resend(apiKey || 're_123456789'); // Fallback to prevent crash on init, but send will fail

export async function sendEmail(to: string | string[], subject: string, html: string, bcc?: string | string[]) {
    try {
        const data = await resend.emails.send({
            from: 'Acctwave <info@acctwave.com>', // Verified Domain
            to: to,
            bcc: bcc,
            subject: subject,
            html: html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Resend Email Error:', error);
        return { success: false, error };
    }
}
