import { config } from '@config';
import { sendMail } from '../sendMail';

export { sendSecurityAdminWelcomeEmail };

export type securityAdminWelcomeProps = {
  email: string;
  password: string;
};

const { FRONTEND_URL } = config;

function sendSecurityAdminWelcomeEmail({
  email,
  password,
}: securityAdminWelcomeProps) {
  const link = `${FRONTEND_URL}`;

  const html = `
          <html>
               <head>
                    <title>Welcome New Security Admin!</title>
               </head>
               <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <p style="font-size: 18px; margin-bottom: 10px;">Your details to become a Security Admin have been accepted!</p>
                    <p style="font-size: 16px; margin-bottom: 10px;">Your Law Gecko email: <b>${email}</b></p>
                    <p style="font-size: 16px; margin-bottom: 10px;">Your Law Gecko password: <b>${password}</b></p>
                    <p style="font-size: 16px; margin-bottom: 20px;">
                        <a href="${link}" style="color: #007bff; text-decoration: none;"><button>Login Here</button></a>
                    </p>
                    <p style="font-size: 16px;">Regards,</p>
                    <p style="font-size: 16px;">Lawgecko Team</p>
               </body>
          </html>
       `;

  return sendMail({
    from: 'accounts',
    to: email,
    subject: 'Security Admin Welcome',
    html,
  });
}
