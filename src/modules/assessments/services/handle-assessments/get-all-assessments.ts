import { assessmentRepository } from '../../repositories/assessment';

export { getAllAssessments };

const getAllAssessments = async () => {
  const assessments = await assessmentRepository.find();

  return {
    data: {
      assessments,
    },
  };
};
