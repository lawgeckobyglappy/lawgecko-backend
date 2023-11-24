import { FilterQuery, QueryOptions } from 'mongoose';

import { Assessment } from '../../types';

import { dbModel } from './db-model';

export { assessmentRepository };

const assessmentRepository = {
  insertOne: async (data: Assessment) => {
    const res = await dbModel.create(data);

    return (res as any)._doc as Assessment;
  },
  insertMany: (assessments: Assessment[]) => dbModel.insertMany(assessments),
  find: (
    query: FilterQuery<Assessment> = {},
    options?: QueryOptions<Assessment>,
  ) => {
    return dbModel.find(query, undefined, options).lean();
  },
  findById: (id: string) => dbModel.findById(id).lean(),
  findOne: (query: FilterQuery<Assessment> = {}) =>
    dbModel.findOne(query).lean(),
  findByPhoneNumber: (phoneNumber: string) =>
    dbModel.findOne({ phoneNumber }).lean(),
  updateOne: (
    query: FilterQuery<Assessment> = {},
    updates: Partial<Assessment>,
  ) => {
    return dbModel.updateOne(query, { $set: updates }, { new: true }).lean();
  },
  deleteOne: (query: FilterQuery<Assessment>) =>
    dbModel.findOneAndDelete(query),
  deleteMany: (query: FilterQuery<Assessment>) => dbModel.deleteMany(query),
};
