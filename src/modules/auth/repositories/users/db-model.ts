import { Schema, model } from 'mongoose';

import { User, UserRoles, UserRolesList } from '@types';

export { dbModel };

const userSchema = new Schema<User>(
  {
    _id: { type: String, required: true },
    accountStatus: { type: String },
    authProviders: { default: [], type: Array },
    bio: { default: "", type: String},
    email: { type: String, index: true, required: true, unique: true },
    firstName: { type: String, required: true },
    governmentID: { default: "", type: String},
    lastName: { type: String, default: '' },
    phoneNumber: { type: String, index: true },
    profilePicture: { default: "", type: String},
    role: { type: String, enum: UserRolesList, default: UserRoles.USER },
    username: { type: String, default: '', index: true, unique: true },
  },
  { timestamps: true },
);

const dbModel = model('users', userSchema);
