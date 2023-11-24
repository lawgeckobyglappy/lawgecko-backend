import { AuthInfo } from '@types';

import { handleError } from '@utils';
import { handleAuthError } from '@utils';

import { assessmentRepository } from '../../repositories/assessment';

export { getAssessment };

const getAssessment = async ({ assessment: { _id } }: any) => {
  const assessment = 5;
  return { data: assessment };
};
