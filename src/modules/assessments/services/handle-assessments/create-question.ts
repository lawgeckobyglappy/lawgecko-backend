import { handleError } from '@utils';

import { Assessment, QuestionInput } from '../../types';
import { AssessmentModel } from '../../entitites';
import { assessmentRepository } from '../../repositories/assessment';
export { createQuestion };

type Props = {
  id: Assessment['_id'];
  values: Partial<QuestionInput>;
};

const createQuestion = async ({ id, values }: Props) => {
  const { data, error } = await QuestionModel.create({
    ...values,
  });

  if (error) return handleError(error);

  const assessment = await assessmentRepository.insertOne(data);
  return { data: assessment };
};
