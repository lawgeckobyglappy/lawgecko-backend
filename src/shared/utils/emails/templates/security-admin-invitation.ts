import { config } from '@config';

import { sendMail } from '../sendMail';

export { sendSecurityAdminInvitationEmail };

export type securityAdminInvitationProps = {
  email: string;
  name: string;
  token: string;
};

const { FRONTEND_URL, SECURITY_ADMIN_INVITATION_EXPIRATION_MINUTES } = config;

function sendSecurityAdminInvitationEmail({
  email,
  name,
  token,
}: securityAdminInvitationProps) {
  const link = `${FRONTEND_URL}/admin/new/info/?t=${token}`;

  const html = `
          <html>
               <head>
                    <title>Security Admin Invitation</title>
               </head>
               <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <p style="font-size: 18px; margin-bottom: 10px;">Hi ${name},</p>
                    <p style="font-size: 16px; margin-bottom: 10px;">You have been invited to join the Lawgecko team as a Security Admin. Use this link to provide your details:</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">
                    <a href="${link}" style="color: #007bff; text-decoration: none;"><button>Login</button></a>
                    </p>
                    <p style="font-size: 16px; margin-bottom: 20px;">This invitation expires in ${SECURITY_ADMIN_INVITATION_EXPIRATION_MINUTES} minutes.</p>
                    <p style="font-size: 16px;">Regards,</p>
                    <p style="font-size: 16px;">Lawgecko Team</p>
               </body>
          </html>
       `;

  return sendMail({
    from: 'accounts',
    to: email,
    subject: 'Login link',
    html,
  });
}
