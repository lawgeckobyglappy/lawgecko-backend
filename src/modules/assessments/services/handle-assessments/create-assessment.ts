import { handleError } from '@utils';

import { AssessmentInput } from '../../types';
import { AssessmentModel } from '../../entitites';
import { assessmentRepository } from '../../repositories/assessment';

export { createAssessment };

const createAssessment = async (values: Partial<AssessmentInput>) => {
  const { data, error } = await AssessmentModel.create({
    ...values,
  });

  if (error) return handleError(error);

  const assessment = await assessmentRepository.insertOne(data);

  return { data: assessment };
};
