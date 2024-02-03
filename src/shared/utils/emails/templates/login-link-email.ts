import { config } from '@config';

import { sendMail } from '../sendMail';

export { sendLoginLinkEmail };

export type LoginLinkProps = {
  email: string;
  firstName: string;
  linkId: string;
};

const { FRONTEND_URL, LOGIN_LINK_EXPIRATION_MINUTES } = config;

function sendLoginLinkEmail({ email, firstName, linkId }: LoginLinkProps) {
  const link = `${FRONTEND_URL}/verify-link/?id=${linkId}`;

  const html = `
          <html>
               <head>
                    <title>Login Link Email</title>
               </head>
               <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <p style="font-size: 18px; margin-bottom: 10px;">Hi ${firstName},</p>
                    <p style="font-size: 16px; margin-bottom: 10px;">Use the link below to log into your account:</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">
                    <a href="${link}" style="color: #007bff; text-decoration: none;"><button>Login</button></a>
                    </p>
                    <p style="font-size: 16px; margin-bottom: 20px;">Please hurry, the link will expire in ${LOGIN_LINK_EXPIRATION_MINUTES} minutes.</p>
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
