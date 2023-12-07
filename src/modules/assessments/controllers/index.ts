import {
  createAssessment,
  createQuestion,
  editAssessment,
  getAssessment,
  getAllAssessments,
  publishAssessment,
  getPublishedAssessments,
} from '../services';

import { makeController } from 'src/shared/utils/api';

export { controllers };

const controllers = {
  createAssessment: makeController((req) => createAssessment(req.body), 200),
  publishAssessment: makeController(
    (req) => publishAssessment({ id: req.params.id }),
    200,
  ),
  createQuestion: makeController(
    (req) =>
      createQuestion({
        id: req.params.id,
        values: req.body,
      }),
    200,
  ),
  getAssessment: makeController(
    (req) => getAssessment({ id: req.params.id }),
    200,
  ),
  editAssessment: makeController(
    (req) =>
      editAssessment({
        id: req.params.id,
        values: req.body,
      }),
    200,
  ),
  getAllAssessments: makeController((req) => getAllAssessments(), 200),
  getPublishedAssessments: makeController(
    (req) => getPublishedAssessments(),
    200,
  ),
};
