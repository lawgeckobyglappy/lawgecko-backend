import { FilterQuery, QueryOptions } from 'mongoose';

import { User } from 'shared/types';
import { dbModel } from './db-model';

export { userRepository };

const userRepository = {
	insertOne: (data: User) => dbModel.create<User>(data),
	find: (query: any, options: QueryOptions<User> = {}) => {
		return dbModel.find<User>(query, undefined, options);
	},
	findById: (id: string) => dbModel.findById<User>(id),
	findOne: (query: FilterQuery<User> = {}) => dbModel.findOne<User>(query),
	updateOne: (query: FilterQuery<User> = {}, updates: Partial<User>) => {
		return dbModel.findOneAndUpdate<User>(
			query,
			{ $set: updates },
			{ new: true },
		);
	},
	deleteOne: (query: FilterQuery<User>) => dbModel.findOneAndDelete(query),
	deleteMany: (query: FilterQuery<User>) => dbModel.deleteMany(query),
};
