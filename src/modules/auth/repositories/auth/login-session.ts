import { Schema, model } from 'mongoose';

import { LoginSession } from '@types';

export { loginSessionRepository };

const schema = new Schema<LoginSession>(
  {
    _id: { type: String, required: true },
    expiresAt: { type: Date, expires: 0 },
    isBlocked: { type: Boolean, default: false },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: { updatedAt: false } },
);

const dbModel = model('login-sessions', schema);

const loginSessionRepository = {
  findById: (id: string) => dbModel.findById(id),
  insertOne: (data: LoginSession) => dbModel.create(data),
  deleteById: (_id: string) => dbModel.deleteOne({ _id }),
  deleteByUserId: (userId: string) => dbModel.deleteMany({ userId }),
};
