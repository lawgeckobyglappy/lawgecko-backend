import nodemailer from 'nodemailer';

import config from '@config/env';

import { logger } from '../../logger';

const { emails, environment } = config;

export { sendMail };

// emails could be sent from: accounts, posts, support, etc
type EmailAccount = 'accounts';

type MailProps = {
  from: EmailAccount;
  to: string | string[];
  subject: string;
  html?: string;
};

function getSender(name: EmailAccount) {
  const { user, password, service } = (emails as any)?.[name] ?? emails.default;
  return { user, password, service };
}

const sendMail = async ({
  from,
  to = '',
  subject = '',
  html = '',
}: MailProps) => {
  if (environment !== 'production') {
    if (environment == 'development') logger.info({ from, to, subject, html });

    return;
  }

  if (!Array.isArray(to)) to = [to];
  const { user, password, service } = getSender(from);

  try {
    await nodemailer
      .createTransport({
        service,
        auth: { user, pass: password },
      })
      .sendMail({
        from: user,
        to: Array.from(new Set(to)).join(','), // making sure we don't send the same mail to the same person more than once
        subject,
        html,
      });
  } catch (err) {
    logger.error(err);
  }
};
