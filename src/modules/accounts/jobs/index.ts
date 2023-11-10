import { scheduler } from '@config';
import {
  LoginLinkProps,
  securityAdminInvitationProps,
  securityAdminWelcomeProps,
  sendLoginLinkEmail,
  sendSecurityAdminInvitationEmail,
  sendSecurityAdminWelcomeEmail,
} from '@utils';

export {
  tasks,
  triggerSendLoginLinkEmail,
  triggerSendSecurityAdminInvitationEmail,
  triggerSendSecurityAdminWelcomeEmail,
};

const tasks = {
  AUTH_SEND_LOGIN_LINK: 'AUTH_SEND_LOGIN_LINK',
  SECURITY_ADMIN_INVITATION: 'SECURITY_ADMIN_INVITATION',
  SECURITY_ADMIN_WELCOME: 'SECURITY_ADMIN_WELCOME',
};

function triggerSendLoginLinkEmail(payload: LoginLinkProps) {
  scheduler.now(tasks.AUTH_SEND_LOGIN_LINK, payload);
}

function triggerSendSecurityAdminInvitationEmail(
  payload: securityAdminInvitationProps,
) {
  scheduler.now(tasks.SECURITY_ADMIN_INVITATION, payload);
}

function triggerSendSecurityAdminWelcomeEmail(
  payload: securityAdminWelcomeProps,
) {
  scheduler.now(tasks.SECURITY_ADMIN_WELCOME, payload);
}

scheduler.define(
  tasks.AUTH_SEND_LOGIN_LINK,
  (job) => sendLoginLinkEmail(job.attrs.data),
  { priority: 'highest' },
);

scheduler.define(
  tasks.SECURITY_ADMIN_INVITATION,
  (job) => sendSecurityAdminInvitationEmail(job.attrs.data),
  { priority: 'highest' },
);

scheduler.define(
  tasks.SECURITY_ADMIN_WELCOME,
  (job) => sendSecurityAdminWelcomeEmail(job.attrs.data),
  { priority: 'highest' },
);
