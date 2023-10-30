import { User } from '@types';
import { config } from '@config';
import { sendMail } from '../sendMail';
import { emailLayoutTemplate } from './layout';

export { renderLoginTemplate };

export type LoginTemplateProps = {
     loginLink: string;
  firstName: User['firstName'];
};

const { FRONTEND_URL, LOGIN_LINK_EXPIRATION_MINUTES } = config;

function renderLoginTemplate({ firstName, loginLink }: LoginTemplateProps) {

  const link = `${FRONTEND_URL}/verify-link/?id=${loginLink}`;

  return emailLayoutTemplate('<div>LawGecko</div>',` 
                    <p style="font-size: 18px; margin-bottom: 10px;">Hi ${firstName},</p>
                    <p style="font-size: 16px; margin-bottom: 10px;">Use the link below to log into your account:</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">
                    <a href="${link}" style="color: #007bff; text-decoration: none;"><button>Login</button></a>
                    </p>
                    <p style="font-size: 16px; margin-bottom: 20px;">Please hurry, the link will expire in ${LOGIN_LINK_EXPIRATION_MINUTES} minutes.</p>
                    <p style="font-size: 16px;">Regards,</p>
                    <p style="font-size: 16px;">Lawgecko Team</p>
       `);

}
