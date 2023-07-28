import config from '../../../../config/env';
import { User } from '../../../types';

import { sendMail } from '../sendMail';

export { sendLoginLinkEmail };

type Options = {
	linkId: string;
	user: User;
};

function sendLoginLinkEmail({ user, linkId }: Options) {
	const { email, firstName } = user;

	const link = `${config.frontendUrl}/verifylink/?id=${linkId}`;

	const html = `
          <html>
               <head>
                    <title>Login Link Email</title>
               </head>
               <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <p style="font-size: 18px; margin-bottom: 10px;">Hi ${firstName},</p>
                    <p style="font-size: 16px; margin-bottom: 10px;">Use the link below to log into your account:</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">
                    <a href="${link}" style="color: #007bff; text-decoration: none;"><button>Verify Email</button></a>
                    </p>
                    <p style="font-size: 16px; margin-bottom: 20px;">Please hurry, the link will expire shortly.</p>
                    <p style="font-size: 16px;">Regards,</p>
                    <p style="font-size: 16px;">Lawgecko Team</p>
               </body>
          </html>
       `;

	return sendMail({
		from: 'ourlawgecko@gmail.com',
		to: email,
		subject: 'Login link',
		html,
	});
}
