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
  questionText: string;
  answerType: string;
  required: boolean;

  assessment: string; // reference to Assessment._id
};

type Question = {
  _id: string;
  questionText: string;
  answerType: string;
  required: boolean;
  options: Array<string>;

  assessment: string; // reference to Assessment._id
};

/*
The idea:
1. If the Question is type: "free", then the frontend already knows that it should be a text input field
2. If the Question is type: "mcq" (multiple choice question), then the backend will send all mcq's that belong to that question
3. If the Question is type: "true/false", then the frontend already knows that the "answers" are just True/False
*/
