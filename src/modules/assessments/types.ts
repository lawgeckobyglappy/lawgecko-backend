import { type FileInfo } from 'apitoolz';

export { AssessmentInput, Assessment, Question, Mcq };

type AssessmentInput = {
  photo?: FileInfo;
  summary?: string;
};

type Assessment = {
  _id: string;
  photo?: string;
  summary?: string;
};

type Question = {
  assessment: Assessment;
  _id: string;
  questionText: string;
  answerType: string;
  options?: Array<Mcq>;
};

type Mcq = {
  _id: string;
  value: string;
};

/*
The idea:
1. If the Question is type: "free", then the frontend already knows that it should be a text input field
2. If the Question is type: "mcq" (multiple choice question), then the backend will send all mcq's that belong to that question
3. If the Question is type: "true/false", then the frontend already knows that the "answers" are just True/False
*/
