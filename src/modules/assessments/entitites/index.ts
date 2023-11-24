import Schema from 'clean-schema';
import { generateId, getSlug } from '@utils';

import { Assessment, AssessmentInput, Question, Mcq } from '../types';

export { AssessmentModel };

const AssessmentModel = new Schema<Assessment, AssessmentInput>(
  {
    _id: { constant: true, value: generateId() },
    photo: {
      default: '',
    },
    summary: {
      default: '',
    },
  },
  { setMissingDefaultsOnUpdate: true },
).getModel();
