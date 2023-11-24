import { createAssessment, getAssessment } from '../services';

import { makeController } from 'src/shared/utils/api';

export { controllers };

const controllers = {
  createAssessment: makeController((req) => createAssessment(req.body), 200),
  getAssessment: makeController((req) => getAssessment({})),
};
