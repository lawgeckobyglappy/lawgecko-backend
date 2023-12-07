import { Schema, model } from 'mongoose';

import { Question } from '../../types';

export { dbModel };

const questionSchema = new Schema<Question>(
  {
    _id: { type: String, required: true },
    answerType: { type: String, required: true },
    options: { type: [String] },
    questionText: { type: String, required: true },
    required: { type: Boolean, required: true },
    assessment: { type: String, required: true },
    startNumber: { type: Number },
    endNumber: { type: Number },
    step: { type: Number },
  },
  { timestamps: true },
);

const dbModel = model('question', questionSchema);
