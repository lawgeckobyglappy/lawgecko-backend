import { createAssessment, createQuestion, getAssessment } from '../services';

import { makeController } from 'src/shared/utils/api';

export { controllers };

const controllers = {
  createAssessment: makeController((req) => createAssessment(req.body), 200),
  createQuestion: makeController(
    (req) =>
      createQuestion({
        id: req.params.id,
        values: req.body,
      }),
    200,
  ),
  getAssessment: makeController((req) => getAssessment({})),
};
