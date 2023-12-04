import { handleError } from '@utils';

import { Assessment, QuestionInput } from '../../types';
import { QuestionModel } from '../../entitites';
import { questionRepository } from '../../repositories/question';
export { createQuestion };

type Props = {
  id: Assessment['_id'];
  values: Partial<QuestionInput>;
};

const createQuestion = async ({ id, values }: Props) => {
  const { data, error } = await QuestionModel.create({
    ...values,
    assessment: id,
  });

  if (error) return handleError(error);

  const assessment = await questionRepository.insertOne(data);
  return { data: assessment };
};
