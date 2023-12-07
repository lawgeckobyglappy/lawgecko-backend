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
