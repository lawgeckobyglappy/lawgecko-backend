import { User } from 'shared/types';

import mongoose, { FilterQuery, QueryOptions } from 'mongoose';

export { userRepository };

const userSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true },
		email: { type: String, index: true, required: true },
		firstName: { type: String, required: true },
		accountStatus: { type: String },
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

const model = mongoose.model('users', userSchema);

const userRepository = {
	insertOne: (data: User) => model.create<User>(data),
	countDocuments: (query: FilterQuery<User>) => model.countDocuments(query),
	find: (query: any, options: QueryOptions<User> = {}) => {
		return model.find<User>(query, undefined, options);
	},
	findById: (id: string) => model.findById<User>(id),
	findOne: (query: FilterQuery<User> = {}) => model.findOne(query),
	updateOne: (query: FilterQuery<User> = {}, updates: Partial<User>) => {
		return model.findOneAndUpdate(query, { $set: updates }, { new: true });
	},
	deleteOne: (query: FilterQuery<User>) => model.findOneAndDelete(query),
	deleteMany: (query: FilterQuery<User>) => model.deleteMany(query),
};
