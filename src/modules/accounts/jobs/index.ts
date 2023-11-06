import { scheduler } from '@config';
import {
  LoginLinkProps,
  securityAdminInvitationProps,
  sendLoginLinkEmail,
  sendSecurityAdminInvitationEmail,
} from '@utils';
import { deleteSecurityAdminInvitation } from '../services';

export {
  tasks,
  triggerSendLoginLinkEmail,
  triggerSendSecurityAdminInvitationEmail,
};

const tasks = {
  AUTH_SEND_LOGIN_LINK: 'AUTH_SEND_LOGIN_LINK',
  DELETE_EXPIRED_SECURITY_ADMIN_INVITATION:
    'DELETE_EXPIRED_SECURITY_ADMIN_INVITATION',
  SECURITY_ADMIN_INVITATION: 'SECURITY_ADMIN_INVITATION',
};

function triggerSendLoginLinkEmail(payload: LoginLinkProps) {
  scheduler.now(tasks.AUTH_SEND_LOGIN_LINK, payload);
}

function triggerSendSecurityAdminInvitationEmail(
  payload: securityAdminInvitationProps,
) {
  scheduler.now(tasks.SECURITY_ADMIN_INVITATION, payload);
}

scheduler.define(
  tasks.AUTH_SEND_LOGIN_LINK,
  (job) => sendLoginLinkEmail(job.attrs.data),
  { priority: 'highest' },
);

scheduler.define(tasks.DELETE_EXPIRED_SECURITY_ADMIN_INVITATION, (job) =>
  deleteSecurityAdminInvitation(job.attrs.data),
);

scheduler.define(
  tasks.SECURITY_ADMIN_INVITATION,
  (job) => sendSecurityAdminInvitationEmail(job.attrs.data),
  { priority: 'highest' },
);
