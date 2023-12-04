import { handleError } from '@utils';

import { Assessment, AssessmentInput } from '../../types';
import { assessmentRepository } from '../../repositories/assessment';
export { editAssessment };

type Props = {
  id: Assessment['_id'];
  values: Partial<AssessmentInput>;
};

const editAssessment = async ({ id, values }: Props) => {
  const assessment = assessmentRepository.updateOne(
    { assessment: id },
    { ...values },
  );

  return { data: assessment };
};
