import { Schema, model } from 'mongoose';

import { User, UserRolesList } from '@types';

export { dbModel };

const userSchema = new Schema<User>(
  {
    _id: { type: String, required: true },
    accountStatus: { type: String },
    authProviders: { default: [], type: Array },
    email: { type: String, index: true, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true, index: true, unique: true },
    role: { type: String, enum: UserRolesList, default: 'user' },
    username: { type: String, default: '', index: true, unique: true },
  },
  { timestamps: true },
);

const dbModel = model('users', userSchema);
