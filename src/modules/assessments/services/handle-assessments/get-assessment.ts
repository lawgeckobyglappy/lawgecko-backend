import { AuthInfo } from '@types';

import { handleError } from '@utils';
import { handleAuthError } from '@utils';

import { assessmentRepository } from '../../repositories/assessment';
import { questionRepository } from '../../repositories/question';

export { getAssessment };

type Props = {
  id: string;
};

const getAssessment = async ({ id }: Props) => {
  const assessment = await assessmentRepository.findById(id);

  const questions = await questionRepository.find({ assessment: id });
  return {
    data: {
      assessment,
      questions,
    },
  };
};
