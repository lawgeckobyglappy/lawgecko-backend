import { User } from '@types';
import { config } from '@config';

import { sendMail } from '../sendMail';
import { renderLoginTemplate } from './login-template';

export { sendLoginLinkEmail };

export type LoginLinkProps = {
  linkId: string;
  user: User;
};

const { FRONTEND_URL, LOGIN_LINK_EXPIRATION_MINUTES } = config;

function sendLoginLinkEmail({ user, linkId }: LoginLinkProps) {
  const { email, firstName } = user;

  const loginLink = `${FRONTEND_URL}/verify-link/?id=${linkId}`;

  const html = renderLoginTemplate({firstName, loginLink});

  return sendMail({
    from: 'accounts',
    to: email,
    subject: 'Login link',
    html,
  });
}
