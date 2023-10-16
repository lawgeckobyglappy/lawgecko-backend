import { scheduler } from '@config';
import { LoginLinkProps, sendLoginLinkEmail } from '@utils';

export { triggerSendLoginLinkEmail };

const tasks = {
  AUTH_SEND_LOGIN_LINK: 'AUTH_SEND_LOGIN_LINK',
};

function triggerSendLoginLinkEmail(payload: LoginLinkProps) {
  scheduler.now(tasks.AUTH_SEND_LOGIN_LINK, payload);
}

scheduler.define(
  tasks.AUTH_SEND_LOGIN_LINK,
  (job) => sendLoginLinkEmail(job.attrs.data),
  { priority: 'highest' },
);
