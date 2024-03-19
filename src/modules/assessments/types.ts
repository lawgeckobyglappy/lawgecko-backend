import { type FileInfo } from 'apitoolz';

export {
  AssessmentInput,
  Assessment,
  AssessmentInputAlias,
  QuestionInput,
  Question,
};

type AssessmentInputAlias = {
  image?: FileInfo;
};

type AssessmentInput = {
  description?: string;
  title: string;
  published: boolean;

  _image?: FileInfo;
};

type Assessment = {
  _id: string;
  image?: string;
  description?: string;
  title: string;
  published: boolean;
};

type QuestionInput = {
  answerType: string;
  options?: Array<string>;
  questionText: string;
  required?: boolean;
  startNumber?: number;
  endNumber?: number;
  step?: number;

  assessment: string; // reference to Assessment._id
};

type Question = {
  _id: string;
  answerType: string;
  options: Array<string>;
  questionText: string;
  required: boolean;
  startNumber: number;
  endNumber: number;
  step: number;

  assessment: string; // reference to Assessment._id
};

/*
The idea:
1. If the Question is type: "free", then the frontend already knows that it should be a text input field
2. If the Question is type: "mcq" (multiple choice question), then the backend will send all mcq's that belong to that question
3. If the Question is type: "true/false", then the frontend already knows that the "answers" are just True/False
*/
