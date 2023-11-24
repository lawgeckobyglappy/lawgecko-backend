import { Schema, model } from 'mongoose';

import { Assessment } from '../../types';

export { dbModel };

const assessmentSchema = new Schema<Assessment>(
  {
    _id: { type: String, required: true },
    photo: { type: String },
    summary: { type: String },
  },
  { timestamps: true },
);

const dbModel = model('assessments', assessmentSchema);
