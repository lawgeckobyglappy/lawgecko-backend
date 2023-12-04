import Schema from 'clean-schema';
import { generateId, getSlug } from '@utils';

import {
  Assessment,
  AssessmentInput,
  AssessmentInputAlias,
  QuestionInput,
  Question,
} from '../types';
import { validateString } from 'src/shared/validators';
import { handleFileUpload, handleFailure, getFolderOnServer } from './utils';
import { validateProfilePicture } from 'src/modules/accounts/validators';

export { AssessmentModel, QuestionModel };

const AssessmentModel = new Schema<
  AssessmentInput,
  Assessment,
  AssessmentInputAlias
>(
  {
    _id: { constant: true, value: generateId() },
    description: {
      default: '',
    },
    title: {
      default: '',
      validator: validateString('', { minLength: 1, maxLength: 30 }),
    },
    image: {
      default: '',
      dependsOn: '_image',
      resolver: ({ context: { _image } }) => _image.path,
    },
    _image: {
      alias: 'image',
      virtual: true,
      onFailure: handleFailure('_image'),
      sanitizer: handleFileUpload('_image'),
      validator: validateProfilePicture,
    },
  },
  { setMissingDefaultsOnUpdate: true },
).getModel();

const QuestionModel = new Schema<QuestionInput, Question>({
  _id: { constant: true, value: generateId() },
  options: {
    default: [],
  },
  questionText: {
    default: '',
    validator: validateString('', { minLength: 1, maxLength: 200 }),
  },
  required: {
    default: true,
  },
  assessment: {
    default: '',
  },
  startNumber: {
    default: 0,
  },
  endNumber: {
    default: 0,
  },
  step: {
    default: 0,
  },
}).getModel();