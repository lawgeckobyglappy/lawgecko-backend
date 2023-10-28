import { Agenda } from '@hokify/agenda';

import config from './env';

export { scheduler };

const scheduler = new Agenda({
  db: config.currentDeployment.isTest
    ? undefined
    : // @ts-ignore
      { address: config.db.dbURI, collection: '__scheduler-jobs__' },
});
