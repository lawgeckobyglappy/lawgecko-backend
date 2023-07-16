import { User } from 'shared/types';
import { sendMail } from '../sendMail';

export { sendOTPEmail };

type Props = {
	code: string;
	user: User;
};

function sendOTPEmail({ user, code }: Props) {
	const { email, firstName } = user;

	const text = `
    <html>
        <body>
            Hi ${firstName},
            
            Use the code below to log into your account.

            <span style='font-size: 20px; font-weight: 400'>${code}</span>
        
            Please hurry, the code will expired shortly.
        
            Regards,
            Lawgecko Team
        </body>
    </html>`;

	return sendMail({ from: 'support', to: email, subject: 'Login Code', text });
}
