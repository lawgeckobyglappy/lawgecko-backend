import { Assessment, AssessmentInput } from '../../types';
import { assessmentRepository } from '../../repositories/assessment';
export { publishAssessment };

type Props = {
  id: Assessment['_id'];
};

const publishAssessment = async ({ id }: Props) => {
  const assessment = assessmentRepository.updateOne(
    { assessment: id },
    { published: true },
  );

  return { data: assessment };
};
