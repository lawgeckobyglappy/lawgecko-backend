import { Agenda } from '@hokify/agenda';

import config from './env';
import { logger } from '@shared';

export { scheduler };

const scheduler = new Agenda(
  {
    db: config.currentDeployment.isTest
      ? undefined
      : // @ts-ignore
        { address: config.db.dbURI, collection: '__scheduler-jobs__' },
  },
  // callback removes old successful jobs
  (err) => {
    if (err) logger.error(err);

    scheduler.emit('ready');
    scheduler.cancel({ nextRunAt: null });
  },
);
