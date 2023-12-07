import { AuthInfo } from '@types';

import { handleError } from '@utils';
import { handleAuthError } from '@utils';

import { assessmentRepository } from '../../repositories/assessment';

export { getPublishedAssessments };

const getPublishedAssessments = async () => {
  const assessments = await assessmentRepository.find({ published: true });

  return {
    data: {
      assessments,
    },
  };
};
