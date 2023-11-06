import { add } from 'date-fns';
import Schema from 'clean-schema';

import { config } from '@config';
import { generateId } from '@utils';
import { LoginLink, LoginLinkInput } from '@types';

import { validateString } from '../validators';

const { LOGIN_LINK_EXPIRATION_MINUTES } = config;

export { LoginLinkModel };

const LoginLinkModel = new Schema<LoginLinkInput, LoginLink>({
  _id: { constant: true, value: () => generateId().toLowerCase() },
  expiresAt: {
    constant: true,
    value: () => add(new Date(), { minutes: LOGIN_LINK_EXPIRATION_MINUTES }),
  },
  userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
