import { FilterQuery, QueryOptions } from 'mongoose';

import { User } from '../../../../shared/types';

import { dbModel } from './db-model';

export { userRepository };

const userRepository = {
	insertOne: async (data: User) => {
		const res = await dbModel.create(data);

		return (res as any)._doc as User;
	},
	find: (query: FilterQuery<User> = {}, options?: QueryOptions<User>) => {
		return dbModel.find(query, undefined, options).lean();
	},
	findById: (id: string) => dbModel.findById(id).lean(),
	findOne: (query: FilterQuery<User> = {}) => dbModel.findOne(query).lean(),
	updateOne: (query: FilterQuery<User> = {}, updates: Partial<User>) => {
		return dbModel.updateOne(query, { $set: updates }, { new: true }).lean();
	},
	deleteOne: (query: FilterQuery<User>) => dbModel.findOneAndDelete(query),
	deleteMany: (query: FilterQuery<User>) => dbModel.deleteMany(query),
};
