import { FilterQuery, QueryOptions } from 'mongoose';

import { Question } from '../../types';

import { dbModel } from './db-model';

export { questionRepository };

const questionRepository = {
  insertOne: async (data: Question) => {
    const res = await dbModel.create(data);

    return (res as any)._doc as Question;
  },
  insertMany: (Questions: Question[]) => dbModel.insertMany(Questions),
  find: (
    query: FilterQuery<Question> = {},
    options?: QueryOptions<Question>,
  ) => {
    return dbModel.find(query, undefined, options).lean();
  },
  findById: (id: string) => dbModel.findById(id).lean(),
  findOne: (query: FilterQuery<Question> = {}) => dbModel.findOne(query).lean(),
  findByPhoneNumber: (phoneNumber: string) =>
    dbModel.findOne({ phoneNumber }).lean(),
  updateOne: (
    query: FilterQuery<Question> = {},
    updates: Partial<Question>,
  ) => {
    return dbModel.updateOne(query, { $set: updates }, { new: true }).lean();
  },
  deleteOne: (query: FilterQuery<Question>) => dbModel.findOneAndDelete(query),
  deleteMany: (query: FilterQuery<Question>) => dbModel.deleteMany(query),
};
