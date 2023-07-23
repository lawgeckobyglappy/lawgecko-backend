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

	const link = `${config.frontendUrl}/${linkId}`;

	const text = `
            Hi ${firstName},
            
            Use the link below to log into your account.

            <a href="${link}">${link}</a>
        
            Please hurry, the link will expired shortly.
        
            Regards,
            Lawgecko Team
       `;

	return sendMail({ from: 'support', to: email, subject: 'Login link', text });
}
