import dayjs from 'dayjs';
import Schema from 'clean-schema';

import config from '@config/env';
import { generateId } from '@utils';
import { LoginLink, LoginLinkInput } from '@types';

import { validateString } from '../validators';

const { LOGIN_LINK_EXPIRATION_MINUTES } = config;

export { LoginLinkModel };

const LoginLinkModel = new Schema<LoginLinkInput, LoginLink>({
  _id: { constant: true, value: () => generateId().toLowerCase() },
  expiresAt: {
    constant: true,
    value: () =>
      dayjs(new Date()).add(LOGIN_LINK_EXPIRATION_MINUTES, 'minutes').toDate(),
  },
  userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
