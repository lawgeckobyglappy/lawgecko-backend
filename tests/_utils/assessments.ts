import { assessmentRepository } from '../../src/modules/assessments/repositories/assessment/';

export { addAssessments };

const assessmentList = {
  ASSESSMENT1: {
    _id: '1',
    title: 'First assessment',
    published: false,
  },
  ASSESSMENT2: {
    _id: '2',
    title: 'Second assessment',
    published: false,
  },
  PUB_ASSESSMENT1: {
    _id: 'p1',
    title: 'First published assessment',
    published: true,
  },
  PUB_ASSESSMENT2: {
    _id: 'p2',
    title: 'Second published assessment',
    published: true,
  },
};

function addAssessments() {
  return assessmentRepository.insertMany(Object.values(assessmentList));
}
