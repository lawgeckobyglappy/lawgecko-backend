import { FilterQuery, Schema, model } from 'mongoose';

import { SecurityAdminInvitation } from '../types';

export { SecurityAdminInvitationRepo };

const schema = new Schema<SecurityAdminInvitation>(
  {
    _id: { type: String, required: true },
    details: { type: Object, default: null },
    changesRequested: { type: Object, default: null },
    createdBy: { type: String },
    email: { type: String },
    name: { type: String },
    token: { type: String },
  },
  { timestamps: true },
);

schema.clearIndexes();

const dbModel = model('security-admin-invitations', schema);

const SecurityAdminInvitationRepo = {
  find: () => dbModel.find().lean(),
  findByEmail: (email: string) => dbModel.findOne({ email }).lean(),
  findById: (id: string) => dbModel.findById(id).lean(),
  findByToken: (token: SecurityAdminInvitation['token']) =>
    dbModel.findOne({ token }).lean(),
  insertOne: async (data: SecurityAdminInvitation) => {
    const res = await dbModel.create(data);

    return (res as any)._doc as SecurityAdminInvitation;
  },
  updateOne: (
    query: FilterQuery<SecurityAdminInvitation> = {},
    updates: Partial<SecurityAdminInvitation>,
  ) => {
    return dbModel
      .findOneAndUpdate(query, { $set: updates }, { new: true })
      .lean() as Promise<SecurityAdminInvitation>;
  },
  deleteById: (_id: string) => dbModel.deleteOne({ _id }).lean(),
};
