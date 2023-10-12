import { Schema, model } from 'mongoose';
import { User } from '@types';

export { dbModel };

const userSchema = new Schema<User>(
  {
    _id: { type: String, required: true },
    accountStatus: { type: String },
    authProviders: { default: [], type: Array },
    email: { type: String, index: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'user'],
      default: 'user',
    },
    username: { type: String, default: '', index: true },
  },
  { timestamps: true },
);

const dbModel = model('users', userSchema);
