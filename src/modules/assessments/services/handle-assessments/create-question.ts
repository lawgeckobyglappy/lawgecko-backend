import { handleError } from '@utils';

import { Assessment, QuestionInput } from '../../types';
import { QuestionModel } from '../../entitites';
import { questionRepository } from '../../repositories/question';
import { assessmentRepository } from '../../repositories/assessment';
export { createQuestion };

type Props = {
  id: Assessment['_id'];
  values: Partial<QuestionInput>;
};

const createQuestion = async ({ id, values }: Props) => {
  let assessment = await assessmentRepository.findById(id);
  if (!assessment) {
    return {
      error: {
        message: 'Assessment ID could not be found!',
        payload: {},
        statusCode: 400,
      },
    };
  }

  if (values.answerType == 'mcq' && !values.options) {
    return {
      error: {
        message: 'mcq question has no options!',
        payload: {},
        statusCode: 400,
      },
    };
  }

  if (values.answerType == 'scale') {
    if (!values.startNumber) {
      return {
        error: {
          message: 'No startNumber provided',
          payload: {},
          statusCode: 400,
        },
      };
    }
    if (!values.endNumber) {
      return {
        error: {
          message: 'No endNumber provided',
          payload: {},
          statusCode: 400,
        },
      };
    }
    if (!values.step) {
      return {
        error: {
          message: 'No step provided',
          payload: {},
          statusCode: 400,
        },
      };
    }
  }

  const { data, error } = await QuestionModel.create({
    ...values,
    assessment: id,
  });

  if (error) return handleError(error);

  if (data?.answerType == 'tf') {
    data!.options = ['true', 'false'];
  }

  const question = await questionRepository.insertOne(data);
  return { data: question };
};
